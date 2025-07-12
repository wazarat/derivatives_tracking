import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_session
from app.models import User
from app.services.email_service import email_service, EmailRecipient
from app.workers.coinmarketcap_worker import CoinMarketCapWorker

# Configure logging
logger = logging.getLogger(__name__)

class EmailScheduler:
    """Scheduler for sending automated emails"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.coinmarketcap_worker = CoinMarketCapWorker()
    
    def start(self):
        """Start the email scheduler"""
        # Schedule welcome emails - check every hour for new users
        self.scheduler.add_job(
            self.send_welcome_emails,
            CronTrigger(hour='*/1'),  # Every hour
            id='welcome_emails',
            replace_existing=True
        )
        
        # Schedule inactivity emails - run daily at 10:00 AM
        self.scheduler.add_job(
            self.send_inactivity_emails,
            CronTrigger(hour=10, minute=0),  # 10:00 AM
            id='inactivity_emails',
            replace_existing=True
        )
        
        # Schedule weekly news emails - run every Monday at 9:00 AM
        self.scheduler.add_job(
            self.send_weekly_news_emails,
            CronTrigger(day_of_week='mon', hour=9, minute=0),  # Monday at 9:00 AM
            id='weekly_news_emails',
            replace_existing=True
        )
        
        # Start the scheduler
        self.scheduler.start()
        logger.info("Email scheduler started")
    
    def shutdown(self):
        """Shutdown the email scheduler"""
        self.scheduler.shutdown()
        logger.info("Email scheduler shutdown")
    
    async def send_welcome_emails(self):
        """Send welcome emails to new users who haven't received one yet"""
        try:
            async for session in get_async_session():
                # Find users who registered in the last hour and haven't received a welcome email
                one_hour_ago = datetime.utcnow() - timedelta(hours=1)
                query = select(User).where(
                    User.created_at >= one_hour_ago,
                    User.welcome_email_sent == False
                )
                
                result = await session.execute(query)
                new_users = result.scalars().all()
                
                for user in new_users:
                    # Create recipient
                    recipient = EmailRecipient(
                        email=user.email,
                        name=user.name,
                        user_id=str(user.id)
                    )
                    
                    # Send welcome email
                    success = await email_service.send_welcome_email(recipient)
                    
                    if success:
                        # Update user record
                        user.welcome_email_sent = True
                        user.last_email_sent_at = datetime.utcnow()
                        await session.commit()
                        logger.info(f"Welcome email sent to user {user.id}")
                    else:
                        logger.error(f"Failed to send welcome email to user {user.id}")
                
                logger.info(f"Processed welcome emails for {len(new_users)} new users")
                
        except Exception as e:
            logger.error(f"Error sending welcome emails: {str(e)}")
    
    async def send_inactivity_emails(self):
        """Send inactivity emails to users who haven't logged in for 30 days"""
        try:
            async for session in get_async_session():
                # Find users who haven't logged in for 30 days and haven't received an inactivity email in the last 30 days
                thirty_days_ago = datetime.utcnow() - timedelta(days=30)
                query = select(User).where(
                    User.last_login < thirty_days_ago,
                    (User.last_email_sent_at < thirty_days_ago) | (User.last_email_sent_at.is_(None))
                )
                
                result = await session.execute(query)
                inactive_users = result.scalars().all()
                
                for user in inactive_users:
                    # Calculate days inactive
                    days_inactive = (datetime.utcnow() - user.last_login).days
                    
                    # Create recipient
                    recipient = EmailRecipient(
                        email=user.email,
                        name=user.name,
                        user_id=str(user.id)
                    )
                    
                    # Send inactivity email
                    success = await email_service.send_inactivity_email(recipient, days_inactive)
                    
                    if success:
                        # Update user record
                        user.last_email_sent_at = datetime.utcnow()
                        await session.commit()
                        logger.info(f"Inactivity email sent to user {user.id} (inactive for {days_inactive} days)")
                    else:
                        logger.error(f"Failed to send inactivity email to user {user.id}")
                
                logger.info(f"Processed inactivity emails for {len(inactive_users)} users")
                
        except Exception as e:
            logger.error(f"Error sending inactivity emails: {str(e)}")
    
    async def send_weekly_news_emails(self):
        """Send weekly news emails to all subscribed users"""
        try:
            # Get trending coins from CoinMarketCap
            trending_coins = await self.coinmarketcap_worker.get_top_cryptocurrencies(limit=5)
            
            # Create news items from trending coins
            news_items = []
            if trending_coins:
                for coin in trending_coins[:5]:  # Top 5 trending coins
                    news_items.append({
                        'title': f"Trending: {coin.get('name', 'Unknown')} ({coin.get('symbol', 'N/A')})",
                        'summary': f"{coin.get('name', 'Unknown')} is trending on CoinMarketCap with a market cap rank of {coin.get('cmc_rank', 'N/A')}.",
                        'url': f"https://coinmarketcap.com/currencies/{coin.get('slug', coin.get('symbol', 'bitcoin').lower())}"
                    })
            
            # Add some general market news
            news_items.append({
                'title': "Weekly Market Recap",
                'summary': "Check out the latest market movements and analysis on the CanHav dashboard.",
                'url': "https://canhav.io/dashboard"
            })
            
            news_items.append({
                'title': "New Feature: AI Research Assistant",
                'summary': "Our new AI-powered research assistant can help you understand crypto concepts and market trends.",
                'url': "https://canhav.io/research"
            })
            
            async for session in get_async_session():
                # Find all users who are subscribed to news emails
                query = select(User).where(User.news_email_subscribed == True)
                
                result = await session.execute(query)
                subscribed_users = result.scalars().all()
                
                # Create recipients list
                recipients = []
                for user in subscribed_users:
                    recipients.append(EmailRecipient(
                        email=user.email,
                        name=user.name,
                        user_id=str(user.id)
                    ))
                
                if recipients:
                    # Send news email to all recipients
                    success = await email_service.send_news_update_email(recipients, news_items)
                    
                    if success:
                        # Update user records
                        for user in subscribed_users:
                            user.last_email_sent_at = datetime.utcnow()
                        await session.commit()
                        logger.info(f"Weekly news email sent to {len(recipients)} users")
                    else:
                        logger.error("Failed to send weekly news email")
                else:
                    logger.info("No users subscribed to news emails")
                
        except Exception as e:
            logger.error(f"Error sending weekly news emails: {str(e)}")

# Create a singleton instance
email_scheduler = EmailScheduler()

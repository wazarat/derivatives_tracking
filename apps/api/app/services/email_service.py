import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Personalization
from pydantic import BaseModel, EmailStr

# Configure logging
logger = logging.getLogger(__name__)

class EmailRecipient(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class EmailService:
    """Service for sending emails using SendGrid"""
    
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("EMAIL_FROM", "noreply@canhav.io")
        self.from_name = os.getenv("EMAIL_FROM_NAME", "CanHav")
        
        if not self.api_key:
            logger.warning("SendGrid API key not configured. Email sending will be disabled.")
    
    def _create_mail(self, subject: str, html_content: str, recipients: List[EmailRecipient]) -> Mail:
        """Create a SendGrid Mail object"""
        mail = Mail()
        mail.from_email = Email(self.from_email, self.from_name)
        mail.subject = subject
        
        # Add personalization for each recipient
        for recipient in recipients:
            personalization = Personalization()
            personalization.add_to(To(recipient.email, recipient.name))
            
            # Add custom fields if metadata is provided
            if recipient.metadata:
                for key, value in recipient.metadata.items():
                    personalization.add_dynamic_template_data(key, value)
            
            mail.add_personalization(personalization)
        
        # Add content
        mail.add_content(Content("text/html", html_content))
        
        return mail
    
    async def send_email(self, subject: str, html_content: str, recipients: List[EmailRecipient]) -> bool:
        """Send an email to one or more recipients"""
        if not self.api_key:
            logger.warning("Cannot send email: SendGrid API key not configured")
            return False
        
        try:
            mail = self._create_mail(subject, html_content, recipients)
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(mail)
            
            logger.info(f"Email sent to {len(recipients)} recipients. Status code: {response.status_code}")
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    async def send_welcome_email(self, recipient: EmailRecipient) -> bool:
        """Send a welcome email to a new user"""
        subject = "Welcome to CanHav!"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4a6cf7;">Welcome to CanHav!</h1>
            <p>Hello {recipient.name or 'there'},</p>
            <p>Thank you for joining CanHav, your advanced crypto analytics and portfolio management platform.</p>
            <p>Here's what you can do with CanHav:</p>
            <ul>
                <li>Track cryptocurrency markets in real-time</li>
                <li>Create and manage your watchlist</li>
                <li>Analyze your portfolio with our risk gauge</li>
                <li>Get insights from our AI-powered research assistant</li>
            </ul>
            <p>If you have any questions or feedback, don't hesitate to reach out to our team.</p>
            <p>Happy trading!</p>
            <p>The CanHav Team</p>
        </div>
        """
        
        return await self.send_email(subject, html_content, [recipient])
    
    async def send_inactivity_email(self, recipient: EmailRecipient, days_inactive: int) -> bool:
        """Send an email to a user who has been inactive for a while"""
        subject = "We miss you at CanHav!"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4a6cf7;">We miss you!</h1>
            <p>Hello {recipient.name or 'there'},</p>
            <p>It's been {days_inactive} days since you last visited CanHav. The crypto market waits for no one!</p>
            <p>Here's what you've missed:</p>
            <ul>
                <li>Real-time market data from dYdX and Hyperliquid</li>
                <li>New portfolio analysis features</li>
                <li>Our AI-powered research assistant</li>
            </ul>
            <p>Come back and check out the latest updates to help you stay on top of your crypto investments.</p>
            <p>The CanHav Team</p>
        </div>
        """
        
        return await self.send_email(subject, html_content, [recipient])
    
    async def send_news_update_email(self, recipients: List[EmailRecipient], news_items: List[Dict[str, Any]]) -> bool:
        """Send a news update email to multiple users"""
        subject = "CanHav Weekly Crypto Update"
        
        # Create news items HTML
        news_html = ""
        for item in news_items:
            news_html += f"""
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333;">{item.get('title', 'News Update')}</h3>
                <p>{item.get('summary', '')}</p>
                {f'<a href="{item.get("url")}" style="color: #4a6cf7;">Read more</a>' if item.get('url') else ''}
            </div>
            """
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4a6cf7;">Weekly Crypto Update</h1>
            <p>Hello there,</p>
            <p>Here are this week's top crypto news and market updates:</p>
            
            {news_html}
            
            <p>Stay informed and make better trading decisions with CanHav.</p>
            <p>The CanHav Team</p>
            <p style="font-size: 12px; color: #999;">
                You're receiving this email because you subscribed to news updates from CanHav.
                <a href="#unsubscribe" style="color: #999;">Unsubscribe</a>
            </p>
        </div>
        """
        
        return await self.send_email(subject, html_content, recipients)

# Create a singleton instance
email_service = EmailService()

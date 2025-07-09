{{ ... }}

class Watchlist(Base):
    """Watchlist model for storing user's watchlist items"""
    __tablename__ = "watchlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    symbol = Column(String, nullable=False)
    usd_value = Column(Numeric(precision=18, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'symbol', name='uq_watchlist_user_symbol'),
    )
    
    def __repr__(self):
        return f"<Watchlist(id={self.id}, user_id={self.user_id}, symbol={self.symbol}, usd_value={self.usd_value})>"
{{ ... }}

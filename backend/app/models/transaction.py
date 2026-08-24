from datetime import datetime

from pydantic import BaseModel


class Transaction(BaseModel):
    transaction_id: str
    business_id: str
    amount: float
    timestamp: datetime
    payee: str
    payment_type: str
    device_id: str
    location: str
    is_new_payee: bool
    is_new_device: bool
    historical_avg_amount: float
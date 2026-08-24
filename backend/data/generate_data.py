import random
from datetime import datetime, timedelta

import pandas as pd


random.seed(42)

businesses = [
    ("B001", "Harper Supplies"),
    ("B002", "Southern Manufacturing"),
    ("B003", "Melbourne Office Solutions"),
    ("B004", "Pacific Retail Group"),
    ("B005", "Brighton Construction"),
]

payment_types = ["BANK_TRANSFER", "BPAY", "DIRECT_DEBIT"]
locations = ["Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide"]

rows = []

for i in range(1000):
    business_id, _ = random.choice(businesses)

    historical_avg = random.randint(500, 5000)

    amount = max(
        50,
        random.gauss(historical_avg, historical_avg * 0.25),
    )

    hour = random.randint(8, 18)

    rows.append(
        {
            "transaction_id": f"TXN{i + 1:05d}",
            "business_id": business_id,
            "amount": round(amount, 2),
            "timestamp": (
                datetime.now()
                - timedelta(days=random.randint(0, 90))
            ).replace(
                hour=hour,
                minute=random.randint(0, 59),
                second=0,
                microsecond=0,
            ),
            "payee": f"Payee_{random.randint(1, 100):03d}",
            "payment_type": random.choice(payment_types),
            "device_id": f"DEV_{random.randint(1, 20):03d}",
            "location": random.choice(locations),
            "is_new_payee": random.random() < 0.08,
            "is_new_device": random.random() < 0.05,
            "historical_avg_amount": historical_avg,
        }
    )


# Add deliberately suspicious transactions.
for i in range(20):
    business_id, _ = random.choice(businesses)
    historical_avg = random.randint(1000, 5000)

    rows.append(
        {
            "transaction_id": f"TXN_SUSP_{i + 1:03d}",
            "business_id": business_id,
            "amount": round(historical_avg * random.uniform(5, 10), 2),
            "timestamp": datetime.now().replace(
                hour=random.choice([1, 2, 3, 4]),
                minute=random.randint(0, 59),
                second=0,
                microsecond=0,
            ),
            "payee": f"Payee_{random.randint(101, 150):03d}",
            "payment_type": "BANK_TRANSFER",
            "device_id": f"DEV_{random.randint(21, 30):03d}",
            "location": random.choice(locations),
            "is_new_payee": True,
            "is_new_device": True,
            "historical_avg_amount": historical_avg,
        }
    )


df = pd.DataFrame(rows)

df.to_csv("data/transactions.csv", index=False)

print(f"Generated {len(df)} transactions.")
print("Saved to data/transactions.csv")
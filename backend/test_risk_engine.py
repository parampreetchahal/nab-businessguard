import pandas as pd

from app.services.risk_engine import RiskEngine


df = pd.read_csv("data/transactions.csv")

engine = RiskEngine(df)

transaction = df.iloc[-1].to_dict()

result = engine.analyze(transaction)

print("\nRisk Analysis")
print("-------------")
print(f"Transaction: {result['transaction_id']}")
print(f"Risk Score: {result['risk_score']}")
print(f"Risk Level: {result['risk_level']}")
print(f"ML Score: {result['ml_anomaly_score']}")

print("\nReasons:")

for reason in result["reasons"]:
    print(f"- {reason}")
import pandas as pd
from sklearn.ensemble import IsolationForest


class RiskEngine:
    def __init__(self, data: pd.DataFrame):
        self.data = data.copy()

        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42,
        )

        self._train()

    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        features = pd.DataFrame(index=df.index)

        features["amount_ratio"] = (
            df["amount"] / df["historical_avg_amount"]
        )

        features["new_payee"] = df["is_new_payee"].astype(int)

        features["new_device"] = df["is_new_device"].astype(int)

        features["transaction_hour"] = pd.to_datetime(
            df["timestamp"]
        ).dt.hour

        return features

    def _train(self):
        features = self._prepare_features(self.data)

        self.model.fit(features)

    def analyze(self, transaction: dict) -> dict:
        df = pd.DataFrame([transaction])

        features = self._prepare_features(df)

        prediction = self.model.predict(features)[0]
        anomaly_score = self.model.decision_function(features)[0]

        risk_score = 0
        reasons = []

        amount_ratio = features["amount_ratio"].iloc[0]
        new_payee = features["new_payee"].iloc[0]
        new_device = features["new_device"].iloc[0]
        hour = features["transaction_hour"].iloc[0]

        # Domain rules

        if amount_ratio >= 5:
            risk_score += 30
            reasons.append(
                "Transaction amount is significantly higher "
                "than the historical average"
            )

        elif amount_ratio >= 2:
            risk_score += 15
            reasons.append(
                "Transaction amount is higher than the "
                "historical average"
            )

        if new_payee:
            risk_score += 20
            reasons.append("New beneficiary")

        if new_device:
            risk_score += 15
            reasons.append("New device")

        if hour < 6 or hour > 22:
            risk_score += 15
            reasons.append("Transaction occurred at an unusual time")

        # ML anomaly

        if prediction == -1:
            risk_score += 20
            reasons.append("Transaction behaviour is anomalous")

        risk_score = min(risk_score, 100)

        if risk_score >= 70:
            risk_level = "HIGH"
        elif risk_score >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "transaction_id": transaction["transaction_id"],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "reasons": reasons,
            "ml_anomaly_score": round(float(anomaly_score), 4),
        }

    def analyze_all(self) -> list[dict]:
        results = []

        for _, row in self.data.iterrows():
            result = self.analyze(row.to_dict())
            results.append(result)

        return results
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.transaction import Transaction
from app.services.risk_engine import RiskEngine


app = FastAPI(
    title="NAB BusinessGuard API",
    description="AI-assisted SME payment risk detection prototype",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://nab-businessguard.vercel.app",
    ],
    allow_origin_regex=r"https://nab-businessguard-[a-z0-9-]+-parampreetchahals-projects\.vercel\.app",


DATA_PATH = Path("data/transactions.csv")

transactions_df = pd.read_csv(DATA_PATH)

risk_engine = RiskEngine(transactions_df)

# Cache risk analysis so we don't recalculate 1,020 transactions
# on every API request.
transaction_results = None


def get_transaction_results():
    global transaction_results

    if transaction_results is None:
        results = risk_engine.analyze_all()

        transaction_results = []

        for result in results:
            transaction = transactions_df[
                transactions_df["transaction_id"] == result["transaction_id"]
            ]

            if transaction.empty:
                continue

            transaction_data = transaction.iloc[0].to_dict()
            transaction_data.update(result)

            transaction_results.append(transaction_data)

    return transaction_results


@app.get("/")
def root():
    return {
        "name": "NAB BusinessGuard",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "transactions_loaded": len(transactions_df),
    }


@app.get("/transactions")
def get_transactions(
    risk_level: str | None = None,
    page: int = 1,
    limit: int = 25,
):
    if page < 1:
        raise HTTPException(
            status_code=400,
            detail="page must be greater than 0",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="limit must be between 1 and 100",
        )

    transactions = get_transaction_results()

    # Filter by risk level
    if risk_level:
        risk_level = risk_level.upper()

        if risk_level not in {"HIGH", "MEDIUM", "LOW"}:
            raise HTTPException(
                status_code=400,
                detail="risk_level must be HIGH, MEDIUM, or LOW",
            )

        transactions = [
            transaction
            for transaction in transactions
            if transaction["risk_level"] == risk_level
        ]

    # Show highest-risk transactions first
    risk_priority = {
        "HIGH": 3,
        "MEDIUM": 2,
        "LOW": 1,
    }

    transactions = sorted(
        transactions,
        key=lambda transaction: (
            risk_priority[transaction["risk_level"]],
            transaction["risk_score"],
        ),
        reverse=True,
    )

    total = len(transactions)
    total_pages = max(1, (total + limit - 1) // limit)

    # Prevent requesting a page that doesn't exist
    if page > total_pages:
        page = total_pages

    start = (page - 1) * limit
    end = start + limit

    return {
        "transactions": transactions[start:end],
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }

@app.get("/transactions/{transaction_id}")
def get_transaction(transaction_id: str):
    transaction = transactions_df[
        transactions_df["transaction_id"] == transaction_id
    ]

    if transaction.empty:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    transaction_data = transaction.iloc[0].to_dict()

    # Add risk analysis to the transaction details.
    results = get_transaction_results()

    risk_result = next(
        (
            result
            for result in results
            if result["transaction_id"] == transaction_id
        ),
        None,
    )

    if risk_result:
        transaction_data.update(risk_result)

    return transaction_data


@app.get("/businesses")
def get_businesses():
    results = get_transaction_results()

    businesses = {}

    for transaction in results:
        business_id = transaction["business_id"]

        if business_id not in businesses:
            businesses[business_id] = {
                "business_id": business_id,
                "total_transactions": 0,
                "total_value": 0,
                "high_risk": 0,
                "medium_risk": 0,
                "low_risk": 0,
            }

        business = businesses[business_id]

        business["total_transactions"] += 1
        business["total_value"] += float(transaction["amount"])

        risk_level = transaction["risk_level"]

        if risk_level == "HIGH":
            business["high_risk"] += 1
        elif risk_level == "MEDIUM":
            business["medium_risk"] += 1
        else:
            business["low_risk"] += 1

    for business in businesses.values():
        business["total_value"] = round(business["total_value"], 2)

    return list(businesses.values())



@app.get("/businesses/{business_id}/summary")
def business_summary(business_id: str):
    business_transactions = transactions_df[
        transactions_df["business_id"] == business_id
    ]

    if business_transactions.empty:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )

    results = get_transaction_results()

    business_risks = [
        result
        for result in results
        if result["business_id"] == business_id
    ]

    risk_counts = {
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
    }

    for result in business_risks:
        risk_counts[result["risk_level"]] += 1

    total_value = business_transactions["amount"].sum()

    return {
        "business_id": business_id,
        "total_transactions": len(business_transactions),
        "total_value": round(float(total_value), 2),
        "average_transaction": round(
            float(business_transactions["amount"].mean()), 2
        ),
        "high_risk_transactions": risk_counts["HIGH"],
        "medium_risk_transactions": risk_counts["MEDIUM"],
        "low_risk_transactions": risk_counts["LOW"],
    }

@app.get("/businesses/{business_id}/transactions")
def get_business_transactions(
    business_id: str,
    risk_level: str | None = None,
):
    transactions = get_transaction_results()

    business_transactions = [
        transaction
        for transaction in transactions
        if transaction["business_id"] == business_id
    ]

    if not business_transactions:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )

    if risk_level:
        risk_level = risk_level.upper()

        if risk_level not in {"HIGH", "MEDIUM", "LOW"}:
            raise HTTPException(
                status_code=400,
                detail="risk_level must be HIGH, MEDIUM, or LOW",
            )

        business_transactions = [
            transaction
            for transaction in business_transactions
            if transaction["risk_level"] == risk_level
        ]

    return business_transactions


@app.post("/analyze")
def analyze_transaction(transaction: Transaction):
    return risk_engine.analyze(transaction.model_dump())


@app.get("/dashboard/stats")
def dashboard_stats():
    results = get_transaction_results()

    risk_counts = {
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
    }

    for result in results:
        risk_counts[result["risk_level"]] += 1

    return {
        "total_transactions": len(results),
        "high_risk": risk_counts["HIGH"],
        "medium_risk": risk_counts["MEDIUM"],
        "low_risk": risk_counts["LOW"],
        "total_value": round(
            float(transactions_df["amount"].sum()),
            2,
        ),
    }
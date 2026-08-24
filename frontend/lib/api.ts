const API_URL = "http://127.0.0.1:8000";

export async function getDashboardStats() {
  const response = await fetch(`${API_URL}/dashboard/stats`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard statistics");
  }

  return response.json();
}

export async function getTransactions(
  riskLevel?: string,
  page: number = 1,
  limit: number = 25
) {
  const params = new URLSearchParams();

  if (riskLevel) {
    params.set("risk_level", riskLevel);
  }

  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(
    `${API_URL}/transactions?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export async function getBusinessSummary(businessId: string) {
  const response = await fetch(
    `${API_URL}/businesses/${businessId}/summary`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch business summary");
  }

  return response.json();
}

export async function getTransaction(transactionId: string) {
  const response = await fetch(
    `${API_URL}/transactions/${transactionId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transaction");
  }

  return response.json();
}

export async function analyzeTransaction(transaction: unknown) {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze transaction");
  }

  return response.json();
}


export async function getBusinesses() {
  const response = await fetch(`${API_URL}/businesses`);

  if (!response.ok) {
    throw new Error("Unable to fetch businesses");
  }

  return response.json();
}

export async function getBusinessTransactions(
  businessId: string,
  riskLevel?: string
) {
  const url = riskLevel
    ? `${API_URL}/businesses/${businessId}/transactions?risk_level=${riskLevel}`
    : `${API_URL}/businesses/${businessId}/transactions`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch business transactions");
  }

  return response.json();
}
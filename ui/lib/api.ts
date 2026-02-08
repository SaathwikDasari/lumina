export async function optimizePayment(
  amount: number,
  from: string,
  to: string
) {
  const res = await fetch("http://localhost:4000/optimize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, from, to }),
  });

  if (!res.ok) {
    throw new Error("API call failed");
  }

  return res.json();
}

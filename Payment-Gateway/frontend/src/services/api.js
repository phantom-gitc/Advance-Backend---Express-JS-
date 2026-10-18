const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/payments";

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  const data = await response.json();
  return data.products || [];
};

export const createRazorpayOrder = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/${productId}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create Razorpay order");
  }
  return data;
};

export const verifyRazorpayPayment = async (paymentPayload) => {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentPayload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Payment verification failed");
  }
  return data;
};

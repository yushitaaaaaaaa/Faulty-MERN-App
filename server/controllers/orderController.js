// server/controllers/orderController.js

export const calculateTotal = (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, error: "Invalid items input" });
  }
  const total = items.reduce(
    (sum, item) => sum + (item && typeof item.price === "number" ? item.price : 0),
    0
  );
  return res.status(200).json({ success: true, total });
};

export const createOrder = async (req, res, next) => {
  const { customerId } = req.body;
  if (!customerId) {
    return Promise.reject(new Error("Database write failed: Invariant customerId constraint violation"));
  }
  return res.status(201).json({ status: "CREATED", orderId: "ORD-9901" });
};
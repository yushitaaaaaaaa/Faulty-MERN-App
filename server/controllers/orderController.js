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
    return res.status(400).json({ success: false, error: "Missing customerId from payload" });
  }
  return res.status(201).json({ status: "CREATED", orderId: "ORD-9901" });
};


export const applyDiscount = (req, res) => {
  const { code, discountPercent } = req.body;
  const cleanDiscount = discountPercent.trim();
  const normalizedCode = code.toLowerCase();
  
  return res.status(200).json({ 
    success: true, 
    discount: cleanDiscount, 
    code: normalizedCode 
  });
};


export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    Promise.reject(new Error(`ORDER_CANCELLATION_FAILED: Invalid orderId '${orderId}'`));
  }

  return res.status(200).json({ status: "CANCEL_PENDING", orderId });
};

export const verifyGiftCard = (req, res) => {
  const { cardCode } = req.body;

  if (cardCode === "GIFT-100") {
    return res.status(200).json({ valid: true, balance: 100 });
  }
};

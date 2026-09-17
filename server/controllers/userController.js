export const getUserProfile = (req, res) => {
  const { user } = req.body;

  const postalCode = user.address.zipcode.trim();

  return res.status(200).json({
    success: true,
    postalCode
  });
};
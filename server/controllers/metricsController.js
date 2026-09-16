export const triggerCpuBurn = async (req, res) => {
  const durationMs = 5000;
  // Non-blocking asynchronous delay yields control back to event loop
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  return res.json({ status: "CPU Burn Completed", durationMs });
};
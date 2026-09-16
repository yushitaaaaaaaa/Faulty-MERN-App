// Deliberate Defect 3: Blocking CPU loop causing high compute saturation
export const triggerCpuBurn = (req, res) => {
  const durationMs = 5000;
  const start = Date.now();
  // Pegs CPU core at 100% for 5 seconds
  while (Date.now() - start < durationMs) {
    Math.sqrt(Math.random() * Math.random());
  }
  return res.json({ status: "CPU Burn Completed", durationMs });
};
export function computeEffortScore(stats: {
  loginDays: number;
  dashboardOpens: number;
  updates: number;
  streak: number;
}) {
  const loginRatio = Math.min(stats.loginDays / 7, 1);
  const dashboardRatio = Math.min(stats.dashboardOpens / 10, 1);
  const updateRatio = Math.min(stats.updates / 5, 1);
  const consistencyRatio = Math.min(stats.streak / 7, 1);

  const score =
    loginRatio * 40 +
    dashboardRatio * 25 +
    updateRatio * 20 +
    consistencyRatio * 15;

  return Math.round(score);
}

export function getEffortLabel(score: number) {
  if (score >= 85) return "Rất nỗ lực";
  if (score >= 70) return "Nỗ lực tốt";
  if (score >= 50) return "Trung bình";
  return "Cần cố gắng hơn";
}

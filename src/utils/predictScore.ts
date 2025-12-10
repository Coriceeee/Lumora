export function predictScore(tx: number, gk: number, ck: number) {
  if (!tx || !gk || !ck) return ck; // nếu thiếu dữ liệu

  const slope = (ck - tx) / 2;
  const predicted = ck + slope;

  const bounded = Math.max(0, Math.min(10, predicted));
  return Number(bounded.toFixed(2));
}

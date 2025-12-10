export function computeRiskLevel(tx: number, gk: number, ck: number, predicted: number) {
  let riskScore = 0;

  // 1) GK < TX = tụt lần 1
  if (gk < tx) riskScore++;

  // 2) CK < GK = tụt lần 2 (nguy hiểm)
  if (ck < gk) riskScore++;

  // 3) Dự đoán cũng giảm => báo động đỏ
  if (predicted < ck) riskScore++;

  // Trả về mức
  if (riskScore === 0) return { level: "safe", label: "An toàn" };
  if (riskScore === 1) return { level: "watch", label: "Theo dõi" };
  if (riskScore === 2) return { level: "medium", label: "Nguy cơ trung bình" };
  if (riskScore >= 3) return { level: "high", label: "Nguy cơ cao" };

  return { level: "unknown", label: "Không xác định" };
}

export function buildProgressTimeline(tx: number, gk: number, ck: number, predicted: number) {
  return [
    { label: "TX", score: tx },
    { label: "GK", score: gk },
    { label: "CK", score: ck },
    { label: "AI dự đoán", score: predicted }
  ];
}

export function getProgressSummary(tx: number, gk: number, ck: number, predicted: number) {
  return {
    diffTX_GK: Number((gk - tx).toFixed(2)),
    diffGK_CK: Number((ck - gk).toFixed(2)),
    diffCK_Pred: Number((predicted - ck).toFixed(2)),
  };
}

// src/utils/sunTime.ts
export const getSunPosition = () => {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  // Góc mặt trời mô phỏng theo thời gian trong ngày
  return (hours / 24) * 2 * Math.PI;
};

export function generateRoadmap(careerName: string) {
  if (careerName === "Công nghệ thông tin") {
    return [
      { week: "1–2", task: "Ôn lại kiến thức lập trình cơ bản. Chọn 1 ngôn ngữ để bắt đầu (JS/Python)." },
      { week: "3–4", task: "Luyện giải thuật toán đơn giản. Làm 10 bài trên trang luyện code." },
      { week: "5–6", task: "Tạo dự án web nhỏ hoặc app đơn giản để thực hành." },
      { week: "7–8", task: "Học Git, quản lý version code. Đẩy sản phẩm lên GitHub." },
      { week: "9–12", task: "Nâng cấp kỹ năng UI/UX. Chuẩn bị Portfolio cá nhân." }
    ];
  }

  if (careerName === "Marketing") {
    return [
      { week: "1–2", task: "Thực hành viết 10 bài content theo trend. Phân tích đối tượng mục tiêu." },
      { week: "3–4", task: "Học sử dụng Canva & tạo ấn phẩm truyền thông." },
      { week: "5–6", task: "Thực hành chạy quảng cáo thử nghiệm bằng công cụ giả lập." },
      { week: "7–8", task: "Nghiên cứu 3 case study thương hiệu. Phân tích điểm mạnh – yếu." },
      { week: "9–12", task: "Tạo Portfolio cá nhân với sản phẩm thực hành đã làm." }
    ];
  }

  return [];
}

export default function Contact() {
  return (
  
    <div className="contact-container">
      <h2>Liên hệ với chúng tôi</h2>
      <p>Bạn cần hỗ trợ hoặc muốn biết thêm về Lumora? Đừng ngần ngại!</p>

      <form className="contact-form">
        <label htmlFor="name">Họ và tên</label>
        <input type="text" id="name" placeholder="Nguyễn Văn A" />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="email@example.com" />

        <label htmlFor="message">Nội dung</label>
        <textarea id="message" rows={5} placeholder="Bạn muốn hỏi gì?"></textarea>

        <button type="submit">Gửi liên hệ</button>
      </form>

      <div className="contact-info">
        <p><strong>Email:</strong> lumorawebside@gmail.com</p>
        <p><strong>Hotline:</strong> 0915917616 </p>

      </div>
    </div>
  );
}

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Contact.css";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await emailjs.send(
        "service_ols1oal",      // 🔁 thay bằng Service ID
        "template_gm4ymgi",     // 🔁 thay bằng Template ID
        {
          user_name: name,
          user_email: email,
          message,
        },
        "PODvnKNN_iD92K8WV"    // ✅ CHỈ PUBLIC KEY
      );

      toast.success("🎉 Gửi liên hệ thành công!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("❌ Gửi thất bại, vui lòng thử lại!");
    }

    setLoading(false);
  };

  return (
    <div className="contact-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2>Liên hệ với chúng tôi</h2>
      <p>Bạn cần hỗ trợ hoặc muốn biết thêm về Lumora? Đừng ngần ngại!</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>Họ và tên</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />

        <label>Nội dung</label>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Bạn muốn hỏi gì?"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi liên hệ"}
        </button>
      </form>

      <div className="contact-info">
        <p><strong>Email:</strong> lumorawebside@gmail.com</p>
        <p><strong>Hotline:</strong> 0915 917 616</p>
      </div>
    </div>
  );
}

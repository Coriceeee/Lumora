import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSpinner, FaHeart } from "react-icons/fa"; // Đảm bảo bạn cài react-icons
import { callGeminiServer } from "../../../services/gemini";
import "./CloudWhisper.css";

// Kiểu dữ liệu
type CloudItem = {
  id: string;
  title: string;
  content: string;
  likes: number;
};

const classNames = ["cloud1", "cloud2", "cloud3"];  // Đảm bảo các class mây tương ứng đã được tạo trong CSS

// Component chính
export default function CloudWhisper() {
  const [loading, setLoading] = useState(true);
  const [clouds, setClouds] = useState<CloudItem[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<CloudItem | null>(null);  // Thêm trạng thái cho item được chọn
  const [modalOpen, setModalOpen] = useState(false);  // Trạng thái Modal

  const prompt = `
     Bạn là trợ lý tạo thông điệp tích cực dành cho học sinh và sinh viên Việt Nam. 
    Nhiệm vụ của bạn là sinh ra 30 thông điệp ngắn gọn, vui tươi, khích lệ tinh thần học tập, vượt qua áp lực và yêu bản thân.
    
    Yêu cầu:
    - Mỗi thông điệp gồm hai trường: "title" và "content".
    - "title" là một cụm 2–5 từ kèm emoji ở đầu (ví dụ: "🌈 Vững bước lên nhé").
    - "content" là 1–2 câu khích lệ bằng tiếng Việt, tự nhiên, gần gũi, có thể thêm emoji.
    - Phong cách viết tích cực, truyền năng lượng, không sáo rỗng, nhẹ nhàng tích cực như 1 người bạn thật sự, kèm thêm 1 chút đáng yêu.
    - Không lặp lại ý tưởng.
    - Chỉ TRẢ VỀ duy nhất KẾT QUẢ dạng JSON thuần túy, KHÔNG markdown, KHÔNG giải thích, KHÔNG comment.
    
    Cấu trúc JSON mẫu:
    {
      "messages": [
        {
          "title": "🍀 Tin vào bản thân",
          "content": "Bạn nhỏ ơi, bạn làm tốt lắm! 👉 Đừng quên vỗ nhẹ vào vai và nói 'mình tuyệt lắm đó nhé!' 🎉"
        },
        {
          "title": "🌤️ Mỗi ngày một bước",
          "content": "Dù chậm, bạn vẫn đang tiến lên phía trước. Cứ kiên trì nhé 💪"
        }
      ]
    }
  `;

  async function fetchClouds() {
    setLoading(true);
    setError("");

    try {
      const data = await callGeminiServer(prompt);

      const arr = data.messages || [];

      const items = arr.slice(0, 30).map((it: any, i: number) => ({
        id: Math.random().toString(36),
        title: it.title || `🌤️ Đám mây #${i + 1}`,
        content:
          it.content ||
          "Hít thở sâu — bạn tuyệt vời hơn bạn nghĩ đó! 🍀",
        likes: 0,
      }));

      setClouds(items);
    } catch (err: any) {
      console.error("Gemini lỗi:", err);
      setError(err.message || "Không thể tạo thông điệp");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClouds();
  }, []);

  const handleLike = (id: string) => {
    setLiked((prev) => new Set([...prev, id]));
    setClouds((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, likes: c.likes + 1 } : c
      )
    );
  };

  const handleCloudClick = (index: number) => {
    const cloud = clouds[index];
    setSelectedItem(cloud);  // Set item được chọn
    setModalOpen(true);  // Mở Modal
  };

  const closeModal = () => {
    setModalOpen(false);  // Đóng Modal
    setSelectedItem(null);  // Xóa item đã chọn
  };

  return (
    <div
      className="sky"
    >
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          
        </div>
      ) : (
        clouds.map((cloud, index) => {
          const screenHeight = window.innerHeight;
          const positionTop = (Math.random() * 0.5) * screenHeight;
          const size = Math.random() * 400 + 100;
          const className = classNames[Math.floor(Math.random() * classNames.length)];
          const startX = Math.random() * window.innerWidth - window.innerWidth / 2;
          const randomOffset = Math.random() * 200;

          return (
            <motion.div
              key={cloud.id}
              className={className}
              style={{
                width: `${size}px`,
                height: `${size * 0.6}px`,
                top: `${positionTop}px`,
              }}
              initial={{ x: startX }}
              animate={{ x: "-130vw", y: [-positionTop, randomOffset, -randomOffset, 0] }}
              transition={{
                duration: 80 + Math.random() * 40,
                repeat: Infinity,
                ease: "linear",
              }}
              onClick={() => handleCloudClick(index)} // Gọi hàm khi click vào đám mây
            >
              <div className="cloud-title">{cloud.title}</div>
            </motion.div>
          );
        })
      )}

      {modalOpen && selectedItem && (
        <div className="result">
          👉 {selectedItem.content}
          <button
            className="like-button ml-4 text-red-500"
            disabled={liked.has(selectedItem.id)}
          >
          
            {selectedItem.likes || 0}
          </button>
          <button
            className="close-modal"
            onClick={closeModal}
          >
            ✖
          </button>
        </div>
      )}
    </div>
  );
}

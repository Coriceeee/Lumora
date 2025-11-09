import { useEffect, useState, useMemo } from "react";
import { useSprings, animated, SpringValue } from "@react-spring/web";
import { FaSpinner, FaHeart } from "react-icons/fa";
import { callGeminiServer } from "../../../services/gemini";
import "./CloudWhisper.css";

type CloudItem = {
  id: string;
  title: string;
  content: string;
  likes: number;
};

type CloudConfig = {
  top: number;
  size: number;
  className: string;
  startX: number;
};

const classNames = ["cloud1", "cloud2", "cloud3"];

export default function CloudWhisper() {
  const [loading, setLoading] = useState(true);
  const [clouds, setClouds] = useState<CloudItem[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<CloudItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    try {
      const data = await callGeminiServer(prompt);
      const arr = data.messages || [];
      const items = arr.slice(0, 30).map((it: any, i: number) => ({
        id: Math.random().toString(36),
        title: it.title || `🌤️ Đám mây #${i + 1}`,
        content: it.content || "Hít thở sâu — bạn tuyệt vời hơn bạn nghĩ đó! 🍀",
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
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleCloudClick = (index: number) => {
    setSelectedItem(clouds[index]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // ✅ Tạo thông tin tĩnh cho từng đám mây — đây chính là configs
  const configs: CloudConfig[] = useMemo(() => {
    const screenHeight = window.innerHeight;
    return clouds.map(() => ({
      top: Math.random() * 0.5 * screenHeight,
      size: Math.random() * 400 + 100,
      className: classNames[Math.floor(Math.random() * classNames.length)],
      startX: Math.random() * window.innerWidth - window.innerWidth / 2,
    }));
  }, [clouds.length]);

  // ✅ Dùng useSprings để tạo animation
  const springs: { transform: SpringValue<string> }[] = useSprings(
    clouds.length,
    configs.map((cfg) => ({
      from: { transform: `translateX(${cfg.startX}px)` },
      to: async (next: (arg0: { transform: string; }) => any) => {
        while (1) {
          await next({
            transform: `translateX(-130vw) translateY(${
              Math.random() * 100 - 50
            }px)`,
          });
        }
      },
      config: { duration: 100000 },
      reset: true,
    }))
  );

  return (
    <div className="sky">
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          </div>
      ) : (
        springs.map((style, index) => {
          const cloud = clouds[index];
          const cfg = configs[index]; // ✅ lấy giá trị tĩnh tại đây

          return (
            <animated.div
              key={cloud.id}
              className={cfg.className}
              style={{
                ...style,
                width: `${cfg.size}px`,
                height: `${cfg.size * 0.6}px`,
                top: `${cfg.top}px`,
                position: "absolute",
              }}
              onClick={() => handleCloudClick(index)}
            >
              <div className="cloud-title">{cloud.title}</div>
            </animated.div>
          );
        })
      )}

      {modalOpen && selectedItem && (
        <div className="result">
          👉 {selectedItem.content}
          <button
            className="like-button ml-4 text-red-500"
            disabled={liked.has(selectedItem.id)}
            onClick={() => handleLike(selectedItem.id)}
          >
          </button>
        </div>
      )}
    </div>
  );
}

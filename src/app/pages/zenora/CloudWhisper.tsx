import { useEffect, useState, useMemo } from "react";
import { useSprings, animated } from "@react-spring/web";
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
  const [clouds, setClouds] = useState<CloudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<CloudItem | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [hiddenClouds, setHiddenClouds] = useState<Set<string>>(new Set());

  const randomSeed = Math.floor(Math.random() * 100000);
  const prompt = `
      Bạn là trợ lý tạo thông điệp nhẹ nhàng, chữa lành và đầy yêu thương dành cho học sinh và sinh viên Việt Nam.
      Hãy sinh ra 30 thông điệp ngắn gọn, ấm áp, vui tươi, khích lệ tinh thần học tập, vượt qua áp lực và yêu bản thân.
      (Mã yêu cầu: ${randomSeed})
      Yêu cầu:

      Mỗi thông điệp gồm hai trường: "title" và "content".
      "title" là một cụm 2–5 từ kèm emoji ở đầu (ví dụ: "🌸 Bình yên trong lòng").
      "content" là 1–2 câu khích lệ bằng tiếng Việt, nhẹ nhàng, tình cảm và gần gũi, có thể thêm emoji.
      Phong cách viết như lời động viên của một người bạn thân thiết, luôn sẵn sàng ở bên để an ủi và nâng đỡ, truyền cảm hứng và sự an yên, nhưng ngắn gọn thôi.
      Không lặp lại ý tưởng.
      Chỉ TRẢ VỀ JSON THUẦN TÚY, KHÔNG markdown, KHÔNG giải thích, KHÔNG comment.

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
  }`;

  // Hàm gọi Gemini API và lấy dữ liệu
  async function fetchClouds() {
    setLoading(true);
    try {
      const data = await callGeminiServer(prompt, { temperature: 1.3 });

      // Kiểm tra xem dữ liệu trả về có phải là JSON hợp lệ không
      if (typeof data !== 'object' || !Array.isArray(data?.messages)) {
        throw new Error("Gemini trả về không phải JSON hợp lệ.");
      }

      const arr = data.messages;
      if (arr.length === 0) throw new Error("Gemini không trả về dữ liệu hợp lệ");

      const items = arr.slice(0, 30).map((it: any, i: number) => ({
        id: `cloud-${i}`,
        title: it.title || `☁️ Đám mây #${i + 1}`,
        content: it.content || "Bạn tuyệt vời hơn bạn nghĩ đó! 🍀",
        likes: 0,
      }));

      setClouds(items);
    } catch (err: any) {
      console.error("Gemini lỗi:", err);
      setError("Không thể tạo thông điệp từ Gemini, dùng dữ liệu mẫu.");
      setClouds(
        Array.from({ length: 30 }).map((_, i) => ({
          id: `sample-${i}`,
          title: `☁️ Đám mây #${i + 1}`,
          content: "Bạn đang làm rất tốt! Tiếp tục nhé 💖",
          likes: 0,
        }))
      );
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
    const cloud = clouds[index];
    setSelectedItem(cloud);
    setModalOpen(true);
    setHiddenClouds((prev) => new Set([...prev, cloud.id])); // Ẩn đám mây sau khi click

    // Tạo một đám mây mới thay thế
    setClouds((prev) => {
      const newCloud = {
        id: `cloud-${Math.random()}`,
        title: `☁️ Đám mây mới`,
        content: "Cảm ơn bạn đã đồng hành cùng mình! 🍀",
        likes: 0,
      };
      return [...prev.filter((c) => c.id !== cloud.id), newCloud];
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // ⚙️ cấu hình mây ngẫu nhiên
  const configs = useMemo(() => {
    if (typeof window === "undefined") return [];
    const screenHeight = window.innerHeight;
    return clouds.map(() => ({
      top: Math.random() * 0.6 * screenHeight,
      size: Math.random() * 300 + 120,
      className: classNames[Math.floor(Math.random() * classNames.length)],
      startX: Math.random() * window.innerWidth - window.innerWidth / 2,
    }));
  }, [clouds.length]);

  // 🌬️ tạo animation bay
  const [springs] = useSprings(
    clouds.length,
    (i) => {
      const cfg = configs[i];
      return {
        from: { transform: `translateX(${cfg?.startX || 0}px)` },
        to: async (next: any) => {
          while (1) {
            await next({
              transform: `translateX(-160vw) translateY(${Math.random() * 60 - 30}px)`,
            });
          }
        },
        config: { duration: 90000 },
        reset: true,
      };
    },
    // thêm deps để tránh lỗi reference
    [configs]
  );

  return (
    <div className="sky">
      {loading ? (
        <div className="loader">☁️ Đang tạo thông điệp mới...</div>
      ) : (
        springs.map((style, index) => {
          const cloud = clouds[index];
          const cfg = configs[index];
          if (hiddenClouds.has(cloud.id)) return null; // Nếu đám mây đã được ẩn thì không render nó

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
          <p>👉 {selectedItem.content}</p>
          <button
            className="like-button"
            onClick={() => handleLike(selectedItem.id)}
            disabled={liked.has(selectedItem.id)}
          >
            ❤️ {selectedItem.likes || 0}
          </button>
          <button className="close" onClick={closeModal}>
            ✖
          </button>
        </div>
      )}
    </div>
  );
}

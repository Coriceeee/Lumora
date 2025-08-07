import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getDevelopmentSuggestions } from "../../../services/developmentService";

type DevelopmentItem = {
  subject: string;
  level: string;
  goal: string;
  strategies: string[];
};

const DinhHuongPhatTrienPage: React.FC = () => {
  const [data, setData] = useState<DevelopmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const suggestions = await getDevelopmentSuggestions();
        setData(suggestions);
      } catch (err) {
        console.error("❌ Lỗi khi gọi getDevelopmentSuggestions:", err);
        toast.error("Không thể tải định hướng phát triển từ AI.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">
        🚀 Định Hướng Phát Triển Cá Nhân
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 py-10">
          ⏳ Đang phân tích dữ liệu từ AI...
        </p>
      ) : data.length === 0 ? (
        <p className="text-center text-red-500">
          ❌ Không có dữ liệu để hiển thị
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500"
            >
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                📘 {item.subject}
              </h3>
              <p className="text-gray-600">
                🎓 <strong>Trình độ:</strong> {item.level}
              </p>
              <p className="text-gray-600">
                🎯 <strong>Mục tiêu:</strong> {item.goal}
              </p>
              <ul className="mt-2 text-gray-700 list-disc list-inside space-y-1">
                {item.strategies.map((s, i) => (
                  <li key={i}>💡 {s}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DinhHuongPhatTrienPage;

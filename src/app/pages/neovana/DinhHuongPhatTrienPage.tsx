import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Suggestion = {
  job: string;
  reason?: string;
  skillsNeeded?: string[];
  path?: string[];
};

type CareerResponse = {
  careerSuggestions: Suggestion[];
};

interface Props {
  userId?: string; // optional, nếu có auth thì truyền vào
}

export default function DinhHuongPhatTrienPage({ userId = "anon" }: Props) {
  const [strengths, setStrengths] = useState("");
  const [interests, setInterests] = useState("");
  const [personality, setPersonality] = useState("");
  const [dreamJob, setDreamJob] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  useEffect(() => {
    // Thử load lộ trình đã lưu nếu có
    const loadSaved = async () => {
      try {
        const snap = await getDoc(doc(db, "careerPaths", userId));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.suggestions) setSuggestions(data.suggestions as Suggestion[]);
          if (data?.strengths) setStrengths(data.strengths);
          if (data?.interests) setInterests(data.interests);
          if (data?.personality) setPersonality(data.personality);
          if (data?.dreamJob) setDreamJob(data.dreamJob);
        }
      } catch (err) {
        console.warn("Không thể load dữ liệu đã lưu", err);
      }
    };
    loadSaved();
  }, [userId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = { userId, strengths, interests, personality, dreamJob };

      // Gọi API backend của bạn (server sẽ query BigQuery + gọi Gemini + trả về JSON)
      const res = await fetch('/api/career-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: CareerResponse = await res.json();
      setSuggestions(data.careerSuggestions || []);

      // Lưu vào Firestore cho người dùng
      await setDoc(doc(db, 'careerPaths', userId), {
        strengths, interests, personality, dreamJob,
        suggestions: data.careerSuggestions,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dh-wrapper">
      <motion.header
        className="dh-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="dh-title">Định hướng & Phát triển sự nghiệp</h1>
        <p className="dh-sub">Nhập thông tin để nhận lộ trình nghề cá nhân hóa — trực quan, dễ dùng và có thể xuất file.</p>
      </motion.header>

      <main className="dh-main">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="dh-card dh-form"
        >
          <div className="dh-note">Điền ngắn gọn — mình sẽ tạo gợi ý nghề & bước phát triển sao cho rõ ràng.</div>

          <label className="dh-label">Năng lực / Thế mạnh</label>
          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="Ví dụ: tư duy logic, Python, phân tích dữ liệu"
            className="dh-input dh-textarea"
          />

          <label className="dh-label">Sở thích</label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Ví dụ: AI, giáo dục, sản phẩm, thiết kế"
            className="dh-input dh-textarea"
          />

          <div className="dh-row">
            <div style={{ flex: 1 }}>
              <label className="dh-label">Tính cách (tóm tắt)</label>
              <input
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Ví dụ: hướng nội, cầu toàn, thích làm việc nhóm"
                className="dh-input"
              />
            </div>

            <div style={{ width: 18 }} />

            <div style={{ flex: 1 }}>
              <label className="dh-label">Ước mơ / Vị trí mong muốn</label>
              <input
                value={dreamJob}
                onChange={(e) => setDreamJob(e.target.value)}
                placeholder="Ví dụ: Data Scientist tại công ty EdTech"
                className="dh-input"
              />
            </div>
          </div>

          <div className="dh-actions">
            <button
              type="submit"
              disabled={loading}
              className={`dh-btn dh-btn-primary ${loading ? 'is-loading' : ''}`}
            >
              {loading ? <Loader2 className="icon spin" size={16} /> : <CheckCircle size={16} />}
              <span>{loading ? 'Đang tạo lộ trình...' : 'Tạo lộ trình cá nhân'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setStrengths(''); setInterests(''); setPersonality(''); setDreamJob(''); setSuggestions(null); setError(null); }}
              className="dh-btn dh-btn-ghost"
            >
              Xóa
            </button>

            <div className="dh-error">{error}</div>
          </div>

        </motion.form>

        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="dh-card dh-panel"
        >
          <h3 className="panel-title">Bản đồ hành trình</h3>

          {!suggestions && (
            <div className="panel-empty">Chưa có lộ trình. Điền form bên trái và nhấn "Tạo lộ trình cá nhân" để nhận gợi ý.</div>
          )}

          <div className="panel-list">
            {suggestions?.map((s, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="suggestion"
              >
                <div className="suggestion-left">
                  <div className="suggestion-index">{i + 1}</div>
                </div>

                <div className="suggestion-body">
                  <div className="suggestion-head">
                    <h4 className="suggestion-title">{s.job}</h4>
                    <div className="suggestion-skills">{s.skillsNeeded ? s.skillsNeeded.join(', ') : ''}</div>
                  </div>

                  {s.reason && <p className="suggestion-reason">{s.reason}</p>}

                  {s.path && (
                    <ol className="suggestion-path">
                      {s.path.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ol>
                  )}
                </div>
              </motion.article>
            ))}
          </div>

          {suggestions && suggestions.length > 0 && (
            <div className="panel-actions">
              <div className="export-row">
                <button
                  onClick={async () => {
                    const blob = new Blob([JSON.stringify({ strengths, interests, personality, dreamJob, suggestions }, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `career-path-${userId}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="dh-btn dh-btn-outline"
                >
                  Tải JSON
                </button>

                <button
                  onClick={() => window.print()}
                  className="dh-btn dh-btn-outline"
                >
                  In lộ trình
                </button>

                <div className="save-note"><ArrowRight size={16} /> Lưu tự động vào Firestore</div>
              </div>
            </div>
          )}
        </motion.aside>
      </main>

      <style>{`
        :root{
          --bg: #0f1724; /* used for subtle elements */
          --card: #ffffff;
          --muted: #6b7280;
          --accent: #6d28d9; /* indigo */
          --accent-2: #4f46e5;
          --success: #10b981;
          --glass: rgba(255,255,255,0.06);
          --surface: #f8fafc;
        }

        .dh-wrapper{
          max-width: 1000px;
          margin: 28px auto;
          padding: 22px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #0b1020;
        }

        .dh-header{ margin-bottom: 18px; }
        .dh-title{
          font-size: 26px;
          margin: 0 0 6px 0;
          line-height: 1.05;
          letter-spacing: -0.2px;
        }
        .dh-sub{ margin:0; color: var(--muted); font-size: 13px; }

        .dh-main{
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 20px;
          align-items: start;
        }

        /* Card */
        .dh-card{
          background: linear-gradient(180deg, var(--card), #fbfdff);
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(15,23,42,0.04);
        }

        .dh-form{ display:flex; flex-direction:column; gap:12px; }
        .dh-note{ font-size:13px; color:var(--muted); background:var(--glass); padding:10px; border-radius:10px; }

        .dh-label{ font-size:13px; color:#111827; margin-top:6px; margin-bottom:6px; font-weight:600; }
        .dh-input{ width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:transparent; font-size:14px; outline:none; box-shadow:none; transition: box-shadow .18s ease, transform .12s ease; }
        .dh-input:focus{ box-shadow: 0 6px 18px rgba(79,70,229,0.12); transform: translateY(-1px); }

        .dh-textarea{ min-height:84px; resize:vertical; }

        .dh-row{ display:flex; gap:12px; }

        .dh-actions{ display:flex; align-items:center; gap:10px; margin-top:8px; }

        .dh-btn{ display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:12px; font-weight:600; cursor:pointer; border:1px solid rgba(15,23,42,0.06); background:white; transition: transform .12s ease, box-shadow .12s ease; }
        .dh-btn:hover{ transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,23,42,0.06); }
        .dh-btn:active{ transform: translateY(0); }

        .dh-btn-primary{ background: linear-gradient(90deg, var(--accent-2), var(--accent)); color: white; border: none; }
        .dh-btn-primary.is-loading{ opacity:0.9; }

        .dh-btn-ghost{ background:transparent; border:1px dashed rgba(15,23,42,0.06); font-weight:600; }
        .dh-btn-outline{ background:transparent; border:1px solid rgba(15,23,42,0.06); padding:8px 12px; border-radius:10px; }

        .dh-error{ margin-left:auto; color:#e11d48; font-size:13px; }

        .dh-footer-note{ font-size:12px; color:var(--muted); margin-top:10px; }

        /* Panel */
        .dh-panel{ display:flex; flex-direction:column; gap:10px; min-height:220px; }
        .panel-title{ margin:0; font-size:16px; }
        .panel-empty{ color:var(--muted); font-size:13px; }

        .panel-list{ display:flex; flex-direction:column; gap:10px; max-height:520px; overflow:auto; padding-right:6px; }
        .suggestion{ display:flex; gap:12px; align-items:flex-start; padding:12px; background: linear-gradient(180deg, rgba(255,255,255,0.96), #fff); border-radius:12px; border:1px solid rgba(15,23,42,0.03); }

        .suggestion-index{ width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; color: var(--accent-2); background: linear-gradient(180deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); }
        .suggestion-title{ margin:0; font-size:15px; }
        .suggestion-skills{ font-size:13px; color:var(--muted); }
        .suggestion-reason{ margin:8px 0 0 0; font-size:13px; color:#374151; }
        .suggestion-path{ margin:8px 0 0 0; padding-left:18px; color:#374151; }

        .panel-actions{ margin-top:8px; }
        .export-row{ display:flex; gap:10px; align-items:center; }
        .save-note{ margin-left:auto; display:flex; gap:8px; align-items:center; color:var(--muted); font-size:13px; }

        .icon{ vertical-align:middle; }
        .spin{ animation: dh-spin 1s linear infinite; }
        @keyframes dh-spin{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }

        /* Responsive */
        @media (max-width: 980px){
          .dh-main{ grid-template-columns: 1fr; }
          .dh-wrapper{ padding:16px; }
        }

        /* Print tweaks */
        @media print{
          .dh-actions, .panel-actions, .dh-header .dh-sub, .dh-footer-note { display: none; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

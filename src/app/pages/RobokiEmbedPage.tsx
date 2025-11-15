import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

interface LocationState {
  link?: string;
}

export default function RobokiEmbedPage() {
  const { id } = useParams<any>();
  const location = useLocation<LocationState>();
  const link = location.state?.link;

  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setTimeout(() => setFade(true), 150);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", padding: "12px" }}>
      
      <iframe
        src={link ? link : `https://roboki.vn/g/${id}`}
        onLoad={() => setLoading(false)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "16px",
          opacity: fade ? 1 : 0,
          transition: "opacity .5s ease",
          background: "#fff",
        }}
      />
    </div>
  );
}

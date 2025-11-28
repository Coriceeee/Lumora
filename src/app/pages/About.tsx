export default function About() {
  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#f9f9ff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        <strong style={{ color: '#4b0082' }}>Lumora</strong> là{' '}
        <span style={{ color: '#1e90ff', fontWeight: 'bold' }}>
          nền tảng giáo dục ứng dụng trí tuệ nhân tạo
        </span>
        , giúp học sinh THPT:
      </p>

      <ul
        style={{
          paddingLeft: '1.5rem',
          marginTop: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <li>
          <span style={{ color: '#228B22' }}>Hiểu rõ bản thân</span> qua phân
          tích điểm mạnh – điểm yếu.
        </li>
        <li>
          <span style={{ color: '#FF8C00' }}>Cá nhân hóa lộ trình học</span>{' '}
          thông minh, hiệu quả.
        </li>
        <li>
          <span style={{ color: '#FF1493' }}>Giảm áp lực</span> và{' '}
          <span style={{ color: '#20B2AA' }}>cân bằng cảm xúc</span> với trợ lý
          AI ZENORA.
        </li>
        <li>
          <span style={{ color: '#800080' }}>Định hướng nghề nghiệp</span> chuẩn
          xác theo năng lực & sở thích.
        </li>
      </ul>

      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        Được thiết kế như một{' '}
        <strong style={{ color: '#FF4500' }}>
          người bạn đồng hành thông minh
        </strong>
        , Lumora luôn bên bạn trên hành trình chinh phục tương lai. <br />
        <span
          style={{
            backgroundColor: '#ffd700',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
          }}
        >
          Hãy thử ngay – học vui, học đúng hướng, học vì chính bạn!
        </span>
      </p>
    </div>
  );
}

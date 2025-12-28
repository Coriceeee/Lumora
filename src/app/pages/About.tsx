
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  useMediaQuery,
  Fade,
  Slide,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useHistory } from "react-router-dom";

// MUI Icons
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import ExploreIcon from "@mui/icons-material/Explore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

type ModuleKey = "VIREYA" | "NEOVANA" | "ZENORA" | "ROBOKI";

/* ====================== HOOK: reveal theo scroll ====================== */
function useInViewOnce(threshold = 0.18) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ====================== WRAPPER: animation cho section ====================== */
function SectionReveal({
  children,
  variant = "fade",
  timeout = 650,
  threshold = 0.18,
}: {
  children: React.ReactNode;
  variant?: "fade" | "slideUp";
  timeout?: number;
  threshold?: number;
}) {
  const { ref, inView } = useInViewOnce(threshold);

  if (variant === "slideUp") {
    return (
      <div ref={ref}>
        <Slide direction="up" in={inView} timeout={timeout} mountOnEnter>
          <div>{children}</div>
        </Slide>
      </div>
    );
  }

  return (
    <div ref={ref}>
      <Fade in={inView} timeout={timeout}>
        <div>{children}</div>
      </Fade>
    </div>
  );
}

/* ============================= PAGE ============================= */

export default function AboutLumoraPage() {
  const flowRef = useRef<HTMLDivElement | null>(null);

  const scrollToFlow = () => {
    flowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Box sx={{ bgcolor: "#f7f7ff" }}>
      {/* HERO */}
      <Fade in timeout={600}>
        <div>
          <HeroSection onScrollToFlow={scrollToFlow} />
        </div>
      </Fade>

      {/* BENEFITS */}
      <BenefitsSection />

      {/* FLOW – BẮT BUỘC BỌC ref */}
      <div ref={flowRef}>
        <FlowSection />
      </div>

      {/* MODULES */}
      <ModulesSection />

      {/* CTA */}
      <QuoteCTASection />

      {/* FOOTER */}
      <FooterMini />
    </Box>
  );
}


/* ----------------------------- 1) HERO ----------------------------- */

function HeroSection({ onScrollToFlow }: { onScrollToFlow: () => void }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const history = useHistory();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 7, md: 10 },
        background:
          "radial-gradient(1200px 500px at 15% 20%, rgba(99,102,241,0.25), transparent 60%)," +
          "radial-gradient(900px 500px at 85% 30%, rgba(59,130,246,0.22), transparent 55%)," +
          "linear-gradient(135deg, #0b1026 0%, #141a3a 45%, #0b1026 100%)",
        color: "white",
      }}
    >
      {/* decorative blobs */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.25,
          background:
            "radial-gradient(circle at 20% 80%, rgba(236,72,153,0.35), transparent 45%)," +
            "radial-gradient(circle at 80% 70%, rgba(34,197,94,0.28), transparent 40%)",
          filter: "blur(10px)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<StarRoundedIcon />}
                  label="Vũ trụ AI giáo dục toàn diện"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.12)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.18)",
                    "& .MuiChip-icon": { color: "white" },
                  }}
                />
              </Stack>

              <Typography
                variant={isMdUp ? "h2" : "h3"}
                sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.05 }}
              >
                Lumora
              </Typography>

              <Typography
                variant="h6"
                sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 620 }}
              >
                Hiểu năng lực • Chăm sóc cảm xúc • Định hướng tương lai — tất cả
                trong một nền tảng web thông minh dành cho học sinh THPT.
              </Typography>

              <Typography
                sx={{ color: "rgba(255,255,255,0.72)", maxWidth: 640 }}
              >
                Lumora giúp bạn nhìn thấy bức tranh toàn diện về bản thân từ dữ
                liệu học tập và tương tác, để học chủ động và tự tin hơn mỗi
                ngày.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => history.push("/dashboard")}
                  sx={{
                    bgcolor: "#6366f1",
                    "&:hover": { bgcolor: "#5458e6" },
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Khám phá Lumora
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={onScrollToFlow}
                  sx={{
                    borderColor: "rgba(255,255,255,0.35)",
                    color: "white",
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.55)",
                      bgcolor: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  Xem cách Lumora hoạt động
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <MockupCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function MockupCard() {
  return (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "rgba(255, 255, 255, 0.83)",
        border: "1px solid rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 60px rgba(129, 121, 121, 0.65)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
          Snapshot cá nhân hóa
        </Typography>

        <Stack spacing={1.25}>
          <MiniStat label="Học lực" value="Phân tích điểm mạnh/yếu theo môn" />
          <MiniStat
            label="Cảm xúc"
            value="Ghi nhận trạng thái & hỗ trợ tức thời"
          />
          <MiniStat
            label="Định hướng"
            value="Gợi ý nghề nghiệp + lộ trình rõ ràng"
          />
        </Stack>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.16)" }} />

        <Box
          sx={{
            height: 140,
            borderRadius: 3,
            border: "1px dashed rgba(255,255,255,0.25)",
            bgcolor: "rgba(0,0,0,0.12)",
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,0.65)",
            textAlign: "center",
            px: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            (Chỗ này đặt ảnh mockup UI / screenshot Lumora)
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Bạn có thể thay bằng Image/Avatar/Carousel tuỳ ý
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.12)",
        bgcolor: "rgba(255,255,255,0.04)",
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
/* -------------------------- 2) BENEFITS --------------------------- */

function BenefitsSection() {
  return (
    <SectionReveal variant="fade" timeout={700}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.3 }}>
            Lumora giúp bạn làm được gì?
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 760 }}>
            Mọi gợi ý đều hướng tới sự rõ ràng – cá nhân hóa – dễ thực hiện, để bạn
            “học đúng hướng” thay vì chỉ “học thật nhiều”.
          </Typography>
        </Stack>

        <Grid container spacing={2.5} sx={{ mt: 2 }}>
          {[
            {
              icon: <AutoGraphIcon />,
              title: "Hiểu năng lực học tập",
              desc: "Phân tích điểm mạnh – điểm yếu và theo dõi tiến trình học theo dữ liệu thật.",
            },
            {
              icon: <ExploreIcon />,
              title: "Định hướng nghề nghiệp",
              desc: "Gợi ý ngành nghề phù hợp, có giải thích lý do và lộ trình phát triển.",
            },
            {
              icon: <FavoriteIcon />,
              title: "Chăm sóc cảm xúc",
              desc: "Nhận diện cảm xúc, giải tỏa áp lực và nâng đỡ tinh thần học đường.",
            },
            {
              icon: <SmartToyIcon />,
              title: "Trợ lý học tập AI",
              desc: "Giải thích bài, gợi ý bài tập, hỗ trợ học chủ động mỗi ngày.",
            },
          ].map((it) => (
            <Grid key={it.title} item xs={12} sm={6} md={3}>
              <BenefitCard icon={it.icon} title={it.title} desc={it.desc} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </SectionReveal>
  );
}

function BenefitCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        border: "1px solid rgba(99,102,241,0.10)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(99,102,241,0.12)",
            color: "#4f46e5",
            mb: 1.5,
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontWeight: 900, mb: 0.75 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {desc}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* ----------------------------- 3) FLOW ----------------------------- */
/* LƯU Ý: KHỐI 1 đã bọc <div ref={flowRef}> quanh FlowSection */

function FlowSection() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const steps = useMemo(
    () => [
      {
        title: "Thu thập dữ liệu",
        desc: "Điểm số, môn học, kỹ năng, mục tiêu và (tùy chọn) nhật ký cảm xúc.",
        bullets: ["Hồ sơ học tập", "Hồ sơ năng lực", "Tương tác cảm xúc"],
      },
      {
        title: "AI phân tích & cá nhân hóa",
        desc: "Nhận diện điểm mạnh/yếu, xu hướng tiến bộ và nhu cầu hỗ trợ phù hợp.",
        bullets: ["Phân tích theo thời gian", "Xác định ưu tiên", "Gợi ý rõ ràng"],
      },
      {
        title: "Gợi ý học tập & nghề nghiệp",
        desc: "Đề xuất lộ trình học, kỹ năng cần bổ sung và hướng đi nghề nghiệp phù hợp.",
        bullets: ["Lộ trình cải thiện", "Kỹ năng/chứng chỉ", "Lý do đề xuất"],
      },
      {
        title: "Đồng hành & tối ưu liên tục",
        desc: "Theo dõi tiến bộ, cập nhật mục tiêu và điều chỉnh gợi ý theo dữ liệu mới.",
        bullets: ["Báo cáo tiến trình", "Điều chỉnh mục tiêu", "Phát triển bền vững"],
      },
    ],
    []
  );

  return (
    <SectionReveal variant="slideUp" timeout={750}>
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.3 }}>
              Hành trình Lumora đồng hành
            </Typography>
            <Typography sx={{ color: "text.secondary", maxWidth: 760 }}>
              Một flow dễ hiểu để người xem “nắm hệ thống” trong 15 giây — rất hợp
              trình bày với BGK.
            </Typography>
          </Stack>

          <Grid container spacing={2.5} sx={{ mt: 2 }}>
            {steps.map((s, idx) => (
              <Grid key={s.title} item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          minWidth: 34,
                          height: 34,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(59,130,246,0.12)",
                          color: "#2563eb",
                          fontWeight: 900,
                        }}
                      >
                        {idx + 1}
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{s.title}</Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mt: 0.5 }}
                        >
                          {s.desc}
                        </Typography>

                        <Stack
                          direction={isMdUp ? "row" : "column"}
                          spacing={1}
                          sx={{ mt: 1.5, flexWrap: "wrap" }}
                        >
                          {s.bullets.map((b) => (
                            <Chip
                              key={b}
                              label={b}
                              size="small"
                              sx={{
                                bgcolor: "rgba(2,132,199,0.10)",
                                color: "#075985",
                                fontWeight: 700,
                                borderRadius: 2,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </SectionReveal>
  );
}

/* ------------------------- 4) MODULES ------------------------- */

function ModulesSection() {
  const [active, setActive] = useState<ModuleKey>("VIREYA");

  const modules = useMemo(
    () => ({
      VIREYA: {
        title: "VIREYA — Phân tích học tập & định hướng học tập",
        summary:
          "Theo dõi hồ sơ học tập, phân tích điểm mạnh/yếu và đề xuất lộ trình cải thiện phù hợp với năng lực cá nhân.",
        highlights: [
          "Hồ sơ học tập & nhập điểm",
          "Biểu đồ tiến trình theo thời gian",
          "Gợi ý ưu tiên cải thiện từng môn",
        ],
      },
      NEOVANA: {
        title: "NEOVANA — Năng lực & định hướng nghề nghiệp",
        summary:
          "Phân tích năng lực, sở thích và mục tiêu để đề xuất nghề nghiệp phù hợp, kèm lý do và lộ trình kỹ năng/chứng chỉ.",
        highlights: [
          "Hồ sơ năng lực (skills, chứng chỉ, minh chứng)",
          "Gợi ý nghề nghiệp có giải thích",
          "Lộ trình phát triển dài hạn",
        ],
      },
      ZENORA: {
        title: "ZENORA — Trợ lý cảm xúc AI",
        summary:
          "Nhận diện cảm xúc từ văn bản và cung cấp công cụ giải tỏa như Void Zone, hố đen cảm xúc, đám mây chữa lành.",
        highlights: [
          "Phản hồi cảm xúc tức thời",
          "Không gian chữa lành & thư giãn",
          "Theo dõi xu hướng cảm xúc (tùy chọn)",
        ],
      },
      ROBOKI: {
        title: "ROBOKI — Trợ giảng học tập thông minh",
        summary:
          "Hỗ trợ giải thích bài, gợi ý luyện tập, thiết kế hoạt động/dự án học tập và rèn tư duy phản biện.",
        highlights: [
          "Hỏi-đáp học thuật theo ngữ cảnh",
          "Thiết kế dự án học tập",
          "Rèn tư duy phản biện & đánh giá năng lực",
        ],
      },
    }),
    []
  );

  const chipOrder: ModuleKey[] = ["VIREYA", "NEOVANA", "ZENORA", "ROBOKI"];
  const activeData = modules[active];

  return (
    <SectionReveal variant="fade" timeout={700}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.3 }}>
            4 trụ cột của Lumora
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 760 }}>
            Người xem có thể “click” từng mô-đun để hiểu rõ Lumora làm gì, khác gì,
            và mạnh ở đâu.
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
        >
          {chipOrder.map((k) => (
            <Chip
              key={k}
              label={k}
              onClick={() => setActive(k)}
              variant={active === k ? "filled" : "outlined"}
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                ...(active === k
                  ? { bgcolor: "#4f46e5", color: "white" }
                  : {
                      borderColor: "rgba(79,70,229,0.35)",
                      color: "#3730a3",
                    }),
              }}
            />
          ))}
        </Stack>

        <Grid container spacing={2.5} sx={{ mt: 2 }}>
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                borderRadius: 4,
                height: "100%",
                boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                border: "1px solid rgba(79,70,229,0.10)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 900, mb: 1 }}>
                  {activeData.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", mb: 2 }}>
                  {activeData.summary}
                </Typography>

                <Typography sx={{ fontWeight: 900, mb: 1 }}>
                  Tính năng nổi bật
                </Typography>

                <Stack spacing={1}>
                  {activeData.highlights.map((h) => (
                    <Stack
                      key={h}
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "rgba(79,70,229,0.9)",
                        }}
                      />
                      <Typography>{h}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 4,
                height: "100%",
                boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 900, mb: 1 }}>
                  Mockup / Screenshot
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 2 }}
                >
                  Thay khung này bằng ảnh UI thật (Dashboard, biểu đồ, Void Zone,
                  Career Suggestion…).
                </Typography>

                <Box
                  sx={{
                    height: 260,
                    borderRadius: 3,
                    border: "1px dashed rgba(0,0,0,0.25)",
                    bgcolor: "rgba(79,70,229,0.04)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: "#3730a3" }}>
                    {active} UI Preview
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    (Ảnh minh hoạ / screenshot đặt ở đây)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </SectionReveal>
  );
}
/* ------------------------- 5) QUOTE + CTA ------------------------- */

function QuoteCTASection() {
  const history = useHistory();

  return (
    <SectionReveal variant="fade" timeout={700}>
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: "white",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(79,70,229,0.14)",
              boxShadow: "0 14px 50px rgba(0,0,0,0.10)",
            }}
          >
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                background:
                  "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(59,130,246,0.10))",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, lineHeight: 1.25, mb: 1.25 }}
              >
                “Lumora không thay bạn quyết định tương lai — nhưng Lumora giúp
                bạn có đủ thông tin để quyết định đúng.”
              </Typography>

              <Typography sx={{ color: "text.secondary", maxWidth: 820 }}>
                Nếu bạn muốn, mình có thể giúp bạn gắn section này thành landing
                CTA, hoặc chuyển sang dạng “BGK-friendly” để thuyết trình.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 2.5 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => history.push("/dashboard")}
                  sx={{
                    bgcolor: "#4f46e5",
                    "&:hover": { bgcolor: "#4338ca" },
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Trải nghiệm Lumora
                </Button>
              </Stack>
            </Box>
          </Card>
        </Container>
      </Box>
    </SectionReveal>
  );
}

/* ----------------------------- FOOTER ----------------------------- */

function FooterMini() {
  return (
    <SectionReveal variant="fade" timeout={500} threshold={0.12}>
      <Box sx={{ py: 3, bgcolor: "#f7f7ff" }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            © {new Date().getFullYear()} Lumora • Vũ trụ AI giáo dục toàn diện
          </Typography>
        </Container>
      </Box>
    </SectionReveal>
  );
}
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import { CertificateToAdd } from "../../../../types/CareerDashboard";
import ApexCharts from "react-apexcharts"; // Import ApexCharts for donut chart

interface Props {
  certificates: CertificateToAdd[];
}

const CertificatesCard: React.FC<Props> = ({ certificates }) => {
  // Dữ liệu biểu đồ chứng chỉ
  const certificatesData = certificates.map((c) => ({
    name: c.name,
    value: c.priorityRatio, // Dùng tỷ lệ ưu tiên làm giá trị cho biểu đồ
  }));

  // Cấu hình cho biểu đồ donut (ApexCharts)
  const chartOptions = {
    chart: {
      type: 'donut' as const, // Cung cấp kiểu dữ liệu đúng
    },
    labels: certificatesData.map((item) => item.name), // Gán tên chứng chỉ làm nhãn
    colors: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0'], // Màu sắc các phân đoạn
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const chartSeries = certificatesData.map((item) => item.value); // Dữ liệu biểu đồ (tỉ lệ chứng chỉ)

  return (
    <Card sx={{ mt: 2, borderRadius: "16px", boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)", padding: "16px", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)" } }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontSize: "1.2rem", color: "#4E81A8" }}>
          Chứng chỉ cần bổ sung
        </Typography>
        {/* Thêm Biểu đồ Donut */}
        <Box mt={4}>          
          <ApexCharts
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width="500"
            height="500"
          />
        </Box>
        <List>
          {certificates.map((c, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${c.name}`}
                secondary={`Ưu tiên: ${c.priority} | Liên quan: ${c.relevance} | Nguồn: ${c.source} | Lý do: ${c.reason}`}
                sx={{
                  fontSize: "1rem",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              />
            </ListItem>
          ))}
        </List>

        
      </CardContent>
    </Card>
  );
};

export default CertificatesCard;

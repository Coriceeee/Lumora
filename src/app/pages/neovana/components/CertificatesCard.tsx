import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { CertificateToAdd } from "../../../../types/CareerDashboard";

interface Props {
  certificates: CertificateToAdd[];
}

const CertificatesCard: React.FC<Props> = ({ certificates }) => {
  return (
    <Card sx={{ mt: 2, borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontSize: "1.2rem", color: "#4E81A8" }}>Chứng chỉ cần bổ sung</Typography>
        <List>
          {certificates.map((c, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${c.name} (${c.priorityRatio}%)`}
                secondary={`Ưu tiên: ${c.priority} | Liên quan: ${c.relevance} | Nguồn: ${c.source} | Lý do: ${c.reason}`}
                sx={{
                  fontSize: "0.9rem",
                  color: "#4f5e70",
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

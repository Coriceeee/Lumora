// FILE: src/app/pages/neovana/components/CertificatesCard.tsx
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
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6">Chứng chỉ cần bổ sung</Typography>
        <List>
          {certificates.map((c, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${c.name} (${c.priorityRatio}%)`}
                secondary={`Ưu tiên: ${c.priority} | Liên quan: ${c.relevance} | Nguồn: ${c.source} | Lý do: ${c.reason}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CertificatesCard;

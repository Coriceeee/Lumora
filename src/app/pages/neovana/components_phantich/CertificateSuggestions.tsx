import * as React from "react";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";

interface CertificateSuggestionsProps {
  data: string;
}

const CertificateSuggestions: React.FC<CertificateSuggestionsProps> = ({ data }) => {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Gợi ý Chứng chỉ" subheader="Các chứng chỉ cần bổ sung" />
      <CardContent>
        <Typography variant="body2">{data}</Typography>
      </CardContent>
    </Card>
  );
};

export default CertificateSuggestions;

import * as React from "react";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";

interface SubjectSuggestionsProps {
  data: string;
}

const SubjectSuggestions: React.FC<SubjectSuggestionsProps> = ({ data }) => {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="Gợi ý Môn học" subheader="Các môn học cần cải thiện" />
      <CardContent>
        <Typography variant="body2">{data}</Typography>
      </CardContent>
    </Card>
  );
};

export default SubjectSuggestions;

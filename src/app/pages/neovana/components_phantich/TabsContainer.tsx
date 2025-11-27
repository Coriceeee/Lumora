import * as React from "react";
import { Tabs, Tab, Paper } from "@mui/material";

export default function TabsContainer({ value, onChange }: any) {
  return (
    <Paper elevation={3} sx={{ borderRadius: 3 }}>
      <Tabs
        value={value}
        onChange={onChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="Môn học" />
        <Tab label="Kỹ năng" />
        <Tab label="Chứng chỉ" />
      </Tabs>
    </Paper>
  );
}

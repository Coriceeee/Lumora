// components_phantich/TabPanel.tsx
import * as React from "react";
import { Box } from "@mui/material";

export default function TabPanel({ children, value, index }: any) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

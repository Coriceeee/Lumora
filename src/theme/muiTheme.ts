// src/theme/muiTheme.ts
import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  typography: {
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif",

    h1: { fontWeight: 800, lineHeight: 1.15 },
    h2: { fontWeight: 800, lineHeight: 1.15 },
    h3: { fontWeight: 800, lineHeight: 1.2 },
    h4: { fontWeight: 900, lineHeight: 1.25 },
    h5: { fontWeight: 900, lineHeight: 1.25 },
    h6: { fontWeight: 700, lineHeight: 1.3 },

    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
});

export default muiTheme;

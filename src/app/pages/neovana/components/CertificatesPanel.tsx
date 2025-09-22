import * as React from "react";
import { Card, CardHeader, CardContent, List, ListItem, ListItemText, Stack, Chip, Divider, Typography, Tooltip, Button } from "@mui/material";
import type { UserCertificate } from "@/types/UserCertificate";
import { Certificate } from "@/types/Certificate";

export default function CertificatesPanel({
  title = "Chứng chỉ đã đạt",
  subtitle = "Thống kê kết quả & nhà cấp",
  items,
  certCatalogMap,
}: {
  title?: string;
  subtitle?: string;
  items: UserCertificate[];
  certCatalogMap?: Record<string, Certificate>;
}) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        {items.length === 0 ? (
          <Typography variant="body2">Chưa có chứng chỉ nào.</Typography>
        ) : (
          <List>
            {items.map((c, idx) => {
              const displayName = certCatalogMap?.[c.certificateId]?.name ?? c.certificateId; // ✅ tên từ catalog
              return (
                <React.Fragment key={c.id || `${c.certificateId}-${idx}`}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItem
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" variant="outlined" label={c.issuer} />
                        <Chip size="small" label={new Date(c.date).toLocaleDateString()} />
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={600}>{displayName}</Typography>
                          {c.result && <Chip size="small" color="success" label={c.result} />}
                        </Stack>
                      }
                      secondary={<Tooltip title={c.description || ""}><span>{c.description || "—"}</span></Tooltip>}
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
        {items.length > 0 && (
          <Button sx={{ mt: 2 }} onClick={() => console.log("Export certificates:", items)}>
            Export JSON (console)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import * as React from "react";
import {
  Card, CardHeader, CardContent, List, ListItem, ListItemText,
  Stack, Chip, Button, Divider, Tooltip, Typography
} from "@mui/material";

export type CertLevel = "Cơ bản" | "Trung cấp" | "Nâng cao";

export interface CertificateItem {
  id: string;
  name: string;
  provider?: string;
  level: CertLevel;
  estHours?: number;
  rationale?: string;
  tags?: string[];
  url?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  items: CertificateItem[];
  onEnroll?: (id: string) => void;
  onSavePlan?: (ids: string[]) => void;
}

export default function CertificateSuggestions({
  title = "Bảng chứng chỉ & gợi ý học thêm",
  subtitle = "Đề xuất chứng chỉ/khóa học để lấp đầy khoảng trống năng lực",
  items, onEnroll, onSavePlan,
}: Props) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id):[...prev,id]);
  const totalHours = items.filter(i=>selected.includes(i.id)).reduce((s,i)=>s+(i.estHours??0),0);

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title={title} subheader={subtitle}/>
      <CardContent>
        <List>
          {items.map((i,idx)=>(
            <React.Fragment key={i.id}>
              {idx>0 && <Divider component="li"/>}
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={i.level}/>
                    {i.estHours && <Chip size="small" label={`${i.estHours}h`}/>}
                    <Button size="small" variant={selected.includes(i.id)?"contained":"outlined"} onClick={()=>toggle(i.id)}>
                      {selected.includes(i.id)?"Bỏ chọn":"Chọn"}
                    </Button>
                    {i.url && <Button size="small" onClick={()=>window.open(i.url!,"_blank")}>Xem</Button>}
                    <Button size="small" onClick={()=>onEnroll?.(i.id)}>Ghi danh</Button>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={600}>{i.name}</Typography>
                      {i.provider && <Chip size="small" label={i.provider}/>}
                      {i.tags?.map(t=><Chip key={t} size="small" label={t}/>)}
                    </Stack>
                  }
                  secondary={<Tooltip title={i.rationale??""}><span>{i.rationale??"—"}</span></Tooltip>}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        <Stack direction="row" spacing={1} sx={{ mt:2 }}>
          <Chip label={`Đã chọn: ${selected.length}`} color="primary"/>
          <Chip label={`Tổng giờ: ${totalHours}h`} color="secondary"/>
          <Button variant="contained" onClick={()=>onSavePlan?.(selected)}>Lưu lộ trình học</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

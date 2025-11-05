declare module "framer-motion" {
  export interface PanInfo {
    point: { x: number; y: number };
    delta: { x: number; y: number };
    offset: { x: number; y: number };
    velocity: { x: number; y: number };
  }

  export function div(div: any) {
    throw new Error("Function not implemented.");
  }
}

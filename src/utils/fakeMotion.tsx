import React from "react";

export const motion = {
  div: (props: any) => <div {...props}>{props.children}</div>,
  section: (props: any) => <section {...props}>{props.children}</section>,
  span: (props: any) => <span {...props}>{props.children}</span>,
};

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

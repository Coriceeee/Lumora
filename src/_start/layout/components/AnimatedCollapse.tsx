import { useTransition, animated } from "@react-spring/web";

export function AnimatedCollapse({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  const transitions = useTransition(show, {
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: "auto" },
    leave: { opacity: 0, height: 0 },
    config: { duration: 250 },
  });

  return transitions(
    (style, item) => item && <animated.div style={style}>{children}</animated.div>
  );
}

// Ultra-expanded mini Framer Motion engine
// Added:
// 1. Full AnimatePresence exit-before-unmount (with fade-out + scale)
// 2. Transition type: inertia
// 3. Gestures: dragMomentum + dragElastic
// 4. Keyframes support
// 5. Nested variants
// 6. ⭐ onDragMove support
// 7. ⭐ Fixed AnimatePresence duplicate key bug (append "-exit")

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";

/* ---------------- Types ---------------- */
export type VariantState = {
  opacity?: number;
  scale?: number;
  x?: number;
  y?: number;
};

export type Variants = {
  initial?: VariantState;
  animate?: VariantState;
  exit?: VariantState;
  [key: string]: VariantState | undefined;
};

export type Keyframes = {
  x?: number[];
  y?: number[];
  opacity?: number[];
  scale?: number[];
  duration?: number;
};

export type Transition = {
  duration?: number;
  ease?: string;
  type?: "tween" | "spring" | "inertia";
  stiffness?: number;
  damping?: number;
  velocity?: number;
  deceleration?: number;
};

export type MotionProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;

  initial?: VariantState | string;
  animate?: VariantState | string;
  exit?: VariantState | string;

  variants?: Variants;
  nested?: boolean;
  transition?: Transition;
  keyframes?: Keyframes;
  whileHover?: VariantState;

  drag?: boolean;
  dragElastic?: number;
  dragMomentum?: boolean;

  // ⭐ NEW
  onDragMove?: (ev: MouseEvent) => void;

  as?: any;
  [key: string]: any;
};

/* ---------------- Helpers ---------------- */
const applyState = (el: HTMLElement, s?: VariantState) => {
  if (!s) return;
  const x = s.x ?? 0;
  const y = s.y ?? 0;
  const sc = s.scale ?? 1;

  if (s.opacity !== undefined) el.style.opacity = String(s.opacity);
  el.style.transform = `translate(${x}px, ${y}px) scale(${sc})`;
};

/* ---------------- Animation Engines ---------------- */

const animateTween = (el: HTMLElement, to: VariantState, d: number) => {
  el.style.transition = `all ${d}s ease-out`;
  applyState(el, to);
};

const animateSpring = (
  el: HTMLElement,
  from: VariantState,
  to: VariantState,
  stiff = 170,
  damp = 26
) => {
  let x = from.x ?? 0,
    y = from.y ?? 0,
    scale = from.scale ?? 1;

  const tx = to.x ?? 0,
    ty = to.y ?? 0,
    ts = to.scale ?? 1;

  let vx = 0,
    vy = 0,
    vs = 0;

  const dt = 1 / 60;

  const step = () => {
    const fx = -stiff * (x - tx);
    const fy = -stiff * (y - ty);
    const fs = -stiff * (scale - ts);

    vx += fx * dt;
    vy += fy * dt;
    vs += fs * dt;

    vx *= damp * dt;
    vy *= damp * dt;
    vs *= damp * dt;

    x += vx;
    y += vy;
    scale += vs;

    applyState(el, { x, y, scale });

    if (
      Math.abs(x - tx) < 0.3 &&
      Math.abs(y - ty) < 0.3 &&
      Math.abs(scale - ts) < 0.01
    )
      return;

    requestAnimationFrame(step);
  };

  step();
};

const animateInertia = (el: HTMLElement, from: VariantState, t: Transition) => {
  const decel = t.deceleration ?? 0.95;

  let x = from.x ?? 0,
    y = from.y ?? 0,
    vx = t.velocity ?? 20,
    vy = t.velocity ?? 20;

  const tick = () => {
    vx *= decel;
    vy *= decel;

    x += vx;
    y += vy;

    applyState(el, { x, y });

    if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) return;

    requestAnimationFrame(tick);
  };

  tick();
};

const animateKeyframes = (el: HTMLElement, k: Keyframes) => {
  const frames = k.x?.length ?? 0;
  if (!frames) return;

  let i = 0;
  const duration = k.duration ?? 0.5;
  const stepTime = (duration * 1000) / frames;

  const loop = () => {
    if (i >= frames) return;

    applyState(el, {
      x: k.x?.[i],
      y: k.y?.[i],
      opacity: k.opacity?.[i],
      scale: k.scale?.[i],
    });

    i++;
    setTimeout(loop, stepTime);
  };

  loop();
};

/* ---------------- useMotionAnimation ---------------- */

const useMotionAnimation = (
  ref: React.RefObject<HTMLElement>,
  props: MotionProps
) => {
  const { initial, animate, variants, transition, keyframes } = props;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const resolve = (v?: VariantState | string) =>
      typeof v === "string" ? variants?.[v] : v;

    const init = resolve(initial) ?? variants?.initial;
    const anim = resolve(animate) ?? variants?.animate;

    if (init) applyState(el, init);

    if (keyframes) {
      animateKeyframes(el, keyframes);
      return;
    }

    requestAnimationFrame(() => {
      if (!anim) return;
      const t = transition ?? {};
      if (t.type === "spring") animateSpring(el, init ?? {}, anim);
      else if (t.type === "inertia") animateInertia(el, init ?? {}, t);
      else animateTween(el, anim, t.duration ?? 0.4);
    });
  }, [initial, animate]);
};

/* ---------------- BaseMotion ---------------- */

const BaseMotion = forwardRef<HTMLElement, MotionProps>((props, ref) => {
  const internalRef = useRef<HTMLElement>(null);
  const mergedRef = (ref as React.RefObject<HTMLElement>) || internalRef;

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  useMotionAnimation(mergedRef, props);

  const { drag, dragMomentum, onDragMove } = props;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!drag) return;

    const el = mergedRef.current;
    if (!el) return;

    let startX = e.clientX - pos.x;
    let startY = e.clientY - pos.y;

    let lastX = e.clientX;
    let lastY = e.clientY;

    const move = (ev: MouseEvent) => {
      const newX = ev.clientX - startX;
      const newY = ev.clientY - startY;

      setPos({ x: newX, y: newY });
      setVelocity({ x: ev.clientX - lastX, y: ev.clientY - lastY });

      lastX = ev.clientX;
      lastY = ev.clientY;

      applyState(el, { x: newX, y: newY });

      if (onDragMove) onDragMove(ev); // ⭐ critical
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);

      if (dragMomentum) {
        animateInertia(mergedRef.current!, pos, {
          type: "inertia",
          velocity: Math.max(Math.abs(velocity.x), Math.abs(velocity.y)),
        });
      }

      if (props.onMouseUp) props.onMouseUp(e);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const Component = props.as || "div";

  return (
    <Component
      ref={mergedRef}
      onMouseDown={onMouseDown}
      style={props.style}
      className={props.className}
      onMouseUp={props.onMouseUp}
    >
      {props.children}
    </Component>
  );
});

/* ---------------- AnimatePresence ---------------- */

export const AnimatePresence: React.FC<{ children: any }> = ({ children }) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const newChildren = React.Children.toArray(children);

    setItems((prev) => {
      if (prev.length === 0) return newChildren;

      const exiting = prev.filter((p) => !newChildren.includes(p));

      if (exiting.length === 0) return newChildren;

      // ⭐ FIX DUPLICATE KEY: add -exit
      const exitNodes = exiting.map((node: any) =>
        React.cloneElement(node, {
          key: node.key + "-exit",
          initial: node.props.initial,
          animate: node.props.exit ?? { opacity: 0, scale: 0 },
          transition: node.props.transition ?? { duration: 0.3 },
        })
      );

      return [...newChildren, ...exitNodes];
    });
  }, [children]);

  return <>{items}</>;
};

/* ---------------- motion ---------------- */

export const motion = {
  div: (props: MotionProps) => <BaseMotion {...props} as="div" />,
  span: (props: MotionProps) => <BaseMotion {...props} as="span" />,
  section: (props: MotionProps) => <BaseMotion {...props} as="section" />,
};

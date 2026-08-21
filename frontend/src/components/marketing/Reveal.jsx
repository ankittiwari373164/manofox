import { motion } from "framer-motion";

export function MaskedLines({ lines, className = "", lineClassName = "", delay = 0.1, as: Tag = "h1" }) {
  const MotionTag = motion[Tag] || motion.h1;
  return (
    <MotionTag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export function FadeIn({ children, delay = 0, y = 28, className = "", once = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Overline({ children, light = false }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.25em] ${light ? "text-white/60" : "text-fox"}`}>
      {children}
    </p>
  );
}

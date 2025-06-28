import { motion } from "framer-motion";

export default function Button({ children, className="", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={
        `inline-flex items-center gap-1 rounded-md bg-accent
         px-4 py-2 font-semibold text-black shadow
         hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50
         ${className}`
      }
      {...props}
    >
      {children}
    </motion.button>
  );
}

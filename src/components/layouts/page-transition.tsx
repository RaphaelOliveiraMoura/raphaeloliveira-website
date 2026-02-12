"use client";

import { motion } from "framer-motion";

import { usePathname } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // Usa key para re-montar o motion.div a cada navegacao, disparando a animacao
  // de entrada. Nao usa AnimatePresence mode="wait" pois no App Router ele bloqueia
  // a renderizacao do novo conteudo, causando tela em branco.
  return (
    <motion.div
      key={pathname}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.25,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { AnimateOnScroll, fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { Marquee } from "./marquee";

export interface LogoItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface LogoCloudBaseProps {
  logos: LogoItem[];
  className?: string;
}

interface LogoCloudStaticProps extends LogoCloudBaseProps {
  /** Quando `true`, exibe os logos em scroll horizontal infinito (Marquee). */
  marquee?: false;
}

interface LogoCloudMarqueeProps extends LogoCloudBaseProps {
  /** Quando `true`, exibe os logos em scroll horizontal infinito (Marquee). */
  marquee: true;
  /** Duracao de um ciclo completo do marquee em segundos. @default 30 */
  marqueeDuration?: number;
  /** Inverter a direcao do scroll. @default false */
  marqueeReverse?: boolean;
  /** Pausar ao passar o mouse. @default true */
  marqueePauseOnHover?: boolean;
}

type LogoCloudProps = LogoCloudStaticProps | LogoCloudMarqueeProps;

const LOGO_ITEM_CLASS =
  "flex items-center gap-2 text-muted-foreground/50 transition-all duration-normal hover:text-foreground";

function LogoItem({ logo }: { logo: LogoItem }) {
  return (
    <div className={LOGO_ITEM_CLASS} title={logo.name}>
      <span className="[&>svg]:size-5">{logo.icon}</span>
      <span className="text-sm font-medium">{logo.name}</span>
    </div>
  );
}

/**
 * Exibe uma lista de logos de parceiros/tecnologias.
 *
 * - Modo estatico (padrao): flex wrap com animacao de entrada via `AnimateOnScroll`.
 * - Modo marquee (`marquee={true}`): scroll horizontal infinito via composicao com `Marquee`.
 *
 * @example
 * // Estatico
 * <LogoCloud logos={LOGOS} />
 *
 * // Marquee
 * <LogoCloud logos={LOGOS} marquee marqueeDuration={25} />
 */
export function LogoCloud(props: LogoCloudProps) {
  const { logos, className } = props;

  if (props.marquee) {
    const {
      marqueeDuration = 30,
      marqueeReverse = false,
      marqueePauseOnHover = true,
    } = props;

    return (
      <Marquee
        duration={marqueeDuration}
        reverse={marqueeReverse}
        pauseOnHover={marqueePauseOnHover}
        className={cn("[--gap:3rem]", className)}
      >
        {logos.map((logo) => (
          <LogoItem key={logo.id} logo={logo} />
        ))}
      </Marquee>
    );
  }

  return (
    <AnimateOnScroll variants={fadeInUp} threshold={0.1} duration={0.5}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-10 gap-y-6",
          className,
        )}
      >
        {logos.map((logo) => (
          <LogoItem key={logo.id} logo={logo} />
        ))}
      </div>
    </AnimateOnScroll>
  );
}

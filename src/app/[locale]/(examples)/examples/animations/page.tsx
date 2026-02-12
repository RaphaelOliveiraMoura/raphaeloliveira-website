"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { AlertCircle, FileQuestion, Loader2, RotateCcw } from "lucide-react";

import { EmptyState, ErrorState, LoadingButton } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useTranslations } from "@/lib/i18n";
import {
  AnimateOnScroll,
  CountUp,
  FadeIn,
  fadeInUp,
  ScaleOnHover,
  SlideIn,
  StaggerChildren,
  StaggerItem,
  TypeWriter,
} from "@/lib/motion";

const NAV_SECTIONS = [
  "entrance",
  "stagger",
  "scroll",
  "numbers",
  "text",
  "microInteractions",
  "loading",
  "states",
] as const;

function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="scroll-mt-20 text-2xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

function DemoCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function AnimationsPage() {
  const t = useTranslations("examples");

  return (
    <div className="flex gap-8">
      {/* Sidebar nav */}
      <nav className="hidden w-48 shrink-0 lg:block" aria-label="Sections">
        <div className="sticky top-20 space-y-1">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-fast hover:text-foreground"
            >
              {t(`animations.${section}`)}
            </a>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("animations.title")}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t("animations.subtitle")}
          </p>
        </div>

        {/* ===== ENTRANCE ===== */}
        <section className="space-y-6">
          <SectionTitle id="entrance">{t("animations.entrance")}</SectionTitle>
          <p className="text-muted-foreground">
            {t("animations.entranceDesc")}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <EntranceDemo direction="up" label={t("animations.fadeInUp")} />
            <EntranceDemo direction="down" label={t("animations.fadeInDown")} />
            <EntranceDemo direction="left" label={t("animations.fadeInLeft")} />
            <EntranceDemo
              direction="right"
              label={t("animations.fadeInRight")}
            />
          </div>

          <DemoCard title={t("animations.slideIn")}>
            <SlideInDemo />
          </DemoCard>

          <DemoCard
            title={t("animations.scaleOnHover")}
            description={t("animations.hoverMe")}
          >
            <div className="flex gap-4">
              <ScaleOnHover>
                <Badge
                  variant="secondary"
                  className="cursor-pointer px-4 py-2 text-sm"
                >
                  {t("animations.hoverMe")} 1
                </Badge>
              </ScaleOnHover>
              <ScaleOnHover scale={1.05}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer px-4 py-2 text-sm"
                >
                  {t("animations.hoverMe")} 2
                </Badge>
              </ScaleOnHover>
              <ScaleOnHover scale={1.08}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer px-4 py-2 text-sm"
                >
                  {t("animations.hoverMe")} 3
                </Badge>
              </ScaleOnHover>
            </div>
          </DemoCard>
        </section>

        <Separator />

        {/* ===== STAGGER ===== */}
        <section className="space-y-6">
          <SectionTitle id="stagger">{t("animations.stagger")}</SectionTitle>
          <p className="text-muted-foreground">{t("animations.staggerDesc")}</p>

          <StaggerDemo
            label={t("animations.staggerCards")}
            replayLabel={t("animations.replay")}
          />
        </section>

        <Separator />

        {/* ===== SCROLL ===== */}
        <section className="space-y-6">
          <SectionTitle id="scroll">{t("animations.scroll")}</SectionTitle>
          <p className="text-muted-foreground">{t("animations.scrollDesc")}</p>

          <div className="space-y-8">
            <p className="text-center text-sm text-muted-foreground">
              {t("animations.scrollRevealDesc")}
            </p>
            {[1, 2, 3, 4].map((i) => (
              <AnimateOnScroll
                key={i}
                variants={fadeInUp}
                threshold={0.3}
                duration={0.5}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("animations.scrollReveal")} #{i}
                    </CardTitle>
                    <CardDescription>
                      {t("animations.scrollRevealDesc")}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        <Separator />

        {/* ===== NUMBERS ===== */}
        <section className="space-y-6">
          <SectionTitle id="numbers">{t("animations.numbers")}</SectionTitle>
          <p className="text-muted-foreground">{t("animations.numbersDesc")}</p>

          <div className="grid gap-6 sm:grid-cols-3">
            <DemoCard title="78+">
              <div className="text-4xl font-bold">
                <CountUp end={78} suffix="+" duration={2} />
              </div>
            </DemoCard>
            <DemoCard title="1,250">
              <div className="text-4xl font-bold">
                <CountUp end={1250} duration={2.5} />
              </div>
            </DemoCard>
            <DemoCard title="99.9%">
              <div className="text-4xl font-bold">
                <CountUp end={99} suffix=".9%" duration={2} />
              </div>
            </DemoCard>
          </div>
        </section>

        <Separator />

        {/* ===== TEXT ===== */}
        <section className="space-y-6">
          <SectionTitle id="text">{t("animations.text")}</SectionTitle>
          <p className="text-muted-foreground">{t("animations.textDesc")}</p>

          <DemoCard title={t("animations.typewriterEffect")}>
            <TypeWriterDemo
              text={t("animations.typewriterText")}
              replayLabel={t("animations.replay")}
            />
          </DemoCard>
        </section>

        <Separator />

        {/* ===== MICRO-INTERACTIONS ===== */}
        <section className="space-y-6">
          <SectionTitle id="microInteractions">
            {t("animations.microInteractions")}
          </SectionTitle>
          <p className="text-muted-foreground">
            {t("animations.microInteractionsDesc")}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <DemoCard title={t("animations.buttonHover")}>
              <div className="flex flex-wrap gap-3">
                <Button>{t("animations.hoverMe")}</Button>
                <Button variant="outline">{t("animations.hoverMe")}</Button>
                <Button variant="secondary">{t("animations.hoverMe")}</Button>
              </div>
            </DemoCard>

            <DemoCard title={t("animations.buttonLoading")}>
              <LoadingButtonDemo />
            </DemoCard>

            <DemoCard
              title={t("animations.cardLift")}
              description={t("animations.cardLiftDesc")}
            >
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-4 text-center text-sm">
                    Card {i}
                  </Card>
                ))}
              </div>
            </DemoCard>

            <DemoCard title={t("animations.triggerShake")}>
              <ShakeDemo label={t("animations.triggerShake")} />
            </DemoCard>
          </div>
        </section>

        <Separator />

        {/* ===== LOADING ===== */}
        <section className="space-y-6">
          <SectionTitle id="loading">{t("animations.loading")}</SectionTitle>
          <p className="text-muted-foreground">{t("animations.loadingDesc")}</p>

          <DemoCard title={t("animations.skeletonShimmer")}>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          </DemoCard>
        </section>

        <Separator />

        {/* ===== STATES ===== */}
        <section className="space-y-6">
          <SectionTitle id="states">{t("animations.states")}</SectionTitle>
          <p className="text-muted-foreground">{t("animations.statesDesc")}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatesDemo
              type="empty"
              label={t("animations.emptyBounce")}
              replayLabel={t("animations.replay")}
            />
            <StatesDemo
              type="error"
              label={t("animations.errorShake")}
              replayLabel={t("animations.replay")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ===========================
   Demo Components
   =========================== */

function EntranceDemo({
  direction,
  label,
}: {
  direction: "up" | "down" | "left" | "right";
  label: string;
}) {
  const [key, setKey] = useState(0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          {label}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setKey((k) => k + 1)}
          >
            <RotateCcw className="size-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FadeIn key={key} direction={direction} duration={0.5}>
          <div className="rounded-lg bg-primary/10 p-4 text-center text-sm font-medium">
            {label}
          </div>
        </FadeIn>
      </CardContent>
    </Card>
  );
}

function SlideInDemo() {
  const [key, setKey] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | "up" | "down">(
    "left",
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["left", "right", "up", "down"] as const).map((dir) => (
          <Button
            key={dir}
            variant={direction === dir ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setDirection(dir);
              setKey((k) => k + 1);
            }}
          >
            {dir}
          </Button>
        ))}
      </div>
      <SlideIn key={key} direction={direction} distance={40} duration={0.4}>
        <div className="rounded-lg bg-primary/10 p-4 text-center text-sm font-medium">
          Slide from {direction}
        </div>
      </SlideIn>
    </div>
  );
}

function StaggerDemo({
  label,
  replayLabel,
}: {
  label: string;
  replayLabel: string;
}) {
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <RotateCcw className="mr-2 size-3" />
        {replayLabel}
      </Button>
      <StaggerChildren
        key={key}
        staggerDelay={0.1}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <StaggerItem key={i}>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold">{i}</div>
              <p className="text-xs text-muted-foreground">
                {label} {i}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );
}

function TypeWriterDemo({
  text,
  replayLabel,
}: {
  text: string;
  replayLabel: string;
}) {
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <RotateCcw className="mr-2 size-3" />
        {replayLabel}
      </Button>
      <div className="min-h-[3rem] rounded-lg bg-muted/50 p-4 font-mono text-sm">
        <TypeWriter key={key} text={text} speed={40} cursor />
      </div>
    </div>
  );
}

function LoadingButtonDemo() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 1500);
  };

  return (
    <div className="flex gap-3">
      <LoadingButton loading={loading} success={success} onClick={handleClick}>
        Submit
      </LoadingButton>
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading...
      </Button>
    </div>
  );
}

function ShakeDemo({ label }: { label: string }) {
  const [shaking, setShaking] = useState(false);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={triggerShake}>
        {label}
      </Button>
      <motion.div
        animate={shaking ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center text-sm"
      >
        <AlertCircle className="mx-auto mb-2 size-5 text-destructive" />
        {label}
      </motion.div>
    </div>
  );
}

function StatesDemo({
  type,
  label,
  replayLabel,
}: {
  type: "empty" | "error";
  label: string;
  replayLabel: string;
}) {
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <RotateCcw className="mr-2 size-3" />
        {replayLabel}
      </Button>
      <div key={key}>
        {type === "empty" ? (
          <EmptyState
            icon={<FileQuestion className="size-10" />}
            title={label}
            description="Demo of animated empty state with bounce-in effect."
          />
        ) : (
          <ErrorState
            title={label}
            message="Demo of animated error state with wiggle icon."
          />
        )}
      </div>
    </div>
  );
}

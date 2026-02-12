"use client";

import { Suspense, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useTranslations } from "@/lib/i18n";
import {
  useBreakpoint,
  useClipboard,
  useCookieConsent,
  useDebounce,
  useEventListener,
  useIntersectionObserver,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useKeyboardShortcut,
  useLocalStorage,
  useMediaQuery,
  useObjectUrl,
  useOnClickOutside,
  useOnlineStatus,
  usePrevious,
  useReducedMotion,
  useScrollPosition,
  useSessionStorage,
  useStorageSync,
  useThrottle,
  useToggle,
  useWindowSize,
} from "@/hooks";

const NAV_SECTIONS = [
  "viewport",
  "interaction",
  "storage",
  "observers",
  "state",
  "advanced",
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

function HookCard({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ValueDisplay({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-medium">{value}</span>
    </div>
  );
}

function DebounceDemo() {
  const t = useTranslations("examples");
  const [input, setInput] = useState("");
  const debouncedValue = useDebounce(input, 500);

  return (
    <HookCard name="useDebounce">
      <div className="space-y-3">
        <Input
          placeholder={t("hooks.typeToTest")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <ValueDisplay label="Input" value={input || "—"} />
        <ValueDisplay label="Debounced (500ms)" value={debouncedValue || "—"} />
      </div>
    </HookCard>
  );
}

function ClipboardDemo() {
  const t = useTranslations("examples");
  const { copy, copied } = useClipboard();

  return (
    <HookCard name="useClipboard">
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => copy("Hello from Core Stack!")}
        >
          {copied ? t("hooks.copied") : t("hooks.copyToClipboard")}
        </Button>
        <ValueDisplay
          label="Status"
          value={
            <Badge variant={copied ? "default" : "secondary"}>
              {copied ? t("hooks.copied") : "Ready"}
            </Badge>
          }
        />
      </div>
    </HookCard>
  );
}

function ClickOutsideDemo() {
  const t = useTranslations("examples");
  const ref = useRef<HTMLDivElement>(null);
  const [clickedOutside, setClickedOutside] = useState(false);

  useOnClickOutside(ref, () => {
    setClickedOutside(true);
    setTimeout(() => setClickedOutside(false), 1500);
  });

  return (
    <HookCard name="useOnClickOutside">
      <div className="space-y-3">
        <div
          ref={ref}
          className="flex h-24 items-center justify-center rounded-md border-2 border-dashed bg-muted/50 text-sm"
        >
          {t("hooks.clickOutside")}
        </div>
        <ValueDisplay
          label="Clicked outside"
          value={
            <Badge variant={clickedOutside ? "destructive" : "secondary"}>
              {clickedOutside ? "Yes" : "No"}
            </Badge>
          }
        />
      </div>
    </HookCard>
  );
}

function KeyboardShortcutDemo() {
  const t = useTranslations("examples");
  const [triggered, setTriggered] = useState(false);

  useKeyboardShortcut("Ctrl+Shift+H", () => {
    setTriggered(true);
    setTimeout(() => setTriggered(false), 1500);
  });

  return (
    <HookCard name="useKeyboardShortcut">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("hooks.pressShortcut")}:{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
            Ctrl+Shift+H
          </kbd>
        </p>
        <ValueDisplay
          label="Triggered"
          value={
            <Badge variant={triggered ? "default" : "secondary"}>
              {triggered ? "Yes!" : "No"}
            </Badge>
          }
        />
      </div>
    </HookCard>
  );
}

function LocalStorageDemo() {
  const [value, setValue, removeValue] = useLocalStorage("demo-key", "Hello!");

  return (
    <HookCard name="useLocalStorage">
      <div className="space-y-3">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Stored in localStorage"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setValue("Reset!")}
          >
            Reset
          </Button>
          <Button size="sm" variant="outline" onClick={removeValue}>
            Remove
          </Button>
        </div>
        <ValueDisplay
          label="localStorage['demo-key']"
          value={value ?? "null"}
        />
      </div>
    </HookCard>
  );
}

function SessionStorageDemo() {
  const [value, setValue] = useSessionStorage("demo-session", "Session!");

  return (
    <HookCard name="useSessionStorage">
      <div className="space-y-3">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Stored in sessionStorage"
        />
        <ValueDisplay
          label="sessionStorage['demo-session']"
          value={value ?? "null"}
        />
      </div>
    </HookCard>
  );
}

function IntersectionDemo() {
  const t = useTranslations("examples");
  const ref = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(ref, {
    threshold: 0.5,
  });

  return (
    <HookCard name="useIntersectionObserver">
      <div className="space-y-3">
        <div
          ref={ref}
          className="flex h-20 items-center justify-center rounded-md border bg-muted/50 text-sm"
        >
          Target element
        </div>
        <ValueDisplay
          label="Visible"
          value={
            <Badge variant={isIntersecting ? "default" : "secondary"}>
              {isIntersecting ? t("hooks.visible") : t("hooks.notVisible")}
            </Badge>
          }
        />
      </div>
    </HookCard>
  );
}

function ToggleDemo() {
  const t = useTranslations("examples");
  const [value, toggle, setTrue, setFalse] = useToggle(false);

  return (
    <HookCard name="useToggle">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={toggle}>
            {t("hooks.toggleValue")}
          </Button>
          <Button size="sm" variant="outline" onClick={setTrue}>
            Set True
          </Button>
          <Button size="sm" variant="outline" onClick={setFalse}>
            Set False
          </Button>
        </div>
        <ValueDisplay
          label={t("hooks.currentValue")}
          value={
            <Badge variant={value ? "default" : "secondary"}>
              {String(value)}
            </Badge>
          }
        />
      </div>
    </HookCard>
  );
}

function PreviousDemo() {
  const t = useTranslations("examples");
  const [count, setCount] = useState(0);
  const previous = usePrevious(count);

  return (
    <HookCard name="usePrevious">
      <div className="space-y-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCount((c) => c + 1)}
        >
          Increment ({count})
        </Button>
        <ValueDisplay label={t("hooks.currentValue")} value={count} />
        <ValueDisplay
          label={t("hooks.previousValue")}
          value={previous ?? "—"}
        />
      </div>
    </HookCard>
  );
}

function ThrottleDemo() {
  const t = useTranslations("examples");
  const [count, setCount] = useState(0);
  const throttledIncrement = useThrottle(() => {
    setCount((c) => c + 1);
  }, 1000);

  return (
    <HookCard name="useThrottle">
      <div className="space-y-3">
        <Button size="sm" variant="outline" onClick={throttledIncrement}>
          {t("hooks.throttleClick")}
        </Button>
        <ValueDisplay label={t("hooks.throttleCount")} value={count} />
        <p className="text-xs text-muted-foreground">
          Throttled to max 1 call per second
        </p>
      </div>
    </HookCard>
  );
}

function EventListenerDemo() {
  const t = useTranslations("examples");
  const [lastKey, setLastKey] = useState("—");

  useEventListener("keydown", (e) => {
    setLastKey(e.key);
  });

  return (
    <HookCard name="useEventListener">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("hooks.eventType")}: keydown
        </p>
        <ValueDisplay label={t("hooks.lastEvent")} value={lastKey} />
      </div>
    </HookCard>
  );
}

function MediaQueryDemo() {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const isHighRes = useMediaQuery("(min-resolution: 2dppx)");

  return (
    <HookCard name="useMediaQuery">
      <div className="space-y-3">
        <ValueDisplay
          label="prefers-color-scheme: dark"
          value={
            <Badge variant={isDark ? "default" : "secondary"}>
              {String(isDark)}
            </Badge>
          }
        />
        <ValueDisplay
          label="orientation: portrait"
          value={
            <Badge variant={isPortrait ? "default" : "secondary"}>
              {String(isPortrait)}
            </Badge>
          }
        />
        <ValueDisplay
          label="min-resolution: 2dppx"
          value={
            <Badge variant={isHighRes ? "default" : "secondary"}>
              {String(isHighRes)}
            </Badge>
          }
        />
      </div>
    </HookCard>
  );
}

function ObjectUrlDemo() {
  const t = useTranslations("examples");
  const [file, setFile] = useState<File | null>(null);
  const objectUrl = useObjectUrl(file);

  return (
    <HookCard name="useObjectUrl">
      <div className="space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        {objectUrl ? (
          <div className="space-y-2">
            <ValueDisplay label={t("hooks.previewUrl")} value="Generated" />
            {/* eslint-disable-next-line @next/next/no-img-element -- Blob URL from ObjectURL, not compatible with next/image */}
            <img
              src={objectUrl}
              alt="Preview"
              className="h-24 w-24 rounded-md border object-cover"
            />
          </div>
        ) : (
          <ValueDisplay
            label={t("hooks.previewUrl")}
            value={t("hooks.noFileSelected")}
          />
        )}
      </div>
    </HookCard>
  );
}

function CookieConsentDemo() {
  const t = useTranslations("examples");
  const { consent, shouldShow, accept, decline, updateConsent } =
    useCookieConsent();

  return (
    <HookCard name="useCookieConsent">
      <div className="space-y-3">
        <ValueDisplay
          label={t("hooks.showBanner")}
          value={
            <Badge variant={shouldShow ? "default" : "secondary"}>
              {String(shouldShow)}
            </Badge>
          }
        />
        <ValueDisplay
          label={t("hooks.cookieEssential")}
          value={<Badge variant="default">{String(consent.essential)}</Badge>}
        />
        <div className="flex items-center justify-between">
          <Label className="text-sm">{t("hooks.cookieAnalytics")}</Label>
          <Switch
            checked={consent.analytics}
            onCheckedChange={(v) => updateConsent({ analytics: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">{t("hooks.cookieMarketing")}</Label>
          <Switch
            checked={consent.marketing}
            onCheckedChange={(v) => updateConsent({ marketing: v })}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={accept}>
            {t("hooks.acceptAll")}
          </Button>
          <Button size="sm" variant="outline" onClick={decline}>
            {t("hooks.declineAll")}
          </Button>
        </div>
      </div>
    </HookCard>
  );
}

function StorageSyncDemo() {
  const t = useTranslations("examples");
  const syncedValue = useStorageSync("demo-sync-key");

  return (
    <HookCard name="useStorageSync">
      <div className="space-y-3">
        <ValueDisplay
          label={t("hooks.storageSyncValue")}
          value={syncedValue ?? "null"}
        />
        <p className="text-xs text-muted-foreground">
          {t("hooks.storageSyncHint")}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            localStorage.setItem("demo-sync-key", `synced-${Date.now()}`)
          }
        >
          Set value in localStorage
        </Button>
      </div>
    </HookCard>
  );
}

function UrlStateDemo() {
  const t = useTranslations("examples");

  return (
    <HookCard name="useUrlState / useUrlPagination">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          These hooks sync state with URL search params. They require Next.js
          navigation context and are best demonstrated in the Data page
          (dashboard/data).
        </p>
        <ValueDisplay
          label={t("hooks.urlStateKey")}
          value="?page=1&pageSize=20"
        />
        <p className="text-xs text-muted-foreground">
          useUrlState syncs any value with a URL param. useUrlPagination wraps
          it for page/pageSize/sortBy/sortOrder.
        </p>
      </div>
    </HookCard>
  );
}

function RealtimeDemo() {
  return (
    <HookCard name="usePolling / useSSE / useWebSocket">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Realtime communication hooks from{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            @/lib/realtime
          </code>
          :
        </p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>
            <strong>usePolling</strong> — React Query wrapper with
            refetchInterval
          </li>
          <li>
            <strong>useSSE</strong> — Server-Sent Events with auto-reconnect
          </li>
          <li>
            <strong>useWebSocket</strong> — WebSocket with exponential backoff
            retry
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          These hooks require a backend endpoint to demonstrate live. Connect
          them to your API for real-time data streaming.
        </p>
      </div>
    </HookCard>
  );
}

function PermissionsDemo() {
  const t = useTranslations("examples");

  return (
    <HookCard name="usePermissions">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Requires AuthProvider context. Demonstrated in the Dashboard Forms
          page with the Can component and PermissionButton.
        </p>
        <div className="space-y-1">
          <ValueDisplay label={t("hooks.canRead")} value="—" />
          <ValueDisplay label={t("hooks.canWrite")} value="—" />
          <ValueDisplay label={t("hooks.canDelete")} value="—" />
          <ValueDisplay label={t("hooks.canManageUsers")} value="—" />
        </div>
        <p className="text-xs text-muted-foreground">
          See /dashboard/forms for live permission checks.
        </p>
      </div>
    </HookCard>
  );
}

export default function HooksPlaygroundPage() {
  const t = useTranslations("examples");
  const { width, height } = useWindowSize();
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const { y: scrollY } = useScrollPosition();
  const isOnline = useOnlineStatus();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex gap-8">
      {/* Sidebar Nav */}
      <nav className="hidden w-48 shrink-0 lg:block">
        <div className="sticky top-20 space-y-1">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(`hooks.${section}`)}
            </a>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("hooks.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("hooks.subtitle")}</p>
        </div>

        {/* === VIEWPORT === */}
        <section className="space-y-6">
          <SectionTitle id="viewport">{t("hooks.viewport")}</SectionTitle>

          <HookCard name="useWindowSize / useBreakpoint">
            <div className="space-y-3">
              <ValueDisplay
                label="Window size"
                value={`${width} x ${height}`}
              />
              <ValueDisplay
                label="Breakpoint"
                value={<Badge variant="secondary">{breakpoint}</Badge>}
              />
              <div className="flex gap-2">
                <Badge variant={isMobile ? "default" : "outline"}>Mobile</Badge>
                <Badge variant={isTablet ? "default" : "outline"}>Tablet</Badge>
                <Badge variant={isDesktop ? "default" : "outline"}>
                  Desktop
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("hooks.resizeWindow")}
              </p>
            </div>
          </HookCard>

          <HookCard name="useScrollPosition">
            <div className="space-y-3">
              <ValueDisplay label="Scroll Y" value={`${scrollY}px`} />
              <p className="text-xs text-muted-foreground">
                {t("hooks.scrollPage")}
              </p>
            </div>
          </HookCard>
        </section>

        {/* === INTERACTION === */}
        <section className="space-y-6">
          <SectionTitle id="interaction">{t("hooks.interaction")}</SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <DebounceDemo />
            <ClipboardDemo />
            <ClickOutsideDemo />
            <KeyboardShortcutDemo />
          </div>
        </section>

        {/* === STORAGE === */}
        <section className="space-y-6">
          <SectionTitle id="storage">{t("hooks.storage")}</SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <LocalStorageDemo />
            <SessionStorageDemo />
          </div>
        </section>

        {/* === OBSERVERS === */}
        <section className="space-y-6">
          <SectionTitle id="observers">{t("hooks.observers")}</SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <IntersectionDemo />

            <HookCard name="useOnlineStatus">
              <ValueDisplay
                label="Status"
                value={
                  <Badge variant={isOnline ? "default" : "destructive"}>
                    {isOnline ? t("hooks.online") : t("hooks.offline")}
                  </Badge>
                }
              />
            </HookCard>

            <HookCard name="useReducedMotion">
              <ValueDisplay
                label="prefers-reduced-motion"
                value={
                  <Badge
                    variant={prefersReducedMotion ? "default" : "secondary"}
                  >
                    {prefersReducedMotion
                      ? t("hooks.reducedMotion")
                      : t("hooks.normalMotion")}
                  </Badge>
                }
              />
            </HookCard>
          </div>
        </section>

        {/* === STATE === */}
        <section className="space-y-6">
          <SectionTitle id="state">{t("hooks.state")}</SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <ToggleDemo />
            <PreviousDemo />
            <ThrottleDemo />
          </div>
        </section>

        {/* === ADVANCED === */}
        <section className="space-y-6">
          <SectionTitle id="advanced">{t("hooks.advanced")}</SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <EventListenerDemo />
            <MediaQueryDemo />
            <ObjectUrlDemo />
            <CookieConsentDemo />
            <StorageSyncDemo />
            <RealtimeDemo />
            <PermissionsDemo />
            <Suspense fallback={null}>
              <UrlStateDemo />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}

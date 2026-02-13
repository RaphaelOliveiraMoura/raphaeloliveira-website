"use client";

import { useState } from "react";

import {
  Bell,
  Download,
  Globe,
  Info,
  Keyboard,
  Monitor,
  Moon,
  Share2,
  Shield,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import {
  CookieConsentBanner,
  LanguageSwitcher,
  OfflineBanner,
  resetTour,
  ShortcutCheatSheet,
  type ShortcutItem,
  Tour,
  type TourConfig,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { useSettings, useUpdateSettings } from "@/lib/api/hooks";
import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import {
  useKeyboardShortcut,
  useOnlineStatus,
  usePWAInstall,
  useShare,
  useToggle,
} from "@/hooks";

import { useTheme } from "@/providers/theme-provider";

const DEMO_SHORTCUTS: ShortcutItem[] = [
  { id: "search", keys: "Ctrl+K", description: "Open command palette" },
  { id: "save", keys: "Ctrl+S", description: "Save changes" },
  { id: "new", keys: "Ctrl+N", description: "New item" },
  { id: "close", keys: "Escape", description: "Close dialog" },
  { id: "theme", keys: "Ctrl+T", description: "Toggle theme" },
];

export default function SettingsPage() {
  const t = useTranslations("examples");
  const { theme, setTheme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const [shortcutsOpen, toggleShortcuts] = useToggle(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const { isInstallable, install } = usePWAInstall();
  const { share } = useShare();

  const tourConfig: TourConfig = {
    id: "settings-tour",
    steps: [
      {
        target: "#tour-appearance",
        title: t("settings.tourAppearanceTitle"),
        content: t("settings.tourAppearanceContent"),
      },
      {
        target: "#tour-language",
        title: t("settings.tourLanguageTitle"),
        content: t("settings.tourLanguageContent"),
      },
      {
        target: "#tour-shortcuts",
        title: t("settings.tourShortcutsTitle"),
        content: t("settings.tourShortcutsContent"),
      },
      {
        target: "#tour-notifications",
        title: t("settings.tourNotificationsTitle"),
        content: t("settings.tourNotificationsContent"),
      },
    ],
  };

  useKeyboardShortcut("Ctrl+T", () => {
    toggleTheme();
    toast.info(t("settings.theme") + ": " + theme);
  });

  const handleShare = async () => {
    try {
      await share({
        title: "Core Stack",
        text: t("settings.aboutDesc"),
        url: window.location.origin,
      });
    } catch {
      toast.error("Share not supported in this browser");
    }
  };

  const simulatePromise = () => {
    toast.promise(
      new Promise<string>((resolve) => setTimeout(() => resolve("ok"), 2000)),
      {
        loading: t("settings.toastPromiseMsg"),
        success: t("settings.toastPromiseSuccess"),
        error: t("settings.toastPromiseError"),
      },
    );
  };

  const { data: backendSettings, isLoading: settingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const handleSaveSettings = async (key: string, value: unknown) => {
    try {
      await updateSettings.mutateAsync([{ key, value }]);
      toast.success("Setting saved!");
    } catch {
      toast.error("Failed to save setting");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {/* Backend Synced Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="size-4" />
            <CardTitle>Synced Settings (Backend)</CardTitle>
          </div>
          <CardDescription>
            Settings persisted on the backend via GET/PUT /settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsLoading ? (
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          ) : backendSettings && backendSettings.length > 0 ? (
            <div className="space-y-3">
              {backendSettings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{setting.key}</p>
                    <p className="text-xs text-muted-foreground">
                      Source: {setting.source} | Updated:{" "}
                      {new Date(setting.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {typeof setting.value === "object"
                      ? JSON.stringify(setting.value)
                      : String(setting.value)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No backend settings found. Try saving a setting.
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveSettings("theme", theme)}
              disabled={updateSettings.isPending}
            >
              Sync Theme to Backend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveSettings("language", navigator.language)}
              disabled={updateSettings.isPending}
            >
              Sync Language to Backend
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <Card id="tour-appearance">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="size-4" />
              <CardTitle>{t("settings.appearance")}</CardTitle>
            </div>
            <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>{t("settings.theme")}</Label>
              <RadioGroup
                value={theme}
                onValueChange={(v) =>
                  setTheme(v as "light" | "dark" | "system")
                }
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label
                    htmlFor="theme-light"
                    className="flex items-center gap-1.5"
                  >
                    <Sun className="size-3.5" />
                    {t("settings.light")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex items-center gap-1.5"
                  >
                    <Moon className="size-3.5" />
                    {t("settings.dark")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label
                    htmlFor="theme-system"
                    className="flex items-center gap-1.5"
                  >
                    <Monitor className="size-3.5" />
                    {t("settings.system")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card id="tour-language">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              <CardTitle>{t("settings.languageSection")}</CardTitle>
            </div>
            <CardDescription>{t("settings.languageDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-4" />
              <CardTitle>{t("settings.privacy")}</CardTitle>
            </div>
            <CardDescription>{t("settings.privacyDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t("settings.showCookieBanner")}</Label>
              <Switch
                checked={showCookieBanner}
                onCheckedChange={setShowCookieBanner}
              />
            </div>
            {showCookieBanner && (
              <div className="rounded-md border p-4">
                <CookieConsentBanner />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card id="tour-shortcuts">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="size-4" />
              <CardTitle>{t("settings.keyboardShortcuts")}</CardTitle>
            </div>
            <CardDescription>
              {t("settings.keyboardShortcutsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={toggleShortcuts}>
              {t("settings.showShortcuts")}
            </Button>
            <ShortcutCheatSheet
              open={shortcutsOpen}
              onOpenChange={toggleShortcuts}
              shortcuts={DEMO_SHORTCUTS}
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card id="tour-notifications">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-4" />
              <CardTitle>{t("settings.notifications")}</CardTitle>
            </div>
            <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success(t("settings.toastSuccessMsg"))}
              >
                {t("settings.toastSuccess")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.error(t("settings.toastErrorMsg"))}
              >
                {t("settings.toastError")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.warning(t("settings.toastWarningMsg"))}
              >
                {t("settings.toastWarning")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info(t("settings.toastInfoMsg"))}
              >
                {t("settings.toastInfo")}
              </Button>
              <Button size="sm" variant="outline" onClick={simulatePromise}>
                {t("settings.toastPromise")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="size-4" />
              <CardTitle>{t("settings.about")}</CardTitle>
            </div>
            <CardDescription>{t("settings.aboutDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("settings.connectionStatus")}</span>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? (
                  <Wifi className="mr-1 size-3" />
                ) : (
                  <WifiOff className="mr-1 size-3" />
                )}
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {isInstallable && (
                <Button size="sm" variant="outline" onClick={install}>
                  <Download className="mr-2 size-4" />
                  {t("settings.installApp")}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 size-4" />
                {t("settings.shareApp")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guided Tour */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="size-4" />
            <CardTitle>{t("settings.tour")}</CardTitle>
          </div>
          <CardDescription>{t("settings.tourDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetTour("settings-tour");
                setTourKey((k) => k + 1);
              }}
            >
              {t("settings.tourStart")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetTour("settings-tour")}
            >
              {t("settings.tourReset")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {tourKey > 0 && (
        <Tour key={tourKey} config={tourConfig} showOnce={false} />
      )}

      <OfflineBanner />
    </div>
  );
}

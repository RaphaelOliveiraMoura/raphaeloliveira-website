import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "ui",
        "api",
        "auth",
        "forms",
        "i18n",
        "seo",
        "telemetry",
        "hooks",
        "config",
        "ci",
        "search",
        "security",
        "storage",
        "validation",
        "media",
        "realtime",
        "deps",
        "specs",
      ],
    ],
    "scope-empty": [1, "never"],
  },
};

export default config;

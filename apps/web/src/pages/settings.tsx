import { Check, MoonStar, Paintbrush, SunMedium } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/use-theme";
import { THEME_DEFINITIONS } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, mode, setTheme, setMode, toggleMode } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <section className="rounded-[20px] border border-border/70 bg-card px-6 py-6 shadow-[0_12px_32px_-24px_color-mix(in_oklab,var(--foreground)_20%,transparent)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {t("settings.badge")}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
              {t("settings.title")}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("settings.description")}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-sm text-secondary-foreground">
            {t("settings.currentTheme")}{" "}
            <span className="font-medium text-foreground">
              {THEME_DEFINITIONS.find((item) => item.value === theme)?.label}
            </span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="font-medium text-foreground">
              {mode === "dark" ? t("settings.themeMode.dark") : t("settings.themeMode.light")}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-border/70 bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
              {t("settings.appearance.title")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t("settings.appearance.description")}
            </p>
          </div>
          <Button variant="outline" onClick={toggleMode}>
            {mode === "dark" ? (
              <>
                <SunMedium className="mr-2 size-4" />
                {t("settings.appearance.useLight")}
              </>
            ) : (
              <>
                <MoonStar className="mr-2 size-4" />
                {t("settings.appearance.useDark")}
              </>
            )}
          </Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            {
              value: "light" as const,
              title: t("settings.themeMode.light"),
              description: t("settings.appearance.lightDescription"),
              icon: SunMedium,
            },
            {
              value: "dark" as const,
              title: t("settings.themeMode.dark"),
              description: t("settings.appearance.darkDescription"),
              icon: MoonStar,
            },
          ].map((option) => {
            const isActive = option.value === mode;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={cn(
                  "rounded-[20px] border p-4 text-left transition-all duration-200",
                  isActive
                    ? "border-primary/35 bg-secondary/45 shadow-[0_16px_36px_-30px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                    : "border-border/70 bg-background/70 hover:border-primary/18 hover:bg-background",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <option.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {option.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {isActive ? <Badge>{t("settings.active")}</Badge> : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {THEME_DEFINITIONS.map((palette) => {
          const isActive = palette.value === theme;

          return (
            <article
              key={palette.value}
              className={cn(
                "rounded-[20px] border bg-card p-5 transition-all duration-200",
                isActive
                  ? "border-primary/35 shadow-[0_20px_40px_-30px_color-mix(in_oklab,var(--primary)_38%,transparent)]"
                  : "border-border/70 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_20px_40px_-34px_color-mix(in_oklab,var(--foreground)_18%,transparent)]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Paintbrush className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em]">
                      {palette.label}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {palette.description}
                    </p>
                  </div>
                </div>
                {isActive ? (
                  <Badge className="rounded-full px-3 py-1">
                    <Check className="mr-1 size-3.5" />
                    {t("settings.active")}
                  </Badge>
                ) : null}
              </div>

              <div className="mt-5 space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="size-10 rounded-2xl border border-black/5"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Primary</p>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.palette.primary")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="size-10 rounded-2xl border border-black/5"
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Secondary</p>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.palette.secondary")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="size-10 rounded-2xl border border-black/5"
                    style={{ backgroundColor: palette.neutral }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Neutral</p>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.palette.neutral")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {t("settings.palette.scope")}
                </p>
                <Button
                  variant={isActive ? "secondary" : "outline"}
                  onClick={() => setTheme(palette.value)}
                >
                  {isActive ? t("settings.palette.selected") : t("settings.palette.usePalette")}
                </Button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

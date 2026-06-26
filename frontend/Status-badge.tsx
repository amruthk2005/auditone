import { cn } from "@/lib/utils";
const tone = {
  primary: "bg-primary/10 text-primary ring-1 ring-primary/20",
  success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  danger: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  info: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  muted: "bg-muted text-foreground/70 ring-1 ring-border",
} as const;
export type Tone = keyof typeof tone;
const map: Record<string, Tone> = {
  // generic
  active: "success",
  completed: "success",
  closed: "muted",
  scheduled: "info",
  "in progress": "primary",
  "in use": "success",
  "in storage": "muted",
  maintenance: "warning",
  invited: "info",
  disabled: "muted",
  // scan results
  match: "success",
  "location mismatch": "warning",
  missing: "danger",
  damaged: "warning",
  mismatch: "info",
  verified: "success",
};
export function StatusBadge({ value, toneOverride, className }: { value: string; toneOverride?: Tone; className?: string }) {
  const t = toneOverride ?? map[value.toLowerCase()] ?? "muted";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tone[t], className)}>
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
        primary: "bg-primary",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-rose-500",
        info: "bg-sky-500",
        muted: "bg-muted-foreground/50",
      }[t])} />
      {value}
    </span>
  );
}
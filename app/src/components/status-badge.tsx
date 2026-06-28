type Tone = "primary" | "success" | "warning" | "danger" | "info" | "muted";

const map: Record<string, Tone> = {
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
  match: "success",
  "location mismatch": "warning",
  missing: "danger",
  damaged: "warning",
  mismatch: "info",
  verified: "success",
};

interface StatusBadgeProps {
  value: string;
  toneOverride?: Tone;
}

export function StatusBadge({ value, toneOverride }: StatusBadgeProps) {
  const tone = toneOverride ?? map[value.toLowerCase()] ?? "muted";
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {value}
    </span>
  );
}

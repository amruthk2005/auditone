import type { LucideIcon } from "lucide-react";

export type KpiItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  tint?: string;
  hint?: string;
};

interface KpiStripProps {
  items: KpiItem[];
}

export function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className="kpi-grid">
      {items.map((k) => (
        <div key={k.label} className="kpi-card">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p className="kpi-label">{k.label}</p>
              <p className="kpi-value">{k.value}</p>
              {k.hint && <p className="kpi-hint">{k.hint}</p>}
            </div>
            <span
              className="kpi-icon"
              style={{
                background: k.tint ? undefined : "rgba(109,40,217,0.1)",
                color: k.tint ? undefined : "var(--primary)",
              }}
            >
              <k.icon size={20} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

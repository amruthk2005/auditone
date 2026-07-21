import { useState, useEffect, useRef, useCallback } from "react";
import { PageShell } from "@/components/page-shell";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { validateQrCode } from "@/lib/api";
import {
  Search, ScanLine, CheckCircle2, AlertCircle, Clock, Trash2, Package,
  Camera, SwitchCamera, Loader2, Tag, MapPin, DollarSign, Calculator, ChevronDown
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductInfo = {
  id: number; name: string; category: string;
  serial_no: string | null; location: string | null;
  status: string; cost: string;
};

type ValidationResult = {
  valid: boolean; qr_code: string; qr_id: number; product: ProductInfo | null;
};

type ScanRecord = {
  id: string;
  timestamp: string;
  qrCode: string;
  productName: string;
  category: string;
  location: string;
  status: string;
  cost: string;
  depreciationMethod: string;
  netBookValue: string;
  valid: boolean;
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function nowString() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function calculateDepreciationValues(costNum: number, method: string) {
  let rate = 0.20;
  if (method.includes("Declining")) rate = 0.30;
  else if (method.includes("WDV")) rate = 0.25;
  else if (method.includes("FIFO")) rate = 0.15;
  else if (method.includes("SYD")) rate = 0.28;

  const dep = Math.round(costNum * rate);
  const bookVal = Math.round(costNum - dep);
  return { dep, bookVal, ratePct: Math.round(rate * 100) };
}

// ─── Inner Scanner Component (owns camera lifecycle) ─────────────────────────
function ScannerWithCallback({
  onValidated,
}: {
  onValidated: (decodedText: string, result?: ValidationResult, depreciationMethod?: string) => void;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraIdx, setActiveCameraIdx] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [depreciationMethod, setDepreciationMethod] = useState("Straight-line (20% p.a.)");

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunning) {
      await scannerRef.current.stop().catch(() => null);
      scannerRef.current.clear();
      setIsRunning(false);
    }
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => null);
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = useCallback(async (cameraId: string) => {
    setIsStarting(true);
    setError(null);
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("ao-scans-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
    }
    try {
      await scannerRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (decodedText === lastScanned) return;
          setLastScanned(decodedText);
          setValidating(true);
          setValidationResult(null);
          setValidationError(null);
          try {
            const result: ValidationResult = await validateQrCode(decodedText);
            setValidationResult(result);
            onValidated(decodedText, result, depreciationMethod);
          } catch {
            setValidationError("QR code not recognised in AuditOne system.");
            onValidated(decodedText, undefined, depreciationMethod);
          } finally {
            setValidating(false);
          }
        },
        () => {}
      );
      setIsRunning(true);
    } catch (err: unknown) {
      setError(`Camera error: ${(err as Error).message ?? String(err)}`);
    } finally {
      setIsStarting(false);
    }
  }, [lastScanned, onValidated, depreciationMethod]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) { setError("No camera found."); return; }
        setCameras(devices);
        const rearIdx = devices.findIndex(d => /back|rear|environment/i.test(d.label));
        const idx = rearIdx >= 0 ? rearIdx : 0;
        setActiveCameraIdx(idx);
        startScanner(devices[idx].id);
      })
      .catch(err => setError(`Camera access denied: ${err.message ?? String(err)}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = async () => {
    await stopScanner();
    const nextIdx = (activeCameraIdx + 1) % cameras.length;
    setActiveCameraIdx(nextIdx);
    scannerRef.current = null;
    setTimeout(() => startScanner(cameras[nextIdx].id), 300);
  };

  const handleMethodChange = (newMethod: string) => {
    setDepreciationMethod(newMethod);
    if (validationResult && validationResult.valid) {
      onValidated(validationResult.qr_code, validationResult, newMethod);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", borderRadius: "1rem", overflow: "hidden", border: "2px solid rgba(109,40,217,0.4)", background: "#000" }}>
        <div id="ao-scans-reader" style={{ width: "100%" }} />
        {isStarting && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", flexDirection: "column", gap: "0.75rem" }}>
            <Loader2 size={32} color="#a855f7" className="animate-spin" />
            <span style={{ color: "#fff", fontSize: "0.875rem" }}>Starting camera…</span>
          </div>
        )}
        {cameras.length > 1 && isRunning && (
          <button onClick={handleSwitchCamera} style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.5rem", color: "#fff", cursor: "pointer", padding: "0.4rem 0.6rem", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem" }}>
            <SwitchCamera size={14} /> Switch
          </button>
        )}
        {!isRunning && !isStarting && !error && (
          <div style={{ minHeight: "260px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", background: "rgba(0,0,0,0.6)" }}>
            <Camera size={40} color="rgba(255,255,255,0.3)" />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Camera not active</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem" }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {validating && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.3)", borderRadius: "0.5rem", padding: "0.75rem", color: "var(--primary)", fontSize: "0.85rem" }}>
          <Loader2 size={15} className="animate-spin" /> Validating scanned code…
        </div>
      )}
      {validationError && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem" }}>
          <AlertCircle size={15} /> {validationError}
        </div>
      )}

      {/* Scanned Product Result Card */}
      {validationResult?.valid && validationResult.product && (
        <div style={{ marginTop: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.07)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderBottom: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.1)" }}>
            <CheckCircle2 size={16} color="#22c55e" />
            <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#22c55e" }}>Asset Verified — Added to log ✓</span>
          </div>

          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{validationResult.product.name}</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {[
                { icon: Tag, label: "Category", value: validationResult.product.category },
                { icon: Package, label: "Status", value: validationResult.product.status },
                { icon: MapPin, label: "Location", value: validationResult.product.location || "—" },
                { icon: DollarSign, label: "Cost", value: `₹${Number(validationResult.product.cost).toLocaleString("en-IN")}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ background: "rgba(0,0,0,0.08)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                    <Icon size={11} /> {label}
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Depreciation Method Dropdown requested by user */}
            <div style={{ marginTop: "0.25rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.35rem" }}>
                <Calculator size={13} color="var(--primary)" /> Select Depreciation Method for Audit:
              </label>
              <select
                className="input"
                style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem", width: "100%", borderColor: "rgba(109,40,217,0.3)" }}
                value={depreciationMethod}
                onChange={(e) => handleMethodChange(e.target.value)}
              >
                <option value="Straight-line (20% p.a.)">Straight-line Method (20% p.a.)</option>
                <option value="Declining Balance (30% p.a.)">Declining Balance Method (30% p.a.)</option>
                <option value="Written Down Value (WDV - 25% p.a.)">Written Down Value (WDV - 25% p.a.)</option>
                <option value="FIFO Inventory (15% p.a.)">FIFO Inventory Valuation (15% p.a.)</option>
                <option value="Sum-of-Years'-Digits (SYD - 28% p.a.)">Sum-of-the-Years'-Digits (SYD - 28% p.a.)</option>
              </select>
            </div>

            {/* Live Depreciation Calculation Banner */}
            {(() => {
              const costNum = Number(validationResult.product.cost || 0);
              const { dep, bookVal } = calculateDepreciationValues(costNum, depreciationMethod);
              return (
                <div style={{ display: "flex", gap: "0.5rem", background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.2)", borderRadius: "0.5rem", padding: "0.625rem 0.75rem", fontSize: "0.78rem" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: "var(--muted-foreground)" }}>Annual Dep: </span>
                    <strong style={{ color: "#dc2626" }}>-₹{dep.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <span style={{ color: "var(--muted-foreground)" }}>Net Book Value: </span>
                    <strong style={{ color: "#059669" }}>₹{bookVal.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              );
            })()}

            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: "0.25rem" }}
              onClick={() => { setValidationResult(null); setValidationError(null); setLastScanned(null); }}
            >
              Scan Next Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Scans Page ──────────────────────────────────────────────────────────
export function ScansPage() {
  const [scanLog, setScanLog] = useState<ScanRecord[]>([]);
  const [search, setSearch] = useState("");

  const handleValidated = useCallback((decodedText: string, result?: ValidationResult, depreciationMethod?: string) => {
    const method = depreciationMethod || "Straight-line (20% p.a.)";
    const costNum = result?.product?.cost ? Number(result.product.cost) : 0;
    const { bookVal } = calculateDepreciationValues(costNum, method);

    const rec: ScanRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: nowString(),
      qrCode: result?.qr_code ?? decodedText,
      productName: result?.product?.name ?? "Unknown Asset",
      category: result?.product?.category ?? "—",
      location: result?.product?.location ?? "—",
      status: result?.product?.status ?? "—",
      cost: result?.product?.cost ? `₹${Number(result.product.cost).toLocaleString("en-IN")}` : "—",
      depreciationMethod: method.split("(")[0].trim(),
      netBookValue: costNum > 0 ? `₹${bookVal.toLocaleString("en-IN")}` : "—",
      valid: result?.valid ?? false,
    };

    setScanLog(prev => {
      // Avoid duplicate logs for same scan code in top 1 item
      if (prev.length > 0 && prev[0].qrCode === rec.qrCode && prev[0].depreciationMethod === rec.depreciationMethod) {
        return prev;
      }
      return [rec, ...prev];
    });
  }, []);

  const filtered = scanLog.filter(r =>
    search === "" ||
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.qrCode.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    r.depreciationMethod.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell
      title="Scans & Validation"
      description="Scan QR codes to validate assets and select accounting depreciation methods in real time."
      actions={
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search scanned items or method…"
              className="input"
              style={{ paddingLeft: "2rem", fontSize: "0.8rem", height: "2.1rem" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {scanLog.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={() => setScanLog([])} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Trash2 size={14} /> Clear Log
            </button>
          )}
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 460px) 1fr", gap: "1.75rem", alignItems: "start" }}>

        {/* ── Left: Scanner ─────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(5,150,105,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                <ScanLine size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem" }}>Asset Scanner & Depreciation</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Point camera at asset QR code</p>
              </div>
            </div>
            <ScannerWithCallback onValidated={handleValidated} />
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#059669" }}>{scanLog.filter(r => r.valid).length}</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>Verified Assets</p>
            </div>
            <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#dc2626" }}>{scanLog.filter(r => !r.valid).length}</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>Invalid / Unknown</p>
            </div>
          </div>
        </div>

        {/* ── Right: Scanned Items Log ───────────────────── */}
        <div className="card" style={{ minHeight: "420px" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                <Package size={15} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem" }}>Scanned Assets & Depreciation Log</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                  {scanLog.length} item{scanLog.length !== 1 ? "s" : ""} logged with depreciation methods
                </p>
              </div>
            </div>
          </div>

          {scanLog.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", color: "var(--muted-foreground)", gap: "0.75rem" }}>
              <ScanLine size={40} style={{ opacity: 0.25 }} />
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500 }}>No items scanned yet</p>
              <p style={{ margin: 0, fontSize: "0.8rem" }}>Scan an asset QR code to calculate depreciation and log details</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "3rem 2rem", textAlign: "center", color: "var(--muted-foreground)" }}>
              No items match your search.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Product</th>
                    <th>Depreciation Method</th>
                    <th>Acquisition Cost</th>
                    <th>Net Book Value</th>
                    <th>Scanned At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.valid ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 600, color: "#059669", background: "rgba(5,150,105,0.1)", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                            <CheckCircle2 size={12} /> Valid
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 600, color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                            <AlertCircle size={12} /> Unknown
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.productName}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "var(--primary)", marginTop: "0.1rem" }}>
                          {r.qrCode.length > 22 ? r.qrCode.slice(0, 22) + "…" : r.qrCode}
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.73rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {r.depreciationMethod}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.cost}</td>
                      <td style={{ fontWeight: 700, color: "#059669", fontSize: "0.875rem" }}>{r.netBookValue}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                          <Clock size={12} /> {r.timestamp}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
}

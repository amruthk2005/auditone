import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { validateQrCode } from "@/lib/api";
import {
  CheckCircle2, AlertCircle, Camera, SwitchCamera,
  Loader2, Package, MapPin, Tag, DollarSign,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ProductInfo = {
  id: number;
  name: string;
  category: string;
  serial_no: string | null;
  location: string | null;
  status: string;
  cost: string;
};

type ValidationResult = {
  valid: boolean;
  qr_code: string;
  qr_id: number;
  product: ProductInfo | null;
};

interface QRScannerProps {
  /** Called with raw decoded text on every successful scan */
  onScanSuccess?: (decodedText: string) => void;
  /** If true, automatically validate scanned code against the backend */
  autoValidate?: boolean;
  /** Show a product detail card on successful validation */
  showProductCard?: boolean;
}

// ── Scanner Component ─────────────────────────────────────────────────────────
export function QRScanner({
  onScanSuccess,
  autoValidate = true,
  showProductCard = true,
}: QRScannerProps) {
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

  // ── Cleanup ────────────────────────────────────────────────────────────────
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

  // ── Start scanner with a given camera id ──────────────────────────────────
  const startScanner = useCallback(
    async (cameraId: string) => {
      setIsStarting(true);
      setError(null);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("ao-qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      try {
        await scannerRef.current.start(
          cameraId,
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            if (decodedText === lastScanned) return; // deduplicate
            setLastScanned(decodedText);
            onScanSuccess?.(decodedText);

            if (autoValidate) {
              setValidating(true);
              setValidationResult(null);
              setValidationError(null);
              try {
                const result: ValidationResult = await validateQrCode(decodedText);
                setValidationResult(result);
              } catch {
                setValidationError("QR code not recognised in AuditOne system.");
              } finally {
                setValidating(false);
              }
            }
          },
          () => { /* parse errors are frequent – ignore */ }
        );
        setIsRunning(true);
      } catch (err: unknown) {
        setError(`Camera error: ${(err as Error).message ?? String(err)}`);
      } finally {
        setIsStarting(false);
      }
    },
    [autoValidate, lastScanned, onScanSuccess]
  );

  // ── Initialise: fetch cameras then start ──────────────────────────────────
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          setError("No camera found on this device.");
          return;
        }
        setCameras(devices);
        // Prefer rear camera on mobile
        const rearIdx = devices.findIndex((d) =>
          /back|rear|environment/i.test(d.label)
        );
        const idx = rearIdx >= 0 ? rearIdx : 0;
        setActiveCameraIdx(idx);
        startScanner(devices[idx].id);
      })
      .catch((err) => {
        setError(`Camera access denied: ${err.message ?? String(err)}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Switch camera ─────────────────────────────────────────────────────────
  const handleSwitchCamera = async () => {
    await stopScanner();
    const nextIdx = (activeCameraIdx + 1) % cameras.length;
    setActiveCameraIdx(nextIdx);
    scannerRef.current = null; // force re-init
    setTimeout(() => startScanner(cameras[nextIdx].id), 300);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto" }}>
      {/* Scanner viewport */}
      <div
        style={{
          position: "relative", borderRadius: "1rem",
          overflow: "hidden", border: "2px solid rgba(109,40,217,0.4)",
          background: "#000",
        }}
      >
        <div id="ao-qr-reader" style={{ width: "100%" }} />

        {/* Loading overlay */}
        {isStarting && (
          <div
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.7)", flexDirection: "column", gap: "0.75rem",
            }}
          >
            <Loader2 size={32} color="#a855f7" className="animate-spin" />
            <span style={{ color: "#fff", fontSize: "0.875rem" }}>Starting camera…</span>
          </div>
        )}

        {/* Switch camera button */}
        {cameras.length > 1 && isRunning && (
          <button
            onClick={handleSwitchCamera}
            style={{
              position: "absolute", top: "0.75rem", right: "0.75rem",
              background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "0.5rem", color: "#fff", cursor: "pointer",
              padding: "0.4rem 0.6rem", display: "flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.75rem",
            }}
            title="Switch Camera"
          >
            <SwitchCamera size={14} /> Switch
          </button>
        )}

        {/* Camera icon placeholder when not running */}
        {!isRunning && !isStarting && !error && (
          <div
            style={{
              minHeight: "260px", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "0.75rem",
              background: "rgba(0,0,0,0.6)",
            }}
          >
            <Camera size={40} color="rgba(255,255,255,0.3)" />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
              Camera not active
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem",
            background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Validating indicator */}
      {validating && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem",
            background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.3)",
            borderRadius: "0.5rem", padding: "0.75rem", color: "var(--primary)", fontSize: "0.85rem",
          }}
        >
          <Loader2 size={15} className="animate-spin" />
          Validating scanned code…
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem",
            background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={15} />
          {validationError}
        </div>
      )}

      {/* Product card on successful validation */}
      {showProductCard && validationResult?.valid && validationResult.product && (
        <div
          style={{
            marginTop: "1rem", borderRadius: "0.75rem",
            border: "1px solid rgba(34,197,94,0.3)",
            background: "rgba(34,197,94,0.07)", overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1rem", borderBottom: "1px solid rgba(34,197,94,0.2)",
              background: "rgba(34,197,94,0.1)",
            }}
          >
            <CheckCircle2 size={16} color="#22c55e" />
            <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#22c55e" }}>
              Asset Verified
            </span>
            <span
              style={{
                marginLeft: "auto", fontFamily: "monospace",
                fontSize: "0.75rem", color: "rgba(255,255,255,0.5)",
              }}
            >
              {validationResult.qr_code}
            </span>
          </div>

          {/* Product details */}
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              {validationResult.product.name}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {[
                { icon: Tag, label: "Category", value: validationResult.product.category },
                { icon: Package, label: "Status", value: validationResult.product.status },
                { icon: MapPin, label: "Location", value: validationResult.product.location || "—" },
                { icon: DollarSign, label: "Cost", value: `₹${Number(validationResult.product.cost).toLocaleString("en-IN")}` },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(0,0,0,0.2)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                    <Icon size={11} /> {label}
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            {validationResult.product.serial_no && (
              <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontFamily: "monospace" }}>
                S/N: {validationResult.product.serial_no}
              </div>
            )}

            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: "0.25rem" }}
              onClick={() => {
                setValidationResult(null);
                setValidationError(null);
                setLastScanned(null);
              }}
            >
              Scan Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { Construction, Calendar, Building2, FileText, Settings as SettingsIcon, Monitor, Smartphone } from "lucide-react";

export function HazardBar({ height = 6 }) {
  return (
    <div
      style={{
        height,
        background:
          "repeating-linear-gradient(135deg, var(--amber) 0 10px, var(--charcoal) 10px 20px)",
      }}
    />
  );
}

export function SaveIndicator({ status }) {
  if (status === "saving") return <span style={styles.saveTag}>saving…</span>;
  if (status === "error") return <span style={{ ...styles.saveTag, color: "var(--orange)" }}>save failed</span>;
  return <span style={{ ...styles.saveTag, opacity: 0.6 }}>saved</span>;
}

const TABS = [
  { id: "shifts", label: "Shifts", icon: Calendar },
  { id: "agencies", label: "Agencies", icon: Building2 },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Header({ activeTab, setTab, saveFlag, isMobileView, setIsMobileView }) {
  return (
    <header className="no-print" style={styles.header}>
      <div style={styles.headerRow}>
        <div style={styles.brand}>
          <Construction size={26} color="var(--amber)" />
          <div>
            <div style={styles.brandText}>SHIFT LOG</div>
            <div style={styles.brandSub}>Traffic Management Specialist</div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-nav-tabs">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  ...styles.desktopTabButton,
                  ...(active ? styles.desktopTabActive : {}),
                }}
              >
                <Icon size={16} color={active ? "var(--amber)" : "var(--text-dim)"} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SaveIndicator status={saveFlag} />
          
          {/* Viewport switcher button for desktop environment testing */}
          <button
            onClick={() => setIsMobileView(!isMobileView)}
            title={isMobileView ? "Switch to Wide Desktop View" : "Switch to Mobile Frame Preview"}
            style={styles.viewportBtn}
          >
            {isMobileView ? (
              <>
                <Monitor size={15} color="var(--amber)" />
                <span style={styles.viewportLabel}>Desktop View</span>
              </>
            ) : (
              <>
                <Smartphone size={15} color="var(--amber)" />
                <span style={styles.viewportLabel}>Mobile Frame</span>
              </>
            )}
          </button>
        </div>
      </div>
      <HazardBar />
    </header>
  );
}

const styles = {
  header: { background: "var(--surface)" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 12px" },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandText: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: 1.5, color: "var(--text)", lineHeight: 1 },
  brandSub: { fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 },
  saveTag: { fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" },
  desktopTabButton: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 14px",
    borderRadius: 8,
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--text-dim)",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  desktopTabActive: {
    background: "var(--surface-2)",
    color: "var(--text)",
    borderColor: "var(--border)",
  },
  viewportBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 7,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-dim)",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  viewportLabel: {
    display: "inline-block",
  },
};

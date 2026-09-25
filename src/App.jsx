import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Building2, FileText, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { safeGet, safeSet, safeDeleteAll } from "./lib/storage";
import { emptyProfile } from "./lib/helpers";

import Header from "./components/Header";
import ShiftsTab from "./components/ShiftsTab";
import AgenciesTab from "./components/AgenciesTab";
import InvoicesTab from "./components/InvoicesTab";
import InvoiceDoc from "./components/InvoiceDoc";
import SettingsTab from "./components/SettingsTab";

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...styles.tabButton, color: active ? "var(--amber)" : "var(--text-dim)" }}>
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      <span style={{ fontSize: 11, marginTop: 3, fontFamily: "var(--font-body)", fontWeight: active ? 700 : 500 }}>
        {label}
      </span>
    </button>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("shifts");
  const [profile, setProfile] = useState(emptyProfile);
  const [agencies, setAgencies] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [saveFlag, setSaveFlag] = useState("idle"); // idle | saving | error
  const [viewingInvoiceId, setViewingInvoiceId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [p, a, s, i] = await Promise.all([
        safeGet("profile"),
        safeGet("agencies"),
        safeGet("shifts"),
        safeGet("invoices"),
      ]);
      if (p) setProfile({ ...emptyProfile, ...JSON.parse(p) });
      if (a) setAgencies(JSON.parse(a));
      if (s) setShifts(JSON.parse(s));
      if (i) setInvoices(JSON.parse(i));
    } catch (e) {
      console.error("Error loading application state:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const persist = async (key, value, setter) => {
    setter(value);
    setSaveFlag("saving");
    const ok = await safeSet(key, value);
    setSaveFlag(ok ? "idle" : "error");
  };

  const saveProfile = (v) => persist("profile", v, setProfile);
  const saveAgencies = (v) => persist("agencies", v, setAgencies);
  const saveShifts = (v) => persist("shifts", v, setShifts);
  const saveInvoices = (v) => persist("invoices", v, setInvoices);

  const agencyById = useMemo(() => Object.fromEntries(agencies.map((a) => [a.id, a])), [agencies]);

  const resetAll = async () => {
    await safeDeleteAll(["profile", "agencies", "shifts", "invoices"]);
    setProfile(emptyProfile);
    setAgencies([]);
    setShifts([]);
    setInvoices([]);
  };

  const handleUpdateInvoice = (updatedInvoice) => {
    const next = invoices.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv));
    saveInvoices(next);
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 className="spin" size={32} color="var(--amber)" />
        <div style={{ marginTop: 12, fontFamily: "var(--font-body)", color: "var(--text-dim)", fontSize: 14 }}>
          Loading shift log & records…
        </div>
      </div>
    );
  }

  const viewingInvoice = invoices.find((i) => i.id === viewingInvoiceId) || null;

  return (
    <div className={`app-shell-container ${isMobileView ? "app-shell-mobile" : "app-shell-desktop"}`}>
      {viewingInvoice ? (
        <InvoiceDoc
          invoice={viewingInvoice}
          onBack={() => setViewingInvoiceId(null)}
          onTogglePaid={() => {
            const next = invoices.map((i) =>
              i.id === viewingInvoice.id ? { ...i, status: i.status === "paid" ? "unpaid" : "paid" } : i
            );
            saveInvoices(next);
          }}
          onUpdateInvoice={handleUpdateInvoice}
        />
      ) : (
        <>
          <Header
            activeTab={tab}
            setTab={setTab}
            saveFlag={saveFlag}
            isMobileView={isMobileView}
            setIsMobileView={setIsMobileView}
          />

          <main className="no-print" style={styles.main}>
            {tab === "shifts" && (
              <ShiftsTab
                shifts={shifts} agencies={agencies} agencyById={agencyById}
                saveShifts={saveShifts}
              />
            )}
            {tab === "agencies" && (
              <AgenciesTab
                agencies={agencies} shifts={shifts}
                saveAgencies={saveAgencies}
              />
            )}
            {tab === "invoices" && (
              <InvoicesTab
                agencies={agencies} shifts={shifts} invoices={invoices} profile={profile}
                saveShifts={saveShifts} saveInvoices={saveInvoices} saveProfile={saveProfile}
                onView={(id) => setViewingInvoiceId(id)}
              />
            )}
            {tab === "settings" && (
              <SettingsTab
                profile={profile}
                saveProfile={saveProfile}
                onReset={resetAll}
                onReloadAll={loadAllData}
              />
            )}
          </main>

          <nav className="no-print mobile-tab-bar">
            <TabButton icon={Calendar} label="Shifts" active={tab === "shifts"} onClick={() => setTab("shifts")} />
            <TabButton icon={Building2} label="Agencies" active={tab === "agencies"} onClick={() => setTab("agencies")} />
            <TabButton icon={FileText} label="Invoices" active={tab === "invoices"} onClick={() => setTab("invoices")} />
            <TabButton icon={SettingsIcon} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
          </nav>
        </>
      )}
    </div>
  );
}

const styles = {
  loadingScreen: {
    minHeight: 460,
    width: "100%",
    maxWidth: 540,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--charcoal)",
    borderRadius: 14,
    margin: "auto",
  },
  main: { flex: 1, padding: "24px 24px 32px", overflowY: "auto" },
  tabButton: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 8px", background: "transparent", border: "none", cursor: "pointer" },
};

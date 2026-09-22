import React, { useState, useEffect } from "react";
import { FileText, Banknote, Check, AlertTriangle, Download, Upload, ShieldCheck } from "lucide-react";
import { num } from "../lib/helpers";
import { exportAllData, importBackupData } from "../lib/storage";
import ConfirmDialog from "./ConfirmDialog";

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={styles.sectionTitle}>{children}</h2>
      {sub && <div style={styles.sectionSub}>{sub}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export default function SettingsTab({ profile, saveProfile, onReset, onReloadAll }) {
  const [local, setLocal] = useState(profile);
  const [confirmReset, setConfirmReset] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  useEffect(() => setLocal(profile), [profile]);

  const set = (field) => (e) => setLocal({ ...local, [field]: e.target.value });

  const handleSave = () => {
    saveProfile({
      ...local,
      nextInvoiceNumber: num(local.nextInvoiceNumber) || 1,
      defaultPaymentTermsDays: num(local.defaultPaymentTermsDays) || 14
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const result = await importBackupData(evt.target.result);
      if (result.success) {
        setImportStatus({ type: "success", message: "Data backup restored successfully!" });
        if (onReloadAll) onReloadAll();
      } else {
        setImportStatus({ type: "error", message: `Import failed: ${result.error}` });
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="desktop-grid-2 desktop-grid-settings">
        {/* Left Column: Personal & Subcontractor Details */}
        <div>
          <SectionTitle sub="These details appear on every invoice you generate.">
            Subcontractor details
          </SectionTitle>

          <div style={styles.card}>
            <div style={styles.formGrid2}>
              <Field label="Business name (optional)"><input value={local.businessName || ""} onChange={set("businessName")} style={styles.input} /></Field>
              <Field label="Your name"><input value={local.yourName || ""} onChange={set("yourName")} style={styles.input} /></Field>
            </div>
            <Field label="Address"><textarea value={local.address || ""} onChange={set("address")} rows={2} style={{ ...styles.input, resize: "vertical", fontFamily: "var(--font-body)" }} /></Field>
            <div style={styles.formGrid2}>
              <Field label="Email"><input type="email" value={local.email || ""} onChange={set("email")} style={styles.input} /></Field>
              <Field label="Phone"><input value={local.phone || ""} onChange={set("phone")} style={styles.input} /></Field>
            </div>

            <div style={{ height: 6 }} />
            <div style={styles.subHeading}><ShieldCheck size={14} /> CIS & Tax Information</div>
            <div style={styles.formGrid2}>
              <Field label="UTR (10-Digit Reference)"><input value={local.utr || ""} onChange={set("utr")} placeholder="10 digits" style={styles.input} /></Field>
              <Field label="National Insurance Number"><input value={local.niNumber || ""} onChange={set("niNumber")} placeholder="QQ 12 34 56 C" style={styles.input} /></Field>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={styles.fieldLabel}>CIS registration status</span>
              <div style={styles.payTypeToggle}>
                <button
                  type="button"
                  onClick={() => setLocal({ ...local, cisRegistered: true })}
                  style={{ ...styles.toggleBtn, ...(local.cisRegistered ? styles.toggleBtnActive : {}) }}
                >
                  CIS registered (20%)
                </button>
                <button
                  type="button"
                  onClick={() => setLocal({ ...local, cisRegistered: false })}
                  style={{ ...styles.toggleBtn, ...(!local.cisRegistered ? styles.toggleBtnActive : {}) }}
                >
                  Not registered (30%)
                </button>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: -4, marginBottom: 8 }}>
                Sets the CIS deduction rate shown on generated invoices.
              </div>
            </div>

            <div style={styles.formFooter}>
              <span style={{ color: "var(--green)", fontSize: 13, opacity: savedFlash ? 1 : 0, transition: "opacity .2s" }}>Saved</span>
              <button type="button" style={styles.primaryButton} onClick={handleSave}><Check size={15} /> Save details</button>
            </div>
          </div>
        </div>

        {/* Right Column: Payment, Numbering, & Data Backup */}
        <div>
          <SectionTitle sub="Payment details, backup exports & data reset.">
            Payment & App data
          </SectionTitle>

          <div style={styles.card}>
            <div style={styles.subHeading}><Banknote size={14} /> Bank Payment Details</div>
            <div style={styles.formGrid2}>
              <Field label="Account name"><input value={local.accountName || ""} onChange={set("accountName")} style={styles.input} /></Field>
              <Field label="Bank name"><input value={local.bankName || ""} onChange={set("bankName")} style={styles.input} /></Field>
            </div>
            <div style={styles.formGrid2}>
              <Field label="Sort code"><input value={local.sortCode || ""} onChange={set("sortCode")} placeholder="00-00-00" style={styles.input} /></Field>
              <Field label="Account number"><input value={local.accountNumber || ""} onChange={set("accountNumber")} style={styles.input} /></Field>
            </div>

            <div style={{ height: 6 }} />
            <div style={styles.subHeading}><FileText size={14} /> Invoice Numbering</div>
            <div style={styles.formGrid2}>
              <Field label="Prefix"><input value={local.invoicePrefix || "INV"} onChange={set("invoicePrefix")} style={styles.input} /></Field>
              <Field label="Next number"><input type="number" min="1" value={local.nextInvoiceNumber || 1} onChange={set("nextInvoiceNumber")} style={styles.input} /></Field>
            </div>
            <Field label="Default payment terms (days)">
              <input type="number" min="0" value={local.defaultPaymentTermsDays || 14} onChange={set("defaultPaymentTermsDays")} style={{ ...styles.input, maxWidth: 120 }} />
            </Field>

            <div style={styles.formFooter}>
              <span style={{ color: "var(--green)", fontSize: 13, opacity: savedFlash ? 1 : 0, transition: "opacity .2s" }}>Saved</span>
              <button type="button" style={styles.primaryButton} onClick={handleSave}><Check size={15} /> Save details</button>
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div style={styles.card}>
            <div style={styles.subHeading}><Download size={14} /> Backup & Restore Records</div>
            <div style={{ color: "var(--text-dim)", fontSize: 12.5, marginBottom: 12 }}>
              Download your full data backup as JSON to keep records safe or sync across devices.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" style={styles.secondaryButton} onClick={exportAllData}>
                <Download size={15} /> Export JSON Backup
              </button>

              <label style={{ ...styles.secondaryButton, cursor: "pointer", margin: 0 }}>
                <Upload size={15} /> Restore JSON Backup
                <input type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
              </label>
            </div>

            {importStatus && (
              <div style={{ marginTop: 10, fontSize: 13, color: importStatus.type === "success" ? "var(--green)" : "var(--orange)" }}>
                {importStatus.message}
              </div>
            )}
          </div>

          <div style={{ height: 16 }} />

          <div style={styles.card}>
            <div style={styles.subHeading}><AlertTriangle size={14} /> Reset Application Data</div>
            <div style={{ color: "var(--text-dim)", fontSize: 12.5, marginBottom: 12 }}>
              Clear all profile, agency, shift, and invoice records from browser storage.
            </div>
            {!confirmReset ? (
              <button type="button" style={styles.dangerButton} onClick={() => setConfirmReset(true)}>
                <AlertTriangle size={15} /> Clear all data
              </button>
            ) : (
              <ConfirmDialog
                inline
                title="Clear everything?"
                body="This deletes your profile, agencies, shifts and invoices. This can't be undone."
                confirmLabel="Clear all data"
                onCancel={() => setConfirmReset(false)}
                onConfirm={() => { onReset(); setConfirmReset(false); }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: 0.3, margin: 0, textTransform: "uppercase", color: "var(--text)" },
  sectionSub: { fontSize: 12.5, color: "var(--text-dim)", marginTop: 3 },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 4 },
  field: { display: "block", marginBottom: 11 },
  fieldLabel: { display: "block", fontSize: 11.5, color: "var(--text-dim)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7,
    padding: "9px 10px", color: "var(--text)", fontSize: 14.5, fontFamily: "var(--font-body)", boxSizing: "border-box",
  },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  subHeading: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  payTypeToggle: { display: "flex", gap: 8, marginBottom: 11 },
  toggleBtn: {
    flex: 1, padding: "8px 0", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)",
    color: "var(--text-dim)", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  toggleBtnActive: { background: "var(--amber)", color: "#1c1400", border: "1px solid var(--amber)" },
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" },
  primaryButton: {
    display: "flex", alignItems: "center", gap: 6, background: "var(--amber)", color: "#1c1400", border: "none",
    borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  },
  secondaryButton: {
    display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8,
    padding: "9px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
  },
  dangerButton: {
    display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid var(--orange)",
    color: "var(--orange)", borderRadius: 8, padding: "9px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
  },
};

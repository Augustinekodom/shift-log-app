import React, { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { toISODate, uid, gbp, num } from "../lib/helpers";

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export default function ShiftForm({ agencies, initial, onSave, onCancel }) {
  const [date, setDate] = useState(initial?.date || toISODate(new Date()));
  const [agencyId, setAgencyId] = useState(initial?.agencyId || agencies[0]?.id || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [payType, setPayType] = useState(initial?.payType || "hourly");
  const [hours, setHours] = useState(initial?.hours ?? "");
  const [rate, setRate] = useState(initial?.rate ?? "");
  const [fixedAmount, setFixedAmount] = useState(initial?.fixedAmount ?? "");
  const [extras, setExtras] = useState(initial?.extras || []);
  const [notes, setNotes] = useState(initial?.notes || "");

  const total =
    (payType === "hourly" ? num(hours) * num(rate) : num(fixedAmount)) +
    extras.reduce((s, e) => s + num(e.amount), 0);

  const addExtra = () => setExtras([...extras, { id: uid("ex"), label: "", amount: "" }]);
  const updateExtra = (id, field, value) =>
    setExtras(extras.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  const removeExtra = (id) => setExtras(extras.filter((e) => e.id !== id));

  const canSave = agencyId && date && (payType === "hourly" ? num(hours) > 0 : num(fixedAmount) > 0);

  const handleSave = () => {
    onSave({
      id: initial?.id || uid("shift"),
      date,
      agencyId,
      location: location.trim(),
      payType,
      hours: payType === "hourly" ? num(hours) : null,
      rate: payType === "hourly" ? num(rate) : null,
      fixedAmount: payType === "fixed" ? num(fixedAmount) : null,
      extras: extras.filter((e) => e.label.trim() || num(e.amount) > 0).map((e) => ({ ...e, amount: num(e.amount) })),
      notes: notes.trim(),
      invoiceId: initial?.invoiceId || null,
    });
  };

  return (
    <div style={styles.card}>
      <div style={styles.formGrid2}>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
        </Field>
        <Field label="Agency">
          <select value={agencyId} onChange={(e) => setAgencyId(e.target.value)} style={styles.input}>
            {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Site / location (optional)">
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. A414 Hatfield / M25 J23" style={styles.input} />
      </Field>

      <div style={styles.payTypeToggle}>
        <button
          type="button"
          onClick={() => setPayType("hourly")}
          style={{ ...styles.toggleBtn, ...(payType === "hourly" ? styles.toggleBtnActive : {}) }}
        >
          Hourly
        </button>
        <button
          type="button"
          onClick={() => setPayType("fixed")}
          style={{ ...styles.toggleBtn, ...(payType === "fixed" ? styles.toggleBtnActive : {}) }}
        >
          Fixed / day rate
        </button>
      </div>

      {payType === "hourly" ? (
        <div style={styles.formGrid2}>
          <Field label="Hours worked">
            <input type="number" inputMode="decimal" min="0" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="10" style={styles.input} />
          </Field>
          <Field label="Rate per hour (£)">
            <input type="number" inputMode="decimal" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="18.50" style={styles.input} />
          </Field>
        </div>
      ) : (
        <Field label="Shift amount (£)">
          <input type="number" inputMode="decimal" min="0" step="0.01" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} placeholder="180" style={styles.input} />
        </Field>
      )}

      <div style={{ marginTop: 4 }}>
        <span style={styles.fieldLabel}>Extras (mileage, nights, PPE…)</span>
        {extras.map((e) => (
          <div key={e.id} style={styles.extraRow}>
            <input
              value={e.label}
              onChange={(ev) => updateExtra(e.id, "label", ev.target.value)}
              placeholder="e.g. Mileage"
              style={{ ...styles.input, flex: 1.4 }}
            />
            <input
              type="number" inputMode="decimal" step="0.01"
              value={e.amount}
              onChange={(ev) => updateExtra(e.id, "amount", ev.target.value)}
              placeholder="£"
              style={{ ...styles.input, flex: 1 }}
            />
            <button type="button" style={styles.iconButtonGhost} onClick={() => removeExtra(e.id)}><X size={15} /></button>
          </div>
        ))}
        <button type="button" style={styles.addExtraBtn} onClick={addExtra}><Plus size={13} /> Add extra</button>
      </div>

      <Field label="Notes (optional)">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...styles.input, resize: "vertical", fontFamily: "var(--font-body)" }} />
      </Field>

      <div style={styles.formFooter}>
        <span style={styles.formTotal}>{gbp(total)}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={styles.secondaryButton} onClick={onCancel}>Cancel</button>
          <button type="button" style={{ ...styles.primaryButton, opacity: canSave ? 1 : 0.5 }} disabled={!canSave} onClick={handleSave}>
            <Check size={15} /> Save shift
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 4 },
  field: { display: "block", marginBottom: 11 },
  fieldLabel: { display: "block", fontSize: 11.5, color: "var(--text-dim)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7,
    padding: "9px 10px", color: "var(--text)", fontSize: 14.5, fontFamily: "var(--font-body)", boxSizing: "border-box",
  },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  payTypeToggle: { display: "flex", gap: 8, marginBottom: 11 },
  toggleBtn: {
    flex: 1, padding: "8px 0", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)",
    color: "var(--text-dim)", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  toggleBtnActive: { background: "var(--amber)", color: "#1c1400", border: "1px solid var(--amber)" },
  extraRow: { display: "flex", gap: 6, marginTop: 6, alignItems: "center" },
  addExtraBtn: {
    display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none",
    color: "var(--amber)", fontSize: 12.5, fontWeight: 600, padding: "7px 0", cursor: "pointer",
  },
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" },
  formTotal: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 18, color: "var(--text)" },
  primaryButton: {
    display: "flex", alignItems: "center", gap: 6, background: "var(--amber)", color: "#1c1400", border: "none",
    borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  },
  secondaryButton: {
    background: "transparent", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8,
    padding: "9px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
  },
  iconButtonGhost: {
    display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7,
    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)", cursor: "pointer",
  },
};

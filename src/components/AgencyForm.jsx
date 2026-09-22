import React, { useState } from "react";
import { Check } from "lucide-react";
import { uid, num } from "../lib/helpers";

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export default function AgencyForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [contactName, setContactName] = useState(initial?.contactName || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [paymentTermsDays, setPaymentTermsDays] = useState(initial?.paymentTermsDays ?? 14);

  const canSave = name.trim().length > 0;

  return (
    <div style={styles.card}>
      <Field label="Agency name">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Roadway Traffic Solutions" style={styles.input} />
      </Field>
      <div style={styles.formGrid2}>
        <Field label="Contact name (optional)">
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} style={styles.input} />
        </Field>
        <Field label="Invoicing email (optional)">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="accounts@..." style={styles.input} />
        </Field>
      </div>
      <Field label="Address (optional)">
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} style={{ ...styles.input, resize: "vertical", fontFamily: "var(--font-body)" }} />
      </Field>
      <Field label="Payment terms (days)">
        <input type="number" min="0" value={paymentTermsDays} onChange={(e) => setPaymentTermsDays(e.target.value)} style={{ ...styles.input, maxWidth: 120 }} />
      </Field>
      <div style={{ ...styles.formFooter, justifyContent: "flex-end" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={styles.secondaryButton} onClick={onCancel}>Cancel</button>
          <button
            type="button"
            style={{ ...styles.primaryButton, opacity: canSave ? 1 : 0.5 }}
            disabled={!canSave}
            onClick={() =>
              onSave({
                id: initial?.id || uid("agency"),
                name: name.trim(),
                contactName: contactName.trim(),
                email: email.trim(),
                address: address.trim(),
                paymentTermsDays: num(paymentTermsDays) || 14
              })
            }
          >
            <Check size={15} /> Save agency
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
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" },
  primaryButton: {
    display: "flex", alignItems: "center", gap: 6, background: "var(--amber)", color: "#1c1400", border: "none",
    borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  },
  secondaryButton: {
    background: "transparent", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8,
    padding: "9px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
  },
};

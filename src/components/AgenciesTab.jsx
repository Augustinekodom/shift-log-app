import React, { useState } from "react";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
import { shiftAmount, gbp } from "../lib/helpers";
import AgencyForm from "./AgencyForm";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={styles.sectionTitle}>{children}</h2>
      {sub && <div style={styles.sectionSub}>{sub}</div>}
    </div>
  );
}

export default function AgenciesTab({ agencies, shifts, saveAgencies }) {
  const [formOpen, setFormOpen] = useState(agencies.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const editingAgency = editingId ? agencies.find((a) => a.id === editingId) : null;

  const upsert = (agency) => {
    if (agencies.some((a) => a.id === agency.id)) {
      saveAgencies(agencies.map((a) => (a.id === agency.id ? agency : a)));
    } else {
      saveAgencies([...agencies, agency]);
    }
    setEditingId(null);
    setFormOpen(false);
  };

  const remove = (id) => {
    saveAgencies(agencies.filter((a) => a.id !== id));
    setConfirmDeleteId(null);
  };

  const stats = (agencyId) => {
    const list = shifts.filter((s) => s.agencyId === agencyId && !s.invoiceId);
    return { count: list.length, value: list.reduce((sum, s) => sum + shiftAmount(s), 0) };
  };

  return (
    <div>
      <div className="desktop-grid-2 desktop-grid-agencies">
        {/* Left Column: Form */}
        <div>
          <SectionTitle sub="Add agencies you take shifts from.">
            {editingAgency ? "Edit agency" : "Add agency"}
          </SectionTitle>

          {formOpen || editingAgency ? (
            <AgencyForm
              key={editingId || "new"}
              initial={editingAgency}
              onCancel={() => { setEditingId(null); setFormOpen(false); }}
              onSave={upsert}
            />
          ) : (
            <button style={styles.dashedButton} onClick={() => setFormOpen(true)}>
              <Plus size={16} /> Add new agency
            </button>
          )}
        </div>

        {/* Right Column: Agencies Cards */}
        <div>
          <SectionTitle sub="Manage registered contractors & contact terms.">
            Agencies directory ({agencies.length})
          </SectionTitle>

          {agencies.length === 0 ? (
            <EmptyState icon={Building2} title="No agencies yet" body="Add the agencies you take traffic management shifts from — you'll pick one each time you log a shift." />
          ) : (
            agencies.map((a) => {
              const s = stats(a.id);
              const shiftCount = shifts.filter((sh) => sh.agencyId === a.id).length;
              return (
                <div key={a.id} style={styles.agencyCard} className="card-hover">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.agencyCardName}>{a.name}</div>
                    <div style={styles.agencyCardMeta}>
                      {a.paymentTermsDays || 14}-day terms
                      {a.contactName ? ` · ${a.contactName}` : ""}
                    </div>
                    {a.email && <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 2 }}>{a.email}</div>}
                    <div style={styles.agencyCardStat}>
                      {s.count > 0 ? `${gbp(s.value)} awaiting invoice (${s.count} shift${s.count > 1 ? "s" : ""})` : "Nothing awaiting invoice"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={styles.iconButtonGhost} onClick={() => { setEditingId(a.id); setFormOpen(true); }}><Pencil size={15} /></button>
                    <button style={styles.iconButtonGhost} onClick={() => setConfirmDeleteId(a.id)}><Trash2 size={15} /></button>
                  </div>
                  {confirmDeleteId === a.id && (
                    <ConfirmDialog
                      title={shiftCount > 0 ? "This agency has logged shifts" : "Delete this agency?"}
                      body={shiftCount > 0 ? `${shiftCount} shift${shiftCount > 1 ? "s are" : " is"} linked to it. Deleting the agency won't delete those shifts, but they'll show as unknown.` : "This can't be undone."}
                      confirmLabel="Delete"
                      onCancel={() => setConfirmDeleteId(null)}
                      onConfirm={() => remove(a.id)}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: 0.3, margin: 0, textTransform: "uppercase", color: "var(--text)" },
  sectionSub: { fontSize: 12.5, color: "var(--text-dim)", marginTop: 3 },
  dashedButton: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: "1.5px dashed var(--border)", borderRadius: 10, padding: "14px 0", background: "transparent",
    color: "var(--amber)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  },
  agencyCard: { display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10, position: "relative" },
  agencyCardName: { fontWeight: 700, fontSize: 15, color: "var(--text)" },
  agencyCardMeta: { fontSize: 12, color: "var(--text-dim)", marginTop: 2 },
  agencyCardStat: { fontSize: 12, color: "var(--amber)", marginTop: 5, fontWeight: 600 },
  iconButtonGhost: {
    display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7,
    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)", cursor: "pointer",
  },
};

import React, { useState, useMemo } from "react";
import { Plus, Building2, Calendar, ChevronLeft, ChevronRight, MapPin, Lock, Pencil, Trash2 } from "lucide-react";
import { getWeekRange, parseISODate, toISODate, shiftWeek, shiftAmount, gbp, formatDateShort } from "../lib/helpers";
import ShiftForm from "./ShiftForm";
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

export default function ShiftsTab({ shifts, agencies, agencyById, saveShifts }) {
  const [formOpen, setFormOpen] = useState(agencies.length > 0 && shifts.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [weekAnchor, setWeekAnchor] = useState(toISODate(new Date()));
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const range = getWeekRange(parseISODate(weekAnchor));
  const weekShifts = shifts
    .filter((s) => s.date >= range.start && s.date <= range.end)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const grouped = useMemo(() => {
    const map = {};
    for (const s of weekShifts) {
      const key = s.agencyId;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [weekShifts]);

  const weekTotal = weekShifts.reduce((sum, s) => sum + shiftAmount(s), 0);

  const editingShift = editingId ? shifts.find((s) => s.id === editingId) : null;

  const upsertShift = (shift) => {
    if (shifts.some((s) => s.id === shift.id)) {
      saveShifts(shifts.map((s) => (s.id === shift.id ? shift : s)));
    } else {
      saveShifts([...shifts, shift]);
    }
    setEditingId(null);
  };

  const deleteShift = (id) => {
    saveShifts(shifts.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  };

  if (agencies.length === 0) {
    return (
      <div>
        <SectionTitle sub="Log a shift as soon as you finish it.">This week</SectionTitle>
        <EmptyState
          icon={Building2}
          title="Add an agency first"
          body="Head to the Agencies tab and add the first agency you work for — then you can start logging shifts against it."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="desktop-grid-2 desktop-grid-shifts">
        {/* Left Column: Form / Quick Log */}
        <div>
          <SectionTitle sub="Log a shift as soon as you finish it.">
            Log shift
          </SectionTitle>

          {formOpen || editingShift ? (
            <ShiftForm
              key={editingId || "new"}
              agencies={agencies}
              initial={editingShift}
              onCancel={() => { setEditingId(null); setFormOpen(false); }}
              onSave={(shift) => { upsertShift(shift); setFormOpen(false); }}
            />
          ) : (
            <button style={styles.dashedButton} onClick={() => setFormOpen(true)}>
              <Plus size={16} /> Log a shift
            </button>
          )}
        </div>

        {/* Right Column: Weekly Overview & Shift List */}
        <div>
          <SectionTitle sub="Shifts logged for selected period.">
            Weekly overview
          </SectionTitle>

          <div style={styles.weekNavCard}>
            <div style={styles.weekNav}>
              <button style={styles.iconButtonGhost} onClick={() => setWeekAnchor(toISODate(shiftWeek(weekAnchor, -1)))}>
                <ChevronLeft size={18} />
              </button>
              <div style={{ textAlign: "center" }}>
                <div style={styles.weekLabel}>{formatDateShort(range.start)} – {formatDateShort(range.end)}</div>
                <div style={styles.weekSub}>{gbp(weekTotal)} logged this week</div>
              </div>
              <button style={styles.iconButtonGhost} onClick={() => setWeekAnchor(toISODate(shiftWeek(weekAnchor, 1)))}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {weekShifts.length === 0 ? (
            <EmptyState icon={Calendar} title="No shifts this week" body="Shifts you log for this Monday–Sunday period will show up here, grouped by agency." />
          ) : (
            Object.entries(grouped).map(([agencyId, list]) => {
              const agency = agencyById[agencyId];
              const subtotal = list.reduce((sum, s) => sum + shiftAmount(s), 0);
              return (
                <div key={agencyId} style={styles.agencyGroup} className="card-hover">
                  <div style={styles.agencyGroupHeader}>
                    <span style={styles.agencyGroupName}>{agency ? agency.name : "Unknown agency"}</span>
                    <span style={styles.agencyGroupTotal}>{gbp(subtotal)}</span>
                  </div>
                  {list.map((s) => (
                    <div key={s.id} style={styles.shiftRow}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.shiftRowTop}>
                          <span style={styles.shiftDate}>{formatDateShort(s.date)}</span>
                          {s.location && (
                            <span style={styles.shiftLocation}>
                              <MapPin size={11} style={{ marginRight: 2 }} />{s.location}
                            </span>
                          )}
                        </div>
                        <div style={styles.shiftMeta}>
                          {s.payType === "hourly" ? `${s.hours}h @ ${gbp(s.rate)}/hr` : `Fixed ${gbp(s.fixedAmount)}`}
                          {(s.extras || []).length > 0 && ` + ${s.extras.length} extra${s.extras.length > 1 ? "s" : ""}`}
                        </div>
                      </div>
                      <div style={styles.shiftAmount}>{gbp(shiftAmount(s))}</div>
                      {s.invoiceId ? (
                        <div title="Included in an invoice" style={styles.lockIcon}><Lock size={15} /></div>
                      ) : (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button style={styles.iconButtonGhost} onClick={() => { setEditingId(s.id); setFormOpen(true); }}>
                            <Pencil size={15} />
                          </button>
                          <button style={styles.iconButtonGhost} onClick={() => setConfirmDeleteId(s.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this shift?"
          body="This can't be undone."
          confirmLabel="Delete"
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => deleteShift(confirmDeleteId)}
        />
      )}
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
  weekNavCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 },
  weekNav: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  weekLabel: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: 0.4, color: "var(--text)" },
  weekSub: { fontSize: 12, color: "var(--text-dim)", marginTop: 1 },
  iconButtonGhost: {
    display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7,
    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)", cursor: "pointer",
  },
  agencyGroup: { marginBottom: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px 4px" },
  agencyGroupHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 8, borderBottom: "1px solid var(--border)" },
  agencyGroupName: { fontWeight: 700, fontSize: 14, color: "var(--text)" },
  agencyGroupTotal: { fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--amber)", fontWeight: 600 },
  shiftRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" },
  shiftRowTop: { display: "flex", alignItems: "center", gap: 8 },
  shiftDate: { fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--text)" },
  shiftLocation: { fontSize: 11.5, color: "var(--text-dim)", display: "flex", alignItems: "center" },
  shiftMeta: { fontSize: 12, color: "var(--text-dim)", marginTop: 2 },
  shiftAmount: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--text)" },
  lockIcon: { color: "var(--text-dim)", display: "flex", padding: "4px" },
};

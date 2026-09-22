import React, { useState, useEffect } from "react";
import { Building2, FileText, ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, Eye } from "lucide-react";
import { getWeekRange, parseISODate, toISODate, shiftWeek, addDays, shiftAmount, gbp, num, cisRate, formatDateShort } from "../lib/helpers";
import EmptyState from "./EmptyState";

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

export default function InvoicesTab({ agencies, shifts, invoices, profile, saveShifts, saveInvoices, saveProfile, onView }) {
  const [agencyId, setAgencyId] = useState(agencies[0]?.id || "");
  const [weekAnchor, setWeekAnchor] = useState(toISODate(new Date()));
  const [customRange, setCustomRange] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [selected, setSelected] = useState({});

  const range = customRange
    ? { start: rangeStart || getWeekRange(new Date()).start, end: rangeEnd || getWeekRange(new Date()).end }
    : getWeekRange(parseISODate(weekAnchor));

  const eligible = shifts.filter(
    (s) => s.agencyId === agencyId && !s.invoiceId && s.date >= range.start && s.date <= range.end
  );

  useEffect(() => {
    const next = {};
    eligible.forEach((s) => { next[s.id] = true; });
    setSelected(next);
  }, [agencyId, range.start, range.end, shifts.length]);

  const chosen = eligible.filter((s) => selected[s.id]);
  const subtotal = chosen.reduce((sum, s) => sum + shiftAmount(s), 0);

  const generate = () => {
    if (chosen.length === 0) return;
    const agency = agencies.find((a) => a.id === agencyId);
    const issueDate = toISODate(new Date());
    const termDays = agency?.paymentTermsDays || profile.defaultPaymentTermsDays || 14;
    const dueDate = addDays(issueDate, termDays);
    const number = `${profile.invoicePrefix || "INV"}-${String(profile.nextInvoiceNumber || 1).padStart(4, "0")}`;

    const lineItems = chosen
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((s) => ({
        date: s.date,
        description: [
          s.payType === "hourly" ? `${s.hours}h @ ${gbp(s.rate)}/hr` : "Fixed shift rate",
          s.location ? `— ${s.location}` : "",
        ].filter(Boolean).join(" "),
        amount: s.payType === "hourly" ? num(s.hours) * num(s.rate) : num(s.fixedAmount),
        extras: (s.extras || []).map((e) => ({ label: e.label || "Extra", amount: num(e.amount) })),
      }));

    const extrasTotal = lineItems.reduce((sum, li) => sum + li.extras.reduce((a, e) => a + e.amount, 0), 0);
    const total = subtotal;
    const rate = cisRate(profile);
    const cisDeduction = total * rate;
    const netPayable = total - cisDeduction;

    const invoice = {
      id: `inv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      number,
      agencyId,
      agencySnapshot: agency ? { name: agency.name, contactName: agency.contactName, email: agency.email, address: agency.address } : { name: "Unknown agency" },
      profileSnapshot: { ...profile },
      issueDate, dueDate,
      periodStart: range.start, periodEnd: range.end,
      lineItems,
      subtotal: total - extrasTotal,
      extrasTotal,
      total,
      cisRate: rate,
      cisDeduction,
      netPayable,
      status: "unpaid",
      createdAt: new Date().toISOString(),
    };

    saveInvoices([invoice, ...invoices]);
    saveShifts(shifts.map((s) => (selected[s.id] ? { ...s, invoiceId: invoice.id } : s)));
    saveProfile({ ...profile, nextInvoiceNumber: (profile.nextInvoiceNumber || 1) + 1 });
    onView(invoice.id);
  };

  const deleteInvoice = (id) => {
    saveShifts(shifts.map((s) => (s.invoiceId === id ? { ...s, invoiceId: null } : s)));
    saveInvoices(invoices.filter((i) => i.id !== id));
  };

  if (agencies.length === 0) {
    return (
      <div>
        <SectionTitle>Invoices</SectionTitle>
        <EmptyState icon={Building2} title="Add an agency first" body="Once you've logged shifts against an agency, you can generate an invoice for the period you worked." />
      </div>
    );
  }

  return (
    <div>
      <div className="desktop-grid-2 desktop-grid-invoices">
        {/* Left Column: Generator */}
        <div>
          <SectionTitle sub="Pull uninvoiced shifts into a new invoice.">
            Generate invoice
          </SectionTitle>

          <div style={styles.card}>
            <Field label="Agency">
              <select value={agencyId} onChange={(e) => setAgencyId(e.target.value)} style={styles.input}>
                {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>

            {!customRange ? (
              <div style={styles.weekNav}>
                <button style={styles.iconButtonGhost} onClick={() => setWeekAnchor(toISODate(shiftWeek(weekAnchor, -1)))}><ChevronLeft size={18} /></button>
                <div style={{ textAlign: "center" }}>
                  <div style={styles.weekLabel}>{formatDateShort(range.start)} – {formatDateShort(range.end)}</div>
                  <button style={styles.linkButton} onClick={() => setCustomRange(true)}>Use custom range</button>
                </div>
                <button style={styles.iconButtonGhost} onClick={() => setWeekAnchor(toISODate(shiftWeek(weekAnchor, 1)))}><ChevronRight size={18} /></button>
              </div>
            ) : (
              <div>
                <div style={styles.formGrid2}>
                  <Field label="From"><input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} style={styles.input} /></Field>
                  <Field label="To"><input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} style={styles.input} /></Field>
                </div>
                <button style={styles.linkButton} onClick={() => setCustomRange(false)}>Back to week view</button>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              {eligible.length === 0 ? (
                <div style={styles.emptyInline}>No un-invoiced shifts for this agency in this period.</div>
              ) : (
                eligible.map((s) => (
                  <label key={s.id} style={styles.checkRow}>
                    <span onClick={() => setSelected({ ...selected, [s.id]: !selected[s.id] })} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      {selected[s.id] ? <CheckCircle2 size={18} color="var(--amber)" /> : <Circle size={18} color="var(--text-dim)" />}
                    </span>
                    <span style={{ flex: 1, marginLeft: 8 }}>
                      <div style={styles.shiftDate}>{formatDateShort(s.date)} {s.location && `· ${s.location}`}</div>
                      <div style={styles.shiftMeta}>{s.payType === "hourly" ? `${s.hours}h @ ${gbp(s.rate)}/hr` : `Fixed ${gbp(s.fixedAmount)}`}</div>
                    </span>
                    <span style={styles.shiftAmount}>{gbp(shiftAmount(s))}</span>
                  </label>
                ))
              )}
            </div>

            {eligible.length > 0 && (
              <div style={styles.formFooter}>
                <span style={styles.formTotal}>{gbp(subtotal)}</span>
                <button style={{ ...styles.primaryButton, opacity: chosen.length ? 1 : 0.5 }} disabled={!chosen.length} onClick={generate}>
                  <FileText size={15} /> Generate invoice
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History */}
        <div>
          <SectionTitle sub="Manage paid/unpaid status & print documents.">
            Past invoices ({invoices.length})
          </SectionTitle>

          {invoices.length === 0 ? (
            <EmptyState icon={FileText} title="No invoices yet" body="Invoices you generate will be listed here, with their paid/unpaid status." />
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} style={styles.invoiceCard} className="card-hover" onClick={() => onView(inv.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.agencyCardName}>{inv.agencySnapshot?.name}</div>
                  <div style={styles.agencyCardMeta}>
                    {inv.number} · {formatDateShort(inv.periodStart)}–{formatDateShort(inv.periodEnd)}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginRight: 8 }}>
                  <div style={styles.shiftAmount}>{gbp(inv.netPayable ?? inv.total)}</div>
                  <div style={styles.invoiceCardSub}>
                    Gross {gbp(inv.total)} · CIS -{gbp(inv.cisDeduction ?? 0)}
                  </div>
                  <span style={{ ...styles.statusBadge, ...(inv.status === "paid" ? styles.statusPaid : styles.statusUnpaid) }}>
                    {inv.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={styles.iconButtonGhost} onClick={(e) => { e.stopPropagation(); onView(inv.id); }} title="View / Print Document">
                    <Eye size={15} />
                  </button>
                  <button
                    style={styles.iconButtonGhost}
                    onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }}
                    title="Delete invoice (shifts return to uninvoiced)"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: 0.3, margin: 0, textTransform: "uppercase", color: "var(--text)" },
  sectionSub: { fontSize: 12.5, color: "var(--text-dim)", marginTop: 3 },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 4 },
  field: { display: "block", marginBottom: 11 },
  fieldLabel: { display: "block", fontSize: 11.5, color: "var(--text-dim)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7,
    padding: "9px 10px", color: "var(--text)", fontSize: 14.5, fontFamily: "var(--font-body)", boxSizing: "border-box",
  },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  weekNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, marginTop: 6 },
  weekLabel: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, letterSpacing: 0.4, color: "var(--text)" },
  iconButtonGhost: {
    display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7,
    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)", cursor: "pointer",
  },
  linkButton: { background: "transparent", border: "none", color: "var(--amber)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", marginTop: 2, padding: 0 },
  emptyInline: { color: "var(--text-dim)", fontSize: 13, padding: "12px 2px", textAlign: "center" },
  checkRow: { display: "flex", alignItems: "center", padding: "10px 2px", borderBottom: "1px solid var(--border)" },
  shiftDate: { fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--text)" },
  shiftMeta: { fontSize: 12, color: "var(--text-dim)", marginTop: 2 },
  shiftAmount: { fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--text)" },
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" },
  formTotal: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 18, color: "var(--text)" },
  primaryButton: {
    display: "flex", alignItems: "center", gap: 6, background: "var(--amber)", color: "#1c1400", border: "none",
    borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  },
  invoiceCard: { display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10, cursor: "pointer" },
  agencyCardName: { fontWeight: 700, fontSize: 14.5, color: "var(--text)" },
  agencyCardMeta: { fontSize: 12, color: "var(--text-dim)", marginTop: 2 },
  invoiceCardSub: { fontSize: 10.5, color: "var(--text-dim)", marginTop: 1, fontFamily: "var(--font-mono)" },
  statusBadge: { display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, marginTop: 3, letterSpacing: 0.4 },
  statusPaid: { background: "rgba(76,175,109,0.15)", color: "var(--green)" },
  statusUnpaid: { background: "rgba(232,89,12,0.15)", color: "var(--orange)" },
};

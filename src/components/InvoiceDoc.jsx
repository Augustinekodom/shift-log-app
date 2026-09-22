import React from "react";
import { Printer } from "lucide-react";
import { formatDateDisplay, formatDateShort, gbp } from "../lib/helpers";

export default function InvoiceDoc({ invoice, onBack, onTogglePaid }) {
  const p = invoice.profileSnapshot || {};
  const a = invoice.agencySnapshot || {};

  return (
    <div>
      <div className="no-print" style={styles.docToolbar}>
        <button style={styles.secondaryButton} onClick={onBack}>← Back</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.secondaryButton} onClick={onTogglePaid}>
            Mark {invoice.status === "paid" ? "unpaid" : "paid"}
          </button>
          <button style={styles.primaryButton} onClick={() => window.print()}>
            <Printer size={15} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="invoice-paper" style={styles.paper}>
        <div style={styles.paperHazardStrip} />
        <div style={styles.paperHeader}>
          <div>
            <div style={styles.paperInvoiceLabel}>INVOICE</div>
            <div style={styles.paperNumber}>{invoice.number}</div>
          </div>
          <span style={{ ...styles.statusBadgePrint, ...(invoice.status === "paid" ? styles.statusPaidPrint : styles.statusUnpaidPrint) }}>
            {invoice.status}
          </span>
        </div>

        <div style={styles.paperMetaGrid}>
          <div>
            <div style={styles.paperMetaLabel}>From</div>
            <div style={styles.paperMetaBody}>
              {p.businessName || p.yourName || "Your name"}<br />
              {p.yourName && p.businessName ? <>{p.yourName}<br /></> : null}
              {p.address && <>{p.address.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</>}
              {p.email && <>{p.email}<br /></>}
              {p.phone && <>{p.phone}<br /></>}
              {p.utr && <>UTR: {p.utr}<br /></>}
              {p.niNumber && <>NI: {p.niNumber}</>}
            </div>
          </div>
          <div>
            <div style={styles.paperMetaLabel}>Bill to</div>
            <div style={styles.paperMetaBody}>
              {a.name}<br />
              {a.contactName && <>{a.contactName}<br /></>}
              {a.address && <>{a.address.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</>}
              {a.email && <>{a.email}</>}
            </div>
          </div>
          <div>
            <div style={styles.paperMetaLabel}>Issue date</div>
            <div style={styles.paperMetaBody}>{formatDateDisplay(invoice.issueDate)}</div>
            <div style={{ height: 8 }} />
            <div style={styles.paperMetaLabel}>Due date</div>
            <div style={styles.paperMetaBody}>{formatDateDisplay(invoice.dueDate)}</div>
            <div style={{ height: 8 }} />
            <div style={styles.paperMetaLabel}>Period</div>
            <div style={styles.paperMetaBody}>{formatDateDisplay(invoice.periodStart)} – {formatDateDisplay(invoice.periodEnd)}</div>
          </div>
        </div>

        <table style={styles.paperTable}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Description</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td style={styles.td}>{formatDateShort(li.date)}</td>
                  <td style={styles.td}>{li.description}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>{gbp(li.amount)}</td>
                </tr>
                {li.extras.map((ex, exi) => (
                  <tr key={`${idx}-${exi}`}>
                    <td style={styles.td}></td>
                    <td style={{ ...styles.td, color: "#666", fontStyle: "italic" }}>{ex.label}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: "#666" }}>{gbp(ex.amount)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div style={styles.paperTotals}>
          <div style={styles.paperTotalRow}><span>Subtotal</span><span>{gbp(invoice.subtotal)}</span></div>
          {invoice.extrasTotal > 0 && (
            <div style={styles.paperTotalRow}><span>Extras</span><span>{gbp(invoice.extrasTotal)}</span></div>
          )}
          <div style={{ ...styles.paperTotalRow, fontWeight: 600, color: "#1a1a1a", borderTop: "1px solid #ddd", marginTop: 4, paddingTop: 6 }}>
            <span>Gross total</span><span>{gbp(invoice.total)}</span>
          </div>
          <div style={{ ...styles.paperTotalRow, color: "#b3480a" }}>
            <span>CIS deduction ({Math.round((invoice.cisRate ?? 0) * 100)}%)</span>
            <span>-{gbp(invoice.cisDeduction ?? 0)}</span>
          </div>
          <div style={{ ...styles.paperTotalRow, ...styles.paperGrandTotal }}><span>Net payable</span><span>{gbp(invoice.netPayable ?? invoice.total)}</span></div>
        </div>

        <div style={styles.paperCisNote}>
          CIS deduction shown is calculated at the {invoice.profileSnapshot?.cisRegistered ? "20% registered subcontractor" : "30% unregistered subcontractor"} rate and withheld by the contractor under the Construction Industry Scheme.
        </div>

        {(p.bankName || p.accountNumber) && (
          <div style={styles.paperPayment}>
            <div style={styles.paperMetaLabel}>Payment details</div>
            <div style={styles.paperMetaBody}>
              {p.accountName && <>Account name: {p.accountName}<br /></>}
              {p.bankName && <>Bank: {p.bankName}<br /></>}
              {p.sortCode && <>Sort code: {p.sortCode}{"  "}</>}
              {p.accountNumber && <>Account no: {p.accountNumber}</>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  docToolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" },
  primaryButton: {
    display: "flex", alignItems: "center", gap: 6, background: "var(--amber)", color: "#1c1400", border: "none",
    borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  },
  secondaryButton: {
    background: "transparent", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8,
    padding: "9px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
  },
  paper: {
    background: "white", color: "#1a1a1a", margin: "0 12px 16px", borderRadius: 6, overflow: "hidden",
    fontFamily: "var(--font-body)", boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
  },
  paperHazardStrip: { height: 7, background: "repeating-linear-gradient(135deg, #F5B700 0 10px, #1a1a1a 10px 20px)" },
  paperHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 22px 6px" },
  paperInvoiceLabel: { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: 2 },
  paperNumber: { fontFamily: "var(--font-mono)", fontSize: 13, color: "#555", marginTop: 2 },
  statusBadgePrint: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, letterSpacing: 0.5, height: "fit-content" },
  statusPaidPrint: { background: "#e4f5ea", color: "#2b8a4c" },
  statusUnpaidPrint: { background: "#fdece0", color: "#b3480a" },
  paperMetaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, padding: "14px 22px 18px", fontSize: 12.5 },
  paperMetaLabel: { fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  paperMetaBody: { fontSize: 12.5, lineHeight: 1.5, color: "#222" },
  paperTable: { width: "100%", borderCollapse: "collapse", padding: "0 22px" },
  th: { textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, color: "#888", borderBottom: "1.5px solid #1a1a1a", padding: "8px 22px" },
  td: { fontSize: 12.5, padding: "9px 22px", borderBottom: "1px solid #eee" },
  paperTotals: { padding: "14px 22px", marginTop: 4 },
  paperTotalRow: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", color: "#444" },
  paperGrandTotal: { fontSize: 16, fontWeight: 700, color: "#1a1a1a", borderTop: "1.5px solid #1a1a1a", marginTop: 6, paddingTop: 8 },
  paperPayment: { padding: "0 22px 22px" },
  paperCisNote: { padding: "0 22px 20px", fontSize: 10.5, color: "#888", lineHeight: 1.5 },
};

import React from "react";

export default function ConfirmDialog({ title, body, confirmLabel, onCancel, onConfirm, inline }) {
  const content = (
    <div style={inline ? styles.confirmInline : styles.confirmCard}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15, color: "var(--text)" }}>{title}</div>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 14, lineHeight: 1.4 }}>{body}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.secondaryButton} onClick={onCancel}>Cancel</button>
        <button style={styles.dangerButtonSolid} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  );
  if (inline) return content;
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}>{content}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  confirmCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 18,
    maxWidth: 340,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  confirmInline: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  secondaryButton: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 8,
    padding: "8px 14px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  dangerButtonSolid: {
    background: "var(--orange)",
    border: "none",
    color: "white",
    borderRadius: 8,
    padding: "8px 14px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
};

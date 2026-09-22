import React from "react";

export default function EmptyState({ icon: Icon, title, body }) {
  return (
    <div style={styles.emptyState}>
      <Icon size={28} color="var(--text-dim)" />
      <div style={{ fontWeight: 700, marginTop: 10, fontFamily: "var(--font-body)", color: "var(--text)" }}>{title}</div>
      <div style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4, maxWidth: 300, lineHeight: 1.4 }}>{body}</div>
    </div>
  );
}

const styles = {
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "36px 14px",
    background: "var(--surface)",
    border: "1px dashed var(--border)",
    borderRadius: 10,
    marginTop: 8,
  },
};

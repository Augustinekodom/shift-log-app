export const pad = (n) => String(n).padStart(2, "0");

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISODate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const formatDateDisplay = (s) =>
  parseISODate(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateShort = (s) =>
  parseISODate(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getWeekRange = (anchor) => {
  const monday = getMonday(anchor);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toISODate(monday), end: toISODate(sunday) };
};

export const shiftWeek = (iso, weeks) => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + weeks * 7);
  return d;
};

export const addDays = (iso, days) => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const gbp = (n) => `£${(Math.round((Number(n) + Number.EPSILON) * 100) / 100).toFixed(2)}`;

export const num = (n) => (isNaN(parseFloat(n)) ? 0 : parseFloat(n));

export const shiftAmount = (shift) => {
  const base = shift.payType === "hourly" ? num(shift.hours) * num(shift.rate) : num(shift.fixedAmount);
  const extras = (shift.extras || []).reduce((sum, e) => sum + num(e.amount), 0);
  return base + extras;
};

export const emptyProfile = {
  businessName: "",
  yourName: "",
  address: "",
  email: "",
  phone: "",
  utr: "",
  niNumber: "",
  cisRegistered: true,
  bankName: "",
  accountName: "",
  sortCode: "",
  accountNumber: "",
  invoicePrefix: "INV",
  nextInvoiceNumber: 1,
  defaultPaymentTermsDays: 14,
};

export const cisRate = (profile) => (profile?.cisRegistered ? 0.20 : 0.30);

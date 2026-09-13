// supabase-config.js — Shared across every page
const SUPABASE_URL = "https://ockkvqmoccaputqzagwo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ja2t2cW1vY2NhcHV0cXphZ3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMTg5NTgsImV4cCI6MjEwNDY5NDk1OH0.jWZ5lVnrJo3LN_VdhcUT6zZ2CccycSW7XYHMWM2qd3Q";

// Supabase v2 UMD is loaded via CDN before this file.
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ---------- Session helpers ----------
async function currentSession() {
  const { data } = await sb.auth.getSession();
  return data?.session || null;
}

async function requireAuth(requiredRole = null) {
  const session = await currentSession();
  if (!session) { window.location.href = "../login.html"; return null; }
  if (requiredRole) {
    const email = session.user.email;
    const { data } = await sb.from("user_roles").select("role").eq("email", email).maybeSingle();
    const role = data?.role || "member";
    if (role !== requiredRole) {
      window.location.href = role === "admin" ? "../admin/index.html" : "../member/dashboard.html";
      return null;
    }
  }
  return session;
}

async function logout() {
  await sb.auth.signOut();
  const prefix = window.location.pathname.includes("/admin/") || window.location.pathname.includes("/member/") ? "../" : "";
  window.location.href = prefix + "login.html";
}

// ---------- Business rules ----------
// Choir can rehearse any day — no restriction
const REGULAR_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SESSION_CONFIG = {
  Evening: {
    label: "Evening",
    startTime: "5:00 PM",
    endTime: "7:00 PM",
    lateCutoff: "4:30 PM",
    absentCutoff: "4:00 PM"
  }
};

function dayName(d) { return new Date(d).toLocaleDateString("en-US", { weekday: "long" }); }
function fmtDate(d) {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

// Any day is a valid session day now
function isRegularDay(_d) { return true; }

async function isSpecialMeeting(date) {
  const { data } = await sb.from("special_meetings").select("meeting_date").eq("meeting_date", date).maybeSingle();
  return !!data;
}

// Always returns true — kept for compatibility with existing pages
async function isValidSessionDay(_date) {
  return true;
}

// ---------- Shared UI ----------
function toast(msg, type = "info") {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", top: "20px", right: "20px", padding: "12px 18px",
    background: type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#2563eb",
    color: "white", borderRadius: "8px", zIndex: 9999, fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,.15)", transition: "opacity .3s"
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
}

// Shared helpers
function initials(name = "") {
  return name.split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
function fmtDate(d) {
  if (!d) return "";
  const date = new Date(typeof d === "string" ? d + "T00:00:00" : d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function dayName(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long" });
}
window.initials = initials;
window.fmtDate = fmtDate;
window.todayISO = todayISO;
window.dayName = dayName;
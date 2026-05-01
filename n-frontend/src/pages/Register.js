import { useState } from "react";
import API from "../api";

const t = {
  en: {
    title: "Register New Member",
    subtitle: "Create your library account",
    fullName: "Full Name",
    username: "Username",
    email: "Email",
    password: "Password",
    address: "Address",
    register: "Register",
    registering: "Registering...",
    haveAccount: "Already have an account?",
    login: "Login here",
    idPlaceholder: "e.g., ahmed123",
    errAllFields: "All fields are required",
    errUsernameExists: "Username already exists",
    errEmailExists: "Email already exists",
    errFailed: "Registration failed. Please try again.",
  },
  am: {
    title: "አዲስ አባል ይመዝገቡ",
    subtitle: "የቤተ መጻሕፍት መለያዎን ይፍጠሩ",
    fullName: "ሙሉ ስም",
    username: "የተጠቃሚ ስም",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    address: "አድራሻ",
    register: "ይመዝገቡ",
    registering: "በመመዝገብ ላይ...",
    haveAccount: "መለያ አለዎት?",
    login: "እዚህ ይግቡ",
    idPlaceholder: "ምሳሌ: ahmed123",
    errAllFields: "ሁሉም መስኮች ያስፈልጋሉ",
    errUsernameExists: "የተጠቃሚ ስም አስቀድሞ ተመዝግቧል",
    errEmailExists: "ኢሜይሉ አስቀድሞ ጥቅም ላይ ውሏል",
    errFailed: "ምዝገባ አልተሳካም። እንደገና ይሞክሩ።",
  },
};

export default function Register({ onSwitch, lang, setLang }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const T = t[lang];

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/auth/register", form, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess(lang === "en" 
        ? "Registration successful! Please wait for admin approval before logging in." 
        : "ምዝገባ ተሳክቷል! ከመግባትዎ በፊት የአድሚን ማጽደቂያ ይጠብቁ።");
      setForm({ fullName: "", username: "", email: "", password: "", address: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("all fields")) {
        setError(T.errAllFields);
      } else if (msg.toLowerCase().includes("username")) {
        setError(T.errUsernameExists);
      } else if (msg.toLowerCase().includes("email")) {
        setError(T.errEmailExists);
      } else {
        setError(msg || T.errFailed);
      }
    }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "14px", outline: "none", background: "rgba(255,255,255,0.8)", transition: "var(--transition)" };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      padding: "20px"
    }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .register-card { animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .input-focus:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px var(--primary-light) !important; }
      `}</style>

      <div className="register-card" style={{ 
        background: "rgba(255, 255, 255, 0.95)", 
        backdropFilter: "blur(20px)",
        padding: "48px 40px", 
        borderRadius: "24px", 
        width: "100%", 
        maxWidth: "480px", 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
      }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="btn-premium btn-secondary-premium"
            style={{ padding: "6px 12px", borderRadius: "10px", fontSize: "12px" }}
          >
            🌐 {lang === "en" ? "አማርኛ" : "English"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px", letterSpacing: "-0.025em" }}>📚 {T.title}</h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>{T.subtitle}</p>
        </div>

        {error && <div className="alert alert-error" style={{ borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>{success}</div>}

        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>{T.fullName}</label>
            <input
              name="fullName"
              className="input-focus"
              value={form.fullName}
              onChange={handle}
              required
              placeholder={lang === "en" ? "John Doe" : "ሙሉ ስም"}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>{T.username}</label>
              <input
                name="username"
                className="input-focus"
                value={form.username}
                onChange={handle}
                required
                placeholder={T.idPlaceholder}
                style={inputStyle}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>{T.email}</label>
              <input
                name="email"
                type="email"
                className="input-focus"
                value={form.email}
                onChange={handle}
                required
                placeholder="email@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>{T.password}</label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                className="input-focus"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={handle}
                required
                minLength={3}
                placeholder="••••••••"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", opacity: 0.5 }}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>{T.address}</label>
            <input
              name="address"
              className="input-focus"
              value={form.address}
              onChange={handle}
              required
              placeholder={lang === "en" ? "City, Country" : "ከተማ፣ አገር"}
              style={inputStyle}
            />
          </div>

          <button 
            className="btn-premium btn-primary-premium" 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", height: "52px", fontSize: "16px", borderRadius: "14px" }}
          >
            {loading ? T.registering : T.register}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
          {T.haveAccount}{" "}
          <button
            onClick={onSwitch}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "14px", padding: 0 }}
          >
            {T.login}
          </button>
        </div>
      </div>
    </div>
  );
}

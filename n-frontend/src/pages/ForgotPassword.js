import { useState } from "react";
import API from "../api";

const t = {
  en: {
    title: "Forgot Password",
    desc: "Enter your registered email to receive a reset link.",
    email: "Email Address",
    submit: "Send Reset Link",
    sending: "Sending...",
    success: "Reset link sent! Please check your email.",
    back: "Back to Login",
  },
  am: {
    title: "የይለፍ ቃል ረስተዋል?",
    desc: "የይለፍ ቃል መቀየሪያ ሊንክ ለመቀበል የተመዘገቡበትን ኢሜይል ያስገቡ።",
    email: "ኢሜይል አድራሻ",
    submit: "ሊንኩን ላክ",
    sending: "በመላክ ላይ...",
    success: "ሊንኩ ተልኳል! እባክዎ ኢሜይልዎን ያረጋግጡ።",
    back: "ወደ መግቢያ ተመለስ",
  }
};

export default function ForgotPassword({ onSwitch, lang }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const T = t[lang];

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await API.post("/auth/forgot-password", { email });
      setMessage(T.success);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending link");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="card-premium max-w-md w-full !p-12 animate-in fade-in zoom-in-95 duration-500 bg-white">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{T.title}</h1>
        <p className="text-slate-500 mb-8 font-medium">{T.desc}</p>

        {message && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold mb-6 text-sm">✅ {message}</div>}
        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold mb-6 text-sm">❌ {error}</div>}

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{T.email}</label>
            <input 
              type="email" 
              required 
              className="input-premium" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="email@example.com"
            />
          </div>
          <button disabled={loading} className="w-full btn-premium btn-primary-premium h-14">
            {loading ? T.sending : T.submit}
          </button>
        </form>

        <button onClick={onSwitch} className="w-full mt-8 text-sm font-bold text-slate-400 hover:text-primary transition-colors">
          ← {T.back}
        </button>
      </div>
    </div>
  );
}

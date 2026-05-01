import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const t = {
  en: {
    title: "Reset Password",
    desc: "Enter your new password below.",
    password: "New Password",
    submit: "Update Password",
    success: "Success! Redirecting to login...",
    error: "Invalid or expired link.",
  },
  am: {
    title: "የይለፍ ቃል ቀይር",
    desc: "አዲሱን የይለፍ ቃልዎን ያስገቡ።",
    password: "አዲስ የይለፍ ቃል",
    submit: "ቀይር",
    success: "ተሳክቷል! ወደ መግቢያ ገጽ እየተመለሱ ነው...",
    error: "ሊንኩ አይሰራም ወይም ጊዜው አልፎበታል።",
  }
};

export default function ResetPassword({ lang }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const T = t[lang];

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(T.success);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || T.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="card-premium max-w-md w-full !p-12 bg-white">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{T.title}</h1>
        <p className="text-slate-500 mb-8 font-medium">{T.desc}</p>

        {message && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold mb-6 text-sm">✅ {message}</div>}
        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold mb-6 text-sm">❌ {error}</div>}

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{T.password}</label>
            <input 
              type="password" 
              required 
              minLength={3}
              className="input-premium" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          <button disabled={loading} className="w-full btn-premium btn-primary-premium h-14">
            {T.submit}
          </button>
        </form>
      </div>
    </div>
  );
}

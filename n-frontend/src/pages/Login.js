import { useState } from "react";
import API from "../api";

const t = {
  en: { title:"Library System", subtitle:"Sign in to continue", username:"Username", password:"Password", role:"Role", admin:"Admin", manager:"Librarian", member:"Member", signin:"Sign In", signing:"Signing in...", noAccount:"Don't have an account?", register:"Register here", forgot: "Forgot Password?" },
  am: { title:"የቤተ መጻሕፍት ሥርዓት", subtitle:"ለመቀጠል ይግቡ", username:"የተጠቃሚ ስም", password:"የይለፍ ቃል", role:"ሚና", admin:"አድሚን", manager:"Librarian", member:"አባል", signin:"ግባ", signing:"በመግባት ላይ...", noAccount:"መለያ የለዎትም?", register:"እዚህ ይመዝገቡ", forgot: "የይለፍ ቃል ረስተዋል?" },
};

export default function Login({ onLogin, onSwitch, lang, setLang }) {
  const [form,    setForm]    = useState({ username: "", password: "", role: "admin" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const T = t[lang];

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check backend is running.");
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen w-full flex bg-slate-900 overflow-hidden">
      {/* Left Side: Library Image & Description */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="/library_bg.png" 
            alt="Library Background" 
            className="w-full h-full object-cover opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
        </div>
        
        <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center text-3xl shadow-2xl shadow-primary/30 transform -rotate-6 hover:rotate-0 transition-transform duration-500 mb-4">
            📚
          </div>
          <div className="text-xl font-bold tracking-widest uppercase text-white/80">Shelf Management</div>
        </div>
        
        <div className="relative z-10 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <h2 className="text-5xl font-outfit font-black mb-6 leading-tight tracking-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">Library Experience</span>
          </h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed border-l-4 border-primary pl-6">
            Organize, track, and manage your library's assets with unprecedented precision. Experience our premium system designed for seamless discovery and administration.
          </p>
        </div>
      </div>

      {/* Right Side: Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 xl:px-32 relative z-10 bg-slate-50">
        <div className="absolute inset-0 z-0">
          {/* Animated Background Mesh */}
          <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="w-full max-w-[420px] mx-auto relative z-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          {/* Language Switcher */}
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setLang(lang === "en" ? "am" : "en")} 
              className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300 text-xs font-bold shadow-sm"
            >
              🌐 {lang === "en" ? "አማርኛ" : "English"}
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-blue-50/60 backdrop-blur-2xl border border-blue-100 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-outfit font-black text-slate-900 tracking-tight mb-2">
                {T.title}
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                {T.subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center animate-in zoom-in-95 duration-300">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{T.username}</label>
                <input 
                  name="username" 
                  value={form.username} 
                  onChange={handle} 
                  required 
                  className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium shadow-sm"
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{T.password}</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPw ? "text" : "password"}
                    value={form.password} 
                    onChange={handle}
                    required 
                    className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium shadow-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{T.role}</label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handle}
                  className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium cursor-pointer appearance-none shadow-sm"
                >
                  <option value="admin">{T.admin}</option>
                  <option value="librarian">{T.manager}</option>
                  <option value="student">{T.member}</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    {T.signing}
                  </span>
                ) : T.signin}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 space-y-4 text-center">
              <p className="text-slate-500 text-sm font-medium">
                {T.noAccount}{" "}
                <button onClick={onSwitch} className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all">
                  {T.register}
                </button>
              </p>
              <button 
                onClick={() => window.location.href = "/forgot-password"}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
              >
                {T.forgot}
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <button 
                onClick={() => window.location.href = "/books"}
                className="w-full py-4 rounded-2xl bg-white border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-500 text-sm font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 animate-bounce hover:animate-none"
              >
                {lang === "en" ? "Browse as Guest" : "እንደ እንግዳ ፈልግ"} <span className="text-xl group-hover:translate-x-1 transition-transform">👉</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

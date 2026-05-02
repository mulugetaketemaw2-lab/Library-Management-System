import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import AdminDashboard from "./pages/AdminDashboard";
import Borrow from "./pages/Borrow";
import Reports from "./pages/Reports";
import MyReservations from "./pages/MyReservations";
import LoanHistory from "./pages/LoanHistory";
import BookDetail from "./pages/BookDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

const sidebarT = {
  en: {
    dashboard: "Dashboard",
    mgmt: "Management",
    books: "Books",
    members: "Members",
    borrow: "Borrow / Return",
    admin: "Admin",
    reports: "Reports",
    rules: "Admin & Rules",
    services: "Member Services",
    reservations: "My Reservations",
    loan: "Loan History",
    logout: "Logout",
    welcome: "Welcome,",
    system: "Library Pro"
  },
  am: {
    dashboard: "ዳሽቦርድ",
    mgmt: "አስተዳደር",
    books: "መጻሕፍት",
    members: "አባላት",
    borrow: "ውሰት / መልስ",
    admin: "አድሚን",
    reports: "ሪፖርቶች",
    rules: "አድሚን እና ደንቦች",
    services: "የአባል አገልግሎቶች",
    reservations: "የእኔ መያዣዎች",
    loan: "የውሰት ታሪክ",
    logout: "ውጣ",
    welcome: "እንኳን ደህና መጡ፣",
    system: "ላይብረሪ ፕሮ"
  }
};

const Layout = ({ children, lang, setLang }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const profileRef = useRef(null);
  const T = sidebarT[lang];
  
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const navigate = useNavigate();

  // Allow ONLY the books list for guests
  const isPublicRoute = window.location.pathname === "/books";
  
  if (!user && !isPublicRoute) return <Navigate to="/login" />;

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isAdmin = user.role === "admin";
  const isLibrarian = user.role === "librarian";

  const linkClass = ({ isActive }) => 
    `flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
      isActive 
        ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25 translate-x-1" 
        : "text-slate-400 hover:bg-white/5 hover:text-slate-100 hover:translate-x-1"
    }`;

  return (
    <div className="flex min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 font-inter selection:bg-primary/10 selection:text-primary">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 m-4 rounded-[2rem] bg-slate-900 dark:bg-slate-900 shadow-2xl transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-[125%]"}`}>
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-xl shadow-primary/20 border border-white/10">📚</div>
            <div>
              <h2 className="text-lg font-outfit font-black text-white tracking-tight leading-none">{T.system}</h2>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto" onClick={() => setOpen(false)}>
            <NavLink to="/" end className={linkClass}>🏠 {T.dashboard}</NavLink>
            
            <NavLink to="/books" className={linkClass}>📖 {T.books}</NavLink>

            {(isAdmin || isLibrarian) && (
              <>
                <NavLink to="/members" className={linkClass}>👥 {T.members}</NavLink>
                <NavLink to="/borrow" className={linkClass}>🔄 {T.borrow}</NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink to="/reports" className={linkClass}>📊 {T.reports}</NavLink>
                <NavLink to="/admin" className={linkClass}>⚙️ {T.rules}</NavLink>
              </>
            )}

            {(!isAdmin && !isLibrarian) && (
              <>
                <NavLink to="/my-reservations" className={linkClass}>⏳ {T.reservations}</NavLink>
                <NavLink to="/loan-history" className={linkClass}>📜 {T.loan}</NavLink>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <button 
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" 
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          
          <div className="flex-1 hidden md:flex items-center gap-3 pl-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <h4 className="text-[11px] font-black text-primary/80 uppercase tracking-[0.2em] bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm shadow-primary/5">{T.welcome}</h4>
            <h1 className="text-xl font-outfit font-extrabold bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight">{user?.name || "Guest"}</h1>
          </div>
          <div className="flex-1 md:hidden" />
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>

            <button 
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-lg hover:bg-slate-200 transition-colors shadow-sm border border-slate-200"
            >
              🌐
            </button>
            
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <div className="hidden sm:block text-right px-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{user?.name || "Guest"}</p>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">{user?.role || "Explorer"}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-xl shadow-inner border border-white dark:border-slate-700">
                  👤
                </div>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.welcome}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || "Guest"}</p>
                    <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider mt-0.5">{user?.role || "Guest"}</p>
                  </div>
                  <div className="px-4">
                    <button 
                      onClick={logout}
                      className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-[2rem] bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-extrabold text-sm tracking-tight transition-all duration-300 hover:bg-rose-600 hover:text-white shadow-sm hover:shadow-xl hover:shadow-rose-600/20 group border border-rose-100/50 dark:border-rose-900/20"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform duration-500">🚪</span> 
                      {T.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

function App() {
  const [lang, setLang] = useState("en");

  const wrap = (el) => <Layout lang={lang} setLang={setLang}>{React.cloneElement(el, { lang, setLang })}</Layout>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login lang={lang} setLang={setLang} onLogin={() => window.location.href = "/"} onSwitch={() => window.location.href = "/register"} />} />
        <Route path="/register" element={<Register lang={lang} setLang={setLang} onSwitch={() => window.location.href = "/login"} />} />
        
        <Route path="/forgot-password" element={<ForgotPassword lang={lang} onSwitch={() => window.location.href = "/login"} />} />
        <Route path="/reset-password/:token" element={<ResetPassword lang={lang} />} />

        {/* Public Route for Guests and Members */}
        <Route path="/books" element={wrap(<Books />)} />
        <Route path="/books/:id" element={wrap(<BookDetail />)} />
        
        <Route path="/" element={wrap(<Dashboard />)} />
        <Route path="/members" element={wrap(<Members />)} />
        <Route path="/borrow" element={wrap(<Borrow />)} />
        <Route path="/reports" element={wrap(<Reports />)} />
        <Route path="/admin" element={wrap(<AdminDashboard />)} />
        <Route path="/my-reservations" element={wrap(<MyReservations />)} />
        <Route path="/loan-history" element={wrap(<LoanHistory />)} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

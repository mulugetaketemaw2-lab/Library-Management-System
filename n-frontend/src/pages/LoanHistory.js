import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { formatDateEC } from "../utils/dateFormatter";

const t = {
  en: {
    title: "Loan History",
    subtitle: "A detailed timeline of your borrowed library assets.",
    book: "Book Title",
    dueDate: "Due Date",
    daysLeft: "Days Remaining",
    fine: "Fine Accrued",
    status: "Status",
    noBooks: "No loan records found",
    filterAll: "Full Timeline",
    filterCurrent: "Currently Borrowed",
    filterHistory: "Past Records",
    overdue: "overdue",
    daysRemaining: "days left",
    totalLoans: "Total Loans",
    activeLoans: "Active Now",
    totalFines: "Total Fines"
  },
  am: {
    title: "የውሰት ታሪኬ (Loan History)",
    subtitle: "የወሰዷቸውን መጻሕፍት ዝርዝር እዚህ ያገኛሉ።",
    book: "የመጽሐፍ ርዕስ",
    dueDate: "መመለሻ ቀን",
    daysLeft: "የቀሩት ቀናት",
    fine: "ቅጣት",
    status: "ሁኔታ",
    noBooks: "ምንም የውሰት መረጃ አልተገኘም",
    filterAll: "ሁሉም ታሪክ",
    filterCurrent: "በውሰት ላይ ያሉ",
    filterHistory: "የቀድሞ ታሪክ",
    overdue: "ቀን ያለፈበት",
    daysRemaining: "ቀናት ቀርተዋል",
    totalLoans: "ጠቅላላ ውሰቶች",
    activeLoans: "አሁን ያሉ",
    totalFines: "ጠቅላላ ቅጣት"
  }
};

export default function LoanHistory({ lang }) {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const T = t[lang];

  const loadData = () => {
    setLoading(true);
    API.get("/borrow/my")
      .then((r) => {
        setMyBooks(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDaysLeft = (dueDate) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(dueDate); due.setHours(0,0,0,0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredHistory = myBooks.filter(b => filter === "all" || b.status === filter);
  const activeCount = myBooks.filter(b => b.status === 'issued').length;
  const totalFines = myBooks.reduce((acc, b) => acc + (b.fine || 0), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-10 pb-20 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="w-14 h-14 flex items-center justify-center rounded-[1.2rem] bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 group-hover:-translate-x-1.5 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-5xl font-outfit font-black text-slate-900 tracking-tight leading-tight mb-2">{T.title}</h1>
            <p className="text-lg font-medium text-slate-500">{T.subtitle}</p>
          </div>
        </div>

        <div className="flex bg-slate-100/80 p-1.5 rounded-[1.2rem] backdrop-blur-sm border border-slate-200/50">
          {['all', 'issued', 'returned'].map((f) => (
            <button 
              key={f}
              className={`px-6 py-3 rounded-[0.9rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                filter === f ? 'bg-white text-primary shadow-xl shadow-black/5 scale-[1.02]' : 'text-slate-500 hover:text-primary'
              }`} 
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? T.filterAll : f === 'issued' ? T.filterCurrent : T.filterHistory}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-primary bg-white shadow-xl shadow-slate-200/50">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">📚</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{T.totalLoans}</p>
              <p className="text-3xl font-black text-slate-900">{myBooks.length}</p>
           </div>
        </div>
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-amber-500 bg-white shadow-xl shadow-slate-200/50">
           <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">⏳</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{T.activeLoans}</p>
              <p className="text-3xl font-black text-slate-900">{activeCount}</p>
           </div>
        </div>
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-rose-500 bg-white shadow-xl shadow-slate-200/50">
           <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-3xl">💰</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{T.totalFines}</p>
              <p className="text-3xl font-black text-slate-900">{totalFines} ETB</p>
           </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="table-wrap !p-0 overflow-hidden bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] border-none rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-7 text-xs font-extrabold text-slate-800 uppercase tracking-[0.25em]">{T.book}</th>
                <th className="px-10 py-7 text-xs font-extrabold text-slate-800 uppercase tracking-[0.25em]">{T.dueDate}</th>
                <th className="px-10 py-7 text-xs font-extrabold text-slate-800 uppercase tracking-[0.25em]">{T.daysLeft}</th>
                <th className="px-10 py-7 text-xs font-extrabold text-slate-800 uppercase tracking-[0.25em]">{T.fine}</th>
                <th className="px-10 py-7 text-xs font-extrabold text-slate-800 uppercase tracking-[0.25em] text-right">{T.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.map((r, i) => {
                const daysLeft = r.status === 'issued' ? getDaysLeft(r.due_date) : null;
                return (
                  <tr key={r.id || i} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-black/5 transition-all duration-500">📖</div>
                        <div className="flex flex-col gap-1">
                          <div className="font-outfit font-black text-slate-900 group-hover:text-primary transition-colors text-lg tracking-tight">
                            {r.title}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Record ID: {(r.id || r._id)?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 font-mono font-black text-slate-900 text-base">
                      {formatDateEC(r.due_date, lang)}
                    </td>
                    <td className="px-10 py-8">
                      {r.status === 'issued' ? (
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                          daysLeft < 0 ? 'bg-rose-50 text-rose-600 border border-rose-100/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${daysLeft < 0 ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`}></span>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} ${T.overdue}` : `${daysLeft} ${T.daysRemaining}`}
                        </span>
                      ) : <span className="text-slate-300 font-black tracking-widest opacity-30">COMPLETED</span>}
                    </td>
                    <td className="px-10 py-8">
                      <div className={`font-mono font-black text-lg ${r.fine > 0 ? "text-rose-600" : "text-slate-900"}`}>
                        {r.fine || 0} <span className="text-[10px] uppercase ml-0.5">ETB</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <span className={`inline-flex items-center px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                        r.status === 'issued' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {loading && (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="w-12 h-12 border-[5px] border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Archives...</p>
                  </td>
                </tr>
              )}

              {!loading && filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-10 py-48 text-center">
                    <div className="text-8xl mb-8 grayscale opacity-20">📂</div>
                    <p className="text-slate-400 font-outfit font-black text-2xl tracking-tight">{T.noBooks}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

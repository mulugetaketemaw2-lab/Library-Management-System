import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { formatDateEC } from "../utils/dateFormatter";

const t = {
  en: {
    title: "My Reservations",
    subtitle: "Track and manage the books you've placed on hold.",
    book: "Book Title",
    date: "Reserved On",
    action: "Manage",
    cancel: "Cancel Hold",
    confirmCancel: "Do you want to release this reservation?",
    noData: "You haven't reserved any books yet.",
    newReserve: "Reserve New Book",
    back: "Back",
    total: "Total Holds",
    active: "Active",
    pending: "Pending Pickup"
  },
  am: {
    title: "የያዝኳቸው መጻሕፍት",
    subtitle: "ያስያዟቸውን መጻሕፍት እዚህ ይከታተሉና ያስተዳድሩ።",
    book: "የመጽሐፍ ርዕስ",
    date: "የተያዘበት ቀን",
    action: "ተግባር",
    cancel: "አስወግድ",
    confirmCancel: "ይህን ማስያዣ መሰረዝ ትፈልጋለህ?",
    noData: "ምንም የተያዘ መጽሐፍ የለም።",
    newReserve: "አዲስ መጽሐፍ አስይዝ",
    back: "ተመለስ",
    total: "ጠቅላላ መያዣዎች",
    active: "ንቁ",
    pending: "ለመውሰድ የሚጠብቁ"
  }
};

export default function MyReservations({ lang }) {
  const [myReserves, setMyReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const T = t[lang];

  const loadData = () => {
    setLoading(true);
    API.get("/reservation/my")
      .then((r) => {
        setMyReserves(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const cancelReservation = async (id) => {
    if (!window.confirm(T.confirmCancel)) return;
    try {
      await API.delete(`/reservation/${id}`);
      loadData();
    } catch (err) {
      alert("Error cancelling reservation");
    }
  };

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
        
        <button 
          onClick={() => navigate('/books')}
          className="btn-premium btn-primary-premium !h-16 !px-10 shadow-2xl shadow-primary/30 text-lg hover:scale-105 active:scale-95 transition-all duration-300"
        >
          ➕ {T.newReserve}
        </button>
      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-primary bg-white">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">⏳</div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{T.total}</p>
              <p className="text-3xl font-black text-slate-900">{myReserves.length}</p>
           </div>
        </div>
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-emerald-500 bg-white">
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl">🎯</div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{T.active}</p>
              <p className="text-3xl font-black text-slate-900">{myReserves.length}</p>
           </div>
        </div>
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-amber-500 bg-white">
           <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">📦</div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{T.pending}</p>
              <p className="text-3xl font-black text-slate-900">0</p>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="table-wrap !p-0 overflow-hidden bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] border-none rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{T.book}</th>
                <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{T.date}</th>
                <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">{T.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myReserves.map((r) => (
                <tr key={r._id} className="group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-black/5 transition-all duration-500">📖</div>
                      <div className="flex flex-col gap-1">
                        <div className="font-outfit font-black text-slate-900 group-hover:text-primary transition-colors text-lg tracking-tight">
                          {r.book_id?.title || 'Unknown Asset'}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reserved Asset ID: {r._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <div className="font-mono font-black text-slate-900 text-base">
                        {formatDateEC(r.reserve_date, lang)}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Hold Status: Active
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => cancelReservation(r._id)} 
                      className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-rose-600 bg-rose-50/50 border border-rose-100/50 hover:bg-rose-600 hover:text-white hover:shadow-xl hover:shadow-rose-600/30 transition-all duration-500"
                    >
                      🗑️ {T.cancel}
                    </button>
                  </td>
                </tr>
              ))}
              
              {loading && (
                <tr>
                  <td colSpan="3" className="px-10 py-32 text-center">
                    <div className="w-12 h-12 border-[5px] border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing with Library Grid...</p>
                  </td>
                </tr>
              )}

              {!loading && myReserves.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-10 py-48 text-center">
                    <div className="text-8xl mb-8 grayscale opacity-20 animate-bounce duration-[3000ms]">📫</div>
                    <p className="text-slate-400 font-outfit font-black text-2xl tracking-tight">{T.noData}</p>
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

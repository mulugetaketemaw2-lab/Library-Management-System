import { useEffect, useState } from "react";
import API from "../api";
import { formatDateEC } from "../utils/dateFormatter";

const t = {
  en: {
    title: "Library Reports",
    overview: "Overview",
    overdue: "Overdue Books",
    transactions: "Transactions",
    totalBooks: "Total Books",
    totalMembers: "Total Members",
    issued: "Issued Books",
    returned: "Returned Books",
    totalFines: "Total Fines (ETB)",
    book: "Book",
    student: "Student",
    username: "Username",
    dueDate: "Due Date",
    daysOverdue: "Days Overdue",
    estFine: "Est. Fine",
    issueDate: "Issue Date",
    returnDate: "Return Date",
    fine: "Fine",
    status: "Status",
    searchPlaceholder: "Filter by student or book...",
    noData: "No records found",
  },
  am: {
    title: "የቤተ-መጻሕፍት ሪፖርቶች",
    overview: "አጠቃላይ እይታ",
    overdue: "ቀጠሮ ያለፈባቸው",
    transactions: "ግብይቶች",
    totalBooks: "ጠቅላላ መጻሕፍት",
    totalMembers: "ጠቅላላ አባላት",
    issued: "የተወሰዱ",
    returned: "የተመለሱ",
    totalFines: "ጠቅላላ ቅጣት (ብር)",
    book: "መጽሐፍ",
    student: "ተማሪ",
    username: "የተጠቃሚ ስም",
    dueDate: "መመለሻ ቀን",
    daysOverdue: "ያለፈባቸው ቀናት",
    estFine: "ቅጣት",
    issueDate: "የተወሰደበት ቀን",
    returnDate: "የተመለሰበት ቀን",
    fine: "ቅጣት",
    status: "ሁኔታ",
    searchPlaceholder: "በተማሪ ወይም በመጽሐፍ ስም ፈልግ...",
    noData: "ምንም መረጃ አልተገኘም",
  }
};

export default function Reports({ lang, setLang }) {
  const [summary, setSummary]   = useState(null);
  const [overdue, setOverdue]   = useState([]);
  const [logs, setLogs]         = useState([]);
  const [search, setSearch]     = useState("");
  const [currentTab, setCurrentTab] = useState("overdue"); // Start with overdue since summary is at top
  const T = t[lang];

  useEffect(() => {
    API.get("/reports/summary").then(r => setSummary(r.data)).catch(() => {});
    API.get("/reports/overdue").then(r => setOverdue(r.data)).catch(() => {});
    API.get("/borrow").then(r => setLogs(r.data)).catch(() => {});
  }, []);

  const filteredLogs = logs.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.student_name.toLowerCase().includes(search.toLowerCase())
  );

  const StatPill = ({ label, count, icon, colorClass }) => (
    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md ${colorClass}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl font-extrabold text-slate-900 leading-none">{count}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h1 className="text-4xl font-outfit font-extrabold text-slate-900 tracking-tight leading-tight">{T.title}</h1>
      </div>

      {/* Summary Stats Row */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 overflow-x-auto pb-4">
          <StatPill label={T.totalBooks} count={summary.total_books} icon="📚" colorClass="border-blue-100" />
          <StatPill label={T.totalMembers} count={summary.total_members} icon="👥" colorClass="border-emerald-100" />
          <StatPill label={T.issued} count={summary.issued_books} icon="🔄" colorClass="border-amber-100" />
          <StatPill label={T.returned} count={summary.returned_books} icon="↩️" colorClass="border-purple-100" />
          <StatPill label={T.totalFines} count={Number(summary.total_fines).toLocaleString()} icon="💰" colorClass="border-rose-100" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8">
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            currentTab === "overdue" 
              ? "bg-white text-primary shadow-lg shadow-black/5" 
              : "text-slate-500 hover:text-slate-700"
          }`} 
          onClick={() => setCurrentTab("overdue")}
        >
          🚩 {T.overdue} 
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
            currentTab === 'overdue' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
          }`}>
            {overdue.length}
          </span>
        </button>
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            currentTab === "transactions" 
              ? "bg-white text-primary shadow-lg shadow-black/5" 
              : "text-slate-500 hover:text-slate-700"
          }`} 
          onClick={() => setCurrentTab("transactions")}
        >
          🧾 {T.transactions}
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {currentTab === "overdue" && (
          <div className="table-wrap overflow-hidden !p-0">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-100">
              <h3 className="text-rose-700 font-extrabold flex items-center gap-2 text-base">
                <span>🚩</span> {T.overdue}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-12">#</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.book}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.student}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.dueDate}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.daysOverdue}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">{T.estFine}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {overdue.map((r, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-400">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{r.title}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">{r.isbn}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{r.student_name}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{formatDateEC(r.due_date, lang)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 uppercase tracking-wider">
                          {r.days_overdue} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-base font-extrabold text-rose-600">{r.estimated_fine} ETB</div>
                      </td>
                    </tr>
                  ))}
                  {overdue.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        {T.noData}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === "transactions" && (
          <>
            <div className="relative w-full max-w-md group mb-6">
              <input 
                placeholder={T.searchPlaceholder} 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="input-premium pl-12 h-12 shadow-sm"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-50 group-focus-within:scale-110 transition-transform">🔍</span>
            </div>

            <div className="table-wrap">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-12">#</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.book}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.student}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.issueDate}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.dueDate}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.returnDate}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.fine}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">{T.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredLogs.map((l, i) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{l.title}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{l.student_name}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{formatDateEC(l.issue_date, lang)}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{formatDateEC(l.due_date, lang)}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{l.return_date ? formatDateEC(l.return_date, lang) : "-"}</td>
                        <td className="px-6 py-4 font-extrabold text-slate-900">{l.fine} ETB</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            l.status === 'issued' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                          {T.noData}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

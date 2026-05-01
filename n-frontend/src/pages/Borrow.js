import { useEffect, useState } from "react";
import API from "../api";
import ECDatePicker from "../components/ECDatePicker";
import { formatDateEC } from "../utils/dateFormatter";

const t = {
  en: {
    title: "Borrow / Return Books",
    issueTitle: "Issue a Book",
    bookLabel: "Book",
    studentLabel: "Student",
    dueDateLabel: "Due Date",
    issueBtn: "Issue Book",
    filterLabel: "Filter by due date",
    clearFilter: "Clear Filter",
    confirmReturn: "Mark this book as returned?",
    returnedMsg: "Returned. Total Fine:",
    noRecords: "No records found",
    selectBook: "-- Select Book --",
    selectStudent: "-- Select Student --",
    username: "Username",
    status: "Status",
    action: "Action",
    returnBtn: "Return",
    issueDate: "Issue Date",
    returnDate: "Return Date",
    fine: "Fine",
    price: "Price",
    isbn: "ISBN",
    memberUser: "Member Username",
    damageFinePrompt: "Enter damage fine (if any):",
    quickIssue: "Quick Issue (ID/ISBN)",
    selectIssue: "Select from List",
  },
  am: {
    title: "መጻሕፍት ማበደር እና መመለስ",
    issueTitle: "መጽሐፍ አበድር",
    bookLabel: "መጽሐፍ",
    studentLabel: "ተማሪ",
    dueDateLabel: "መመለሻ ቀን",
    issueBtn: "መጽሐፍ አበድር",
    filterLabel: "በመመለሻ ቀን ፈልግ",
    clearFilter: "ፍለጋውን አጽዳ",
    confirmReturn: "ይህ መጽሐፍ ተመልሷል?",
    returnedMsg: "ተመልሷል። ጠቅላላ ቅጣት:",
    noRecords: "ምንም መረጃ አልተገኘም",
    selectBook: "-- መጽሐፍ ምረጥ --",
    selectStudent: "-- ተማሪ ምረጥ --",
    username: "የተጠቃሚ ስም",
    status: "ሁኔታ",
    action: "ድርጊት",
    returnBtn: "መልስ",
    issueDate: "የተወሰደበት ቀን",
    returnDate: "የተመለሰበት ቀን",
    fine: "ቅጣት",
    price: "ዋጋ",
    isbn: "ISBN ቁጥር",
    memberUser: "የአባል ተጠቃሚ ስም",
    damageFinePrompt: "የጉዳት ቅጣት ካለ ያስገቡ፡",
    quickIssue: "ፈጣን ብድር (በመለያ ቁጥር)",
    selectIssue: "ከዝርዝሩ ውስጥ ምረጥ",
  }
};

export default function Borrow({ lang, setLang }) {
  const [records, setRecords] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("borrow"); // 'borrow' or 'reservations'
  const [books,   setBooks]   = useState([]);
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState({ maxBorrowDays: 7 });
  const [form, setForm]       = useState({ book_id: "", student_id: "", isbn: "", username: "", due_date: "" });
  const [msg, setMsg]         = useState({ text: "", type: "" });
  const [filterDate, setFilterDate] = useState("");
  const [mode, setMode]       = useState("quick"); // 'quick' or 'select'
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const T = t[lang];

  const load = () => {
    API.get("/borrow").then(r => setRecords(r.data)).catch(() => {});
    if (user.role === "librarian" || user.role === "admin") {
      API.get("/reservation").then(r => setReservations(r.data)).catch(() => {});
    }
  };

  useEffect(() => {
    load();
    API.get("/books").then(r => setBooks(r.data)).catch(() => {});
    if (user.role === "librarian" || user.role === "admin") {
      API.get("/admin/users").then(r => setMembers(r.data.filter(u => u.role === "student"))).catch(() => {});
    }
    API.get("/admin/settings").then(r => {
      setSettings(r.data);
      const today = new Date();
      today.setDate(today.getDate() + r.data.maxBorrowDays);
      setForm(prev => ({ ...prev, due_date: today.toISOString().split("T")[0] }));
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const issue = async e => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    try {
      const payload = { ...form };
      if (mode === 'quick') {
        payload.book_id = ""; payload.student_id = "";
      } else {
        payload.isbn = ""; payload.username = "";
      }

      await API.post("/borrow/issue", payload);
      setMsg({ text: lang === "en" ? "Book issued successfully" : "መጽሐፍ በተሳካ ሁኔታ ተበድሯል", type: "success" });
      
      const today = new Date();
      today.setDate(today.getDate() + settings.maxBorrowDays);
      setForm({ book_id: "", student_id: "", isbn: "", username: "", due_date: today.toISOString().split("T")[0] });
      load();
    } catch (err) { 
      setMsg({ text: err.response?.data?.message || "Error", type: "error" }); 
    }
  };

  const returnBook = async id => {
    const damageFine = window.prompt(T.damageFinePrompt, "0");
    if (damageFine === null) return;
    if (!window.confirm(T.confirmReturn)) return;

    try {
      const res = await API.put(`/borrow/return/${id}`, { damage_fine: damageFine });
      setMsg({ text: `${T.returnedMsg} ${res.data.fine} ETB`, type: "success" });
      load();
    } catch (err) { 
      setMsg({ text: err.response?.data?.message || "Error", type: "error" }); 
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm(lang === 'en' ? 'Cancel this reservation?' : 'ይህን ማስያዣ መሰረዝ ይፈልጋሉ?')) return;
    try {
      await API.delete(`/reservation/${id}`);
      setMsg({ text: lang === 'en' ? 'Reservation canceled' : 'ማስያዣው ተሰርዟል', type: 'success' });
      load();
    } catch (err) {
      setMsg({ text: "Error", type: "error" });
    }
  };

  const filtered = filterDate
    ? records.filter(r => r.due_date?.split("T")[0] === filterDate)
    : records;

  const canManage = user.role === "librarian" || user.role === "admin";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h1 className="text-4xl font-outfit font-extrabold text-slate-900 tracking-tight leading-tight">{T.title}</h1>
        {canManage && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
            <button 
              onClick={() => setActiveTab('borrow')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'borrow' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {lang === 'en' ? 'Borrow & Return' : 'ማበደር / መቀበል'}
            </button>
            <button 
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'reservations' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {lang === 'en' ? 'Reservations' : 'የተያዙ መጻሕፍት'}
              {reservations.length > 0 && <span className="ml-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{reservations.length}</span>}
            </button>
          </div>
        )}
      </div>

      {canManage && (
        <div className="card-premium mb-10 !p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">➕</span> {T.issueTitle}
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button 
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${mode==='quick' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                onClick={()=>setMode('quick')}
               >
                 {T.quickIssue}
               </button>
               <button 
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${mode==='select' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                onClick={()=>setMode('select')}
               >
                 {T.selectIssue}
               </button>
            </div>
          </div>

          {msg.text && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold animate-in zoom-in-95 duration-300 ${
              msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}>
              <span>{msg.type === 'success' ? '✅' : '❌'}</span>
              {msg.text}
            </div>
          )}
          
          <form onSubmit={issue} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mode === 'quick' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.isbn}</label>
                    <input name="isbn" value={form.isbn} onChange={handle} required placeholder="978-..." className="input-premium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.memberUser}</label>
                    <input name="username" value={form.username} onChange={handle} required placeholder="username" className="input-premium" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.bookLabel}</label>
                    <select name="book_id" value={form.book_id} onChange={handle} required className="input-premium">
                      <option value="">{T.selectBook}</option>
                      {books.filter(b => b.available_copies > 0).map(b => (
                        <option key={b.id} value={b.id}>{b.title} ({b.isbn})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.studentLabel}</label>
                    <select name="student_id" value={form.student_id} onChange={handle} required className="input-premium">
                      <option value="">{T.selectStudent}</option>
                      {members.filter(m => m.approved).map(m => <option key={m.id} value={m.id}>{m.name} ({m.username})</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.dueDateLabel}</label>
                <ECDatePicker 
                  value={form.due_date} 
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })} 
                  lang={lang} 
                />
              </div>
            </div>
            <button className="btn-premium btn-primary-premium w-full md:w-auto px-10 h-14 shadow-lg shadow-primary/20" type="submit">
              {T.issueBtn}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'borrow' ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>📋</span> {T.title}
            </h3>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex-1 w-full max-w-[200px]">
                <ECDatePicker 
                  value={filterDate || new Date().toISOString().split("T")[0]} 
                  onChange={(e) => setFilterDate(e.target.value)} 
                  lang={lang} 
                />
              </div>
              {filterDate && (
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" 
                  onClick={() => setFilterDate("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="table-wrap">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-12">#</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.bookLabel}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.studentLabel}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.issueDate}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.dueDateLabel}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.fine}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.status}</th>
                    {canManage && <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-400">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary">{r.title}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">{r.isbn}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{r.student_name}</div>
                        <div className="text-[11px] font-bold text-slate-400 tracking-tight">{r.username}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{formatDateEC(r.issue_date, lang)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{formatDateEC(r.due_date, lang)}</td>
                      <td className="px-6 py-4">
                         <div className={`font-extrabold ${r.fine > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {r.fine} ETB
                         </div>
                         {r.damage_fine > 0 && <div className="text-[10px] font-bold text-rose-400 uppercase mt-1">Damage: {r.damage_fine}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'issued' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          {r.status === "issued" && (
                            <button 
                              onClick={() => returnBook(r.id)}
                              className="btn-premium btn-secondary-premium !py-1.5 !px-3 !text-xs !rounded-xl text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                            >
                              ↩️ {T.returnBtn}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={canManage ? 8 : 7} className="px-6 py-20 text-center text-slate-400 font-bold">
                        <div className="text-4xl mb-4">📂</div>
                        {T.noRecords}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="table-wrap">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{lang==='en'?'Pending Reservations':'የተያዙ መጻሕፍት (ተራ መጠበቂያ)'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{T.bookLabel}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{T.studentLabel}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Reserved</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reservations.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-extrabold text-slate-900">{r.book_id?.title}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{r.book_id?.isbn}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-primary">{r.student_id?.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">{r.student_id?.username}</div>
                    </td>
                    <td className="px-8 py-6 font-mono text-sm font-bold text-slate-500">
                      {formatDateEC(r.reserve_date, lang)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setForm({ ...form, book_id: r.book_id?._id, student_id: r.student_id?._id, isbn: r.book_id?.isbn, username: r.student_id?.username });
                            setActiveTab('borrow');
                            setMode('quick');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="btn-premium btn-primary-premium !py-1.5 !px-4 !text-xs !rounded-xl"
                        >
                          {lang === 'en' ? 'Issue' : 'አበድር'}
                        </button>
                        <button 
                          onClick={() => cancelReservation(r._id)}
                          className="btn-premium !py-1.5 !px-4 !text-xs !rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100"
                        >
                          {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="text-4xl mb-4 grayscale opacity-20">⏳</div>
                      <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">{T.noRecords}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

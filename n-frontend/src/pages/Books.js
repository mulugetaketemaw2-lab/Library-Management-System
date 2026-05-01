import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const t = {
  en: {
    title: "Shelf Management",
    subtitle: "Organize and track library assets with precision.",
    all: "All Assets",
    available: "Available",
    borrowed: "On Loan",
    title_col: "Book Title",
    author: "Author",
    category: "Genre / Category",
    isbn: "ISBN Number",
    status: "Current Status",
    addBook: "Register Asset",
    editBook: "Edit Details",
    delete: "Remove Assets",
    save: "Save to Inventory",
    cancel: "Cancel Action",
    confirmDelete: "Remove selected books from inventory?",
    noBooks: "No assets found in this category",
    search: "Search by title, author, or ISBN...",
    allGenres: "All Genres",
    loginToReserve: "Login to Reserve",
    reserveBtn: "Hold Book",
    reservedMsg: "Asset successfully reserved!",
    close: "Dismiss",
    totalCopies: "Stock Level",
    shelf: "Location (Shelf/Row)",
    description: "Brief Description",
    imageUrl: "Cover URL",
    proTip: "Use ISBN search for 100% accuracy in stock identification.",
    details: "Details",
    lost: "Mark as Lost/Damaged",
    actions: "Inventory Actions",
    updateSuccess: "Asset updated successfully",
    lostSuccess: "Asset marked as lost",
    restore: "Restore Asset",
    restoreSuccess: "Asset restored to inventory"
  },
  am: {
    title: "የመደርደሪያ አስተዳደር",
    subtitle: "የቤተ-መጻሕፍት ንብረቶችን በስርዓት ያስተዳድሩ።",
    all: "ሁሉም ንብረቶች",
    available: "ያሉ",
    borrowed: "ውሰት ላይ",
    title_col: "የመጽሐፍ ርዕስ",
    author: "ደራሲ",
    category: "ዘርፍ / ዘውግ",
    isbn: "ISBN ቁጥር",
    status: "ሁኔታ",
    addBook: "ንብረት መዝግብ",
    editBook: "መረጃ አርም",
    delete: "ንብረቶችን ሰርዝ",
    save: "መዝገብ ላይ አስቀምጥ",
    cancel: "ተመለስ",
    confirmDelete: "የተመረጡትን መጻሕፍት መሰረዝ ትፈልጋለህ?",
    noBooks: "በዚህ ዘርፍ ምንም መጻሕፍት አልተገኙም",
    search: "በርዕስ፣ በደራሲ፣ ወይም በISBN ፈልግ...",
    allGenres: "ሁሉም ዘርፎች",
    loginToReserve: "ለማስያዝ ይግቡ",
    reserveBtn: "አስይዝ",
    reservedMsg: "መጽሐፉ በተሳካ ሁኔታ ተይዟል!",
    close: "ዝጋ",
    totalCopies: "ጠቅላላ ክምችት",
    shelf: "አቀማመጥ (መደርደሪያ)",
    description: "አጭር መግለጫ",
    imageUrl: "የፎቶ ሊንክ",
    proTip: "ለበለጠ ጥራት የISBN ቁጥርን በመጠቀም ይፈልጉ።",
    details: "ዝርዝር",
    lost: "እንደ ጠፋ/ተበላሸ ምልክት አድርግ",
    actions: "የመጋዘን ተግባራት",
    updateSuccess: "የንብረት መረጃው ታርሟል",
    lostSuccess: "ንብረቱ እንደ ጠፋ ተመዝግቧል",
    restore: "ንብረቱን መልስ",
    restoreSuccess: "ንብረቱ ወደ መጋዘን ተመልሷል"
  }
};

const genresList = ["Fiction", "Science", "History", "Educational", "Business", "Biography", "Children", "Religion", "Technology", "Other"];

export default function Books({ lang, setLang }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", author: "", category: "Fiction", isbn: "", total_copies: 1, shelf: "", description: "", image_url: "", pdf: null });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const menuRef = useRef(null);
  
  const T = t[lang];
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isGuest = !user;
  const isLibrarian = user?.role === "librarian" || user?.role === "admin";
  const isStudent = user?.role === "student";

  const load = () => API.get("/books").then(r => setBooks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const toggleSelect = (id) => {
    if (!isLibrarian) {
      navigate(`/books/${id}`);
      return;
    }
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = (list) => {
    const ids = list.map(b => b.id);
    const allIn = ids.every(id => selected.includes(id));
    if (allIn) setSelected(prev => prev.filter(id => !ids.includes(id)));
    else setSelected(prev => [...new Set([...prev, ...ids])]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await API.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setAddForm({ ...addForm, image_url: res.data.url });
      flash(lang === "en" ? "Image uploaded" : "ፎቶው ተጭኗል");
    } catch { flash("Upload failed", "error"); }
    setUploading(false);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setAddForm({ ...addForm, pdf: file });
      flash(lang === "en" ? "PDF selected" : "ፒዲኤፍ ተመርጧል");
    } else {
      flash(lang === "en" ? "Only PDF allowed" : "ፒዲኤፍ ብቻ ነው የሚፈቀደው", "error");
    }
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(addForm).forEach(key => {
      if (key === 'pdf') {
        if (addForm.pdf) formData.append('pdf', addForm.pdf);
      } else {
        formData.append(key, addForm[key] || "");
      }
    });

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isEdit) {
        await API.put(`/books/${addForm.id}`, formData, config);
        flash(lang === "en" ? "Book updated" : "መጽሐፉ ተስተካክሏል");
      } else {
        await API.post("/books", formData, config);
        flash(lang === "en" ? "Book added" : "መጽሐፉ ተጨምሯል");
      }
      setShowAdd(false);
      setIsEdit(false);
      setSelected([]);
      load();
    } catch (err) { flash(err.response?.data?.message || "Error", "error"); }
  };

  const openEdit = () => {
    if (selected.length !== 1) return;
    const b = books.find(x => x.id === selected[0]);
    setAddForm({ ...b });
    setIsEdit(true);
    setShowAdd(true);
    setShowMenu(false);
  };

  const handleLost = async (isLost) => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map(id => API.put(`/books/${id}`, { condition: isLost ? "Lost/Damaged" : "Good" })));
      flash(isLost ? T.lostSuccess : T.restoreSuccess);
      setSelected([]);
      setShowMenu(false);
      load();
    } catch { flash("Error", "error"); }
  };

  const handleDelete = async () => {
    if (!window.confirm(T.confirmDelete)) return;
    try {
      await Promise.all(selected.map(id => API.delete(`/books/${id}`)));
      flash(lang === "en" ? "Assets removed" : "ንብረቶች ተሰርዘዋል");
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const reserveBook = async (id) => {
    try {
      await API.post("/reservation", { book_id: id });
      flash(T.reservedMsg, "success");
    } catch (err) {
      flash(err.response?.data?.message || "Error", "error");
    }
  };

  const filtered = books.filter(b => {
    const title = b.title || "";
    const author = b.author || "";
    const isbn = b.isbn || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                      author.toLowerCase().includes(search.toLowerCase()) || 
                      isbn.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === "All" || b.category === selectedGenre;
    return matchSearch && matchGenre;
  });

  const availableGenres = ["All", ...new Set(books.map(b => b.category))].filter(g => g);

  return (
    <div className="animate-in fade-in duration-1000 space-y-6 pb-20 relative">
      {/* Header Section - Shifted Up */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="w-14 h-14 flex items-center justify-center rounded-[1.2rem] bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group shadow-sm shrink-0"
            title="Back to Dashboard"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-7 w-7 transform transition-transform group-hover:-translate-x-1.5 duration-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div>
            <h1 className="text-5xl font-outfit font-extrabold text-slate-900 tracking-tight leading-tight mb-2">{T.title}</h1>
            <p className="text-lg font-medium text-slate-500">{T.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {isLibrarian && (
            <div className="flex items-center gap-4">
              <button onClick={() => { setIsEdit(false); setShowAdd(true); setAddForm({ title: "", author: "", category: "Fiction", isbn: "", total_copies: 1, shelf: "", description: "", image_url: "", pdf: null }); }} className="btn-premium btn-primary-premium !h-14 !px-8 shadow-xl shadow-primary/30">
                ➕ {T.addBook}
              </button>

            </div>
          )}
        </div>
      </div>

      {/* Inventory Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-premium !p-6 flex items-center gap-5 border-l-4 border-l-blue-500">
           <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">📚</div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.all}</p>
              <p className="text-2xl font-extrabold text-slate-900">{books.length}</p>
           </div>
        </div>
        <div className="card-premium !p-6 flex items-center gap-5 border-l-4 border-l-emerald-500">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">✅</div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.available}</p>
              <p className="text-2xl font-extrabold text-slate-900">{books.filter(b => b.status === 'available').length}</p>
           </div>
        </div>
        <div className="card-premium !p-6 flex items-center gap-5 border-l-4 border-l-amber-500">
           <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">🔄</div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.borrowed}</p>
              <p className="text-2xl font-extrabold text-slate-900">{books.filter(b => b.status === 'borrowed').length}</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar: Genres */}
        <aside className="w-full lg:w-80 shrink-0 space-y-8">
          <div className="card-premium !p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">{lang==='en'?'Explore Genres':'ዘውጎችን ያስሱ'}</h3>
            <nav className="space-y-1">
              {availableGenres.map(g => (
                <button 
                  key={g} 
                  onClick={() => setSelectedGenre(g)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                    selectedGenre === g 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${selectedGenre === g ? "bg-white scale-150" : "bg-slate-300 group-hover:bg-primary"}`}></span>
                    {g === "All" ? T.allGenres : g}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-extrabold ${selectedGenre === g ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {g === "All" ? books.length : books.filter(b => b.category === g).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="card-premium !p-8 bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">Pro Tip</h4>
            <p className="text-sm font-medium leading-relaxed text-slate-300 relative z-10">{T.proTip}</p>
          </div>
        </aside>

        {/* Main List Area */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Search Box & Actions - Now Combined */}
          <div className="flex items-center gap-6 mb-4">
            <div className="relative group flex-1 max-w-md">
              <input 
                placeholder={T.search} 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="input-premium pl-14 h-14 text-lg shadow-sm border-slate-100 focus:shadow-xl focus:shadow-primary/5 transition-all duration-500"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl transition-transform duration-300 group-focus-within:scale-110 opacity-30">🔍</span>
            </div>
            
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">
              {filtered.length} {lang==='en'?'Records Found':'መረጃዎች ተገኝተዋል'}
            </div>

            <div className="flex-1" />

            {selected.length > 0 && (
              <div className="relative animate-in zoom-in-95 duration-300" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl hover:scale-110 transition-all duration-300"
                >
                  <span className="text-2xl leading-none transform translate-y-[3px]">⋮</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-16 z-[110] w-72 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 py-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-2 mb-2 border-b border-slate-50">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{selected.length} {lang==='en'?'Assets Selected':'ንብረቶች ተመርጠዋል'}</p>
                    </div>
                    
                    {selected.length === 1 && (
                      <button onClick={openEdit} className="w-full text-left px-5 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-3">
                        <span>✏️</span> {T.editBook}
                      </button>
                    )}

                    <button onClick={() => { handleLost(true); }} className="w-full text-left px-5 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-3">
                      <span>🚫</span> {T.lost}
                    </button>

                    <button onClick={() => { handleLost(false); }} className="w-full text-left px-5 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                      <span>🔓</span> {T.restore}
                    </button>

                    <div className="my-2 border-t border-slate-50"></div>

                    <button onClick={() => { handleDelete(); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3">
                      <span>🗑️</span> {T.delete}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {msg.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold animate-in zoom-in-95 duration-300 ${
              msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}>
              <span>{msg.type === 'success' ? '✅' : '❌'}</span>
              {msg.text}
            </div>
          )}

          {/* Records Table */}
          <div className="table-wrap overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    {isLibrarian && <th className="px-8 py-6 w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" checked={filtered.length > 0 && filtered.every(b => selected.includes(b.id))} onChange={() => toggleAll(filtered)} /></th>}
                    <th className="px-8 py-6 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.title_col}</th>
                    <th className="px-8 py-6 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.author}</th>
                    <th className="px-8 py-6 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.category}</th>
                    <th className="px-8 py-6 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.totalCopies}</th>
                    <th className="px-8 py-6 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.status}</th>
                    <th className="px-8 py-6 text-xs font-extrabold text-slate-800 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((b) => (
                    <tr 
                      key={b.id} 
                      className={`group transition-all duration-200 cursor-pointer hover:bg-slate-50/50 ${selected.includes(b.id) ? "bg-primary/5" : ""}`} 
                      onClick={() => toggleSelect(b.id)}
                    >
                      {isLibrarian && <td className="px-8 py-6"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" checked={selected.includes(b.id)} readOnly /></td>}
                      <td className="px-8 py-6">
                        <div className="font-extrabold text-slate-900 group-hover:text-primary transition-colors text-base truncate max-w-[200px]">{b.title}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1.5 tracking-wider uppercase truncate max-w-[150px]">{b.isbn}</div>
                      </td>
                      <td className="px-8 py-6 font-bold text-slate-600 truncate max-w-[150px]">{b.author}</td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-slate-100 text-slate-500 uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {b.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${b.available_copies === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${(b.available_copies / b.total_copies) * 100}%` }}
                              ></div>
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{b.available_copies} / {b.total_copies}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                          b.available_copies > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${b.available_copies > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {b.available_copies > 0 ? T.available : (lang === 'en' ? 'Out of Stock' : 'አልቋል')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3">
                           {isStudent && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); reserveBook(b.id); }} 
                               className="btn-premium btn-primary-premium !py-2.5 !px-6 !text-[10px] !rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                             >
                               ⏳ {T.reserveBtn}
                             </button>
                           )}
                           {isGuest && (
                             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                               {T.loginToReserve}
                             </span>
                           )}
                           <button 
                             onClick={(e) => { e.stopPropagation(); navigate(`/books/${b.id}`); }} 
                             className="btn-premium btn-secondary-premium !py-2.5 !px-6 !text-[10px] !rounded-2xl hover:bg-slate-200 transition-colors"
                           >
                             ✨ {T.details}
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={isLibrarian ? 6 : 5} className="px-8 py-28 text-center">
                        <div className="text-6xl mb-8 grayscale opacity-10">📚</div>
                        <p className="text-slate-400 font-extrabold text-xl tracking-tight">{T.noBooks}</p>
                        <p className="text-slate-300 font-bold uppercase tracking-widest text-xs mt-2">Try adjusting your filters or search terms</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{isEdit ? T.editBook : T.addBook}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{isEdit ? 'Update existing record' : 'Populate library inventory'}</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 shadow-sm">✕</button>
            </div>
            <form onSubmit={submitAdd} className="p-8 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.title_col}</label>
                       <input value={addForm.title} onChange={e => setAddForm({...addForm, title: e.target.value})} required className="input-premium" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.author}</label>
                       <input value={addForm.author} onChange={e => setAddForm({...addForm, author: e.target.value})} required className="input-premium" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.isbn}</label>
                          <input value={addForm.isbn} onChange={e => setAddForm({...addForm, isbn: e.target.value})} required className="input-premium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.category}</label>
                          <select value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} className="input-premium">
                             {genresList.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.totalCopies}</label>
                          <input type="number" value={addForm.total_copies} onChange={e => setAddForm({...addForm, total_copies: e.target.value})} className="input-premium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.shelf}</label>
                          <input value={addForm.shelf} onChange={e => setAddForm({...addForm, shelf: e.target.value})} className="input-premium" />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.imageUrl}</label>
                       <div className="flex gap-3">
                         <input value={addForm.image_url} onChange={e => setAddForm({...addForm, image_url: e.target.value})} className="input-premium flex-1" placeholder="https://..." />
                         <label className={`w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 ${uploading ? 'bg-slate-100 animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                           <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                           <span className="text-xl">{uploading ? '⏳' : '📤'}</span>
                         </label>
                       </div>
                       <p className="text-[9px] font-bold text-slate-400 mt-1 ml-1">{lang === 'en' ? 'Or upload from device' : 'ወይም ከኮምፒውተርዎ ይጫኑ'}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{lang === 'en' ? 'Digital Copy (PDF)' : 'ዲጂታል ቅጂ (PDF)'}</label>
                        <div className="flex gap-3">
                          <div className="input-premium flex-1 flex items-center text-slate-400 truncate text-[10px] overflow-hidden">
                            {addForm.pdf ? addForm.pdf.name : (addForm.pdf_url ? 'Existing PDF' : (lang === 'en' ? 'No PDF selected' : 'ምንም PDF አልተመረጠም'))}
                          </div>
                          <label className={`w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100`}>
                            <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfChange} />
                            <span className="text-xl">📄</span>
                          </label>
                        </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.description}</label>
                       <textarea value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} className="input-premium h-24 py-4 resize-none"></textarea>
                    </div>
                    <div className="flex gap-4 pt-4">
                       <button type="submit" className="flex-1 btn-premium btn-primary-premium h-16 shadow-xl shadow-primary/20 text-lg">{T.save}</button>
                       <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-premium btn-secondary-premium h-16 text-lg">{T.cancel}</button>
                    </div>
                 </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

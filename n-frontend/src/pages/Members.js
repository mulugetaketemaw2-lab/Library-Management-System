import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const t = {
  en: {
    title: "Member Management",
    pending: "Identity Verification",
    approved: "Verified Members",
    name: "Name",
    username: "Username",
    email: "Email",
    address: "Address",
    actions: "Actions",
    noMembers: "No members found",
    approve: "Verify & Approve",
    delete: "Remove Member",
    addMember: "Register New Member",
    confirmApprove: "Verify and approve selected members?",
    confirmDelete: "Remove selected members?",
    resetPassword: "Reset Password",
    newPassword: "New Password",
    passwordResetSuccess: "Password reset successful for selected members",
    confirmReset: "Reset password for selected members?",
    fullName: "Full Name",
    password: "Password",
    add: "Register",
    cancel: "Cancel",
    status: "Status",
    block: "Suspend Account",
    unblock: "Restore Access",
    edit: "Modify Profile",
    blocked: "Suspended",
    active: "Active",
    actionsMenu: "Member Actions",
    saveChanges: "Save Changes",
    updateSuccess: "Profile updated successfully",
    blockSuccess: "Account suspended",
    unblockSuccess: "Access restored",
    totalMembers: "Total Members",
    pendingApproval: "Pending Approval"
  },
  am: {
    title: "የአባላት አስተዳደር",
    subtitle: "የአባላትን ማንነት ያረጋግጡና ማህበረሰቡን ያስተዳድሩ።",
    pending: "የማረጋገጫ ጥያቄዎች",
    approved: "የተረጋገጡ አባላት",
    name: "ሙሉ ስም",
    username: "የተጠቃሚ ስም",
    email: "ኢሜይል አድራሻ",
    address: "አድራሻ",
    actions: "ድርጊቶች",
    noMembers: "ምንም አባላት አልተገኙም",
    approve: "አረጋግጥ እና አጽድቅ",
    delete: "አባል ሰርዝ",
    addMember: "አዲስ አባል መዝግብ",
    confirmApprove: "የተመረጡትን አባላት ማንነት አረጋግጠህ ማጽደቅ ትፈልጋለህ?",
    confirmDelete: "የተመረጡትን አባላት መሰረዝ ትፈልጋለህ?",
    resetPassword: "ፓስዎርድ ቀይር",
    newPassword: "አዲስ ፓስዎርድ",
    passwordResetSuccess: "ለተመረጡት አባላት ፓስዎርድ በተሳካ ሁኔታ ተቀይሯል",
    confirmReset: "ለተመረጡት አባላት ፓስዎርድ መቀየር ትፈልጋለህ?",
    fullName: "የአባሉ ሙሉ ስም",
    password: "ፓስዎርድ",
    add: "መዝግብ",
    cancel: "ተመለስ",
    status: "ሁኔታ",
    block: "አካውንት አግድ",
    unblock: "ከእገዳ አንሳ",
    edit: "መረጃ አርም",
    blocked: "የታገደ",
    active: "የተረጋገጠ",
    actionsMenu: "የአባል ተግባራት",
    saveChanges: "ማሻሻያውን አስቀምጥ",
    updateSuccess: "መረጃው በተሳካ ሁኔታ ታርሟል",
    blockSuccess: "አካውንቱ ታግዷል",
    unblockSuccess: "እገዳው ተነስቷል",
    totalMembers: "ጠቅላላ አባላት",
    pendingApproval: "ጥያቄ ላይ ያሉ"
  }
};

export default function Members({ lang, setLang }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState("approved");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", username: "", password: "", email: "", address: "" });
  const [showReset, setShowReset] = useState(false);
  const [resetPass, setResetPass] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", username: "", email: "", address: "" });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const T = t[lang];

  const load = () => API.get("/admin/users").then(r => {
    setMembers(r.data.filter(u => u.role === "student"));
  }).catch(() => {});

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

  const changeTab = (tab) => {
    setCurrentTab(tab);
    setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = (list) => {
    const ids = list.map(m => m.id);
    const allIn = ids.every(id => selected.includes(id));
    if (allIn) setSelected(prev => prev.filter(id => !ids.includes(id)));
    else setSelected(prev => [...new Set([...prev, ...ids])]);
  };

  const handleApprove = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(T.confirmApprove)) return;
    try {
      await Promise.all(selected.map(id => API.put(`/admin/approve/${id}`)));
      flash(lang === "en" ? "Identity verified and members approved" : "ማንነታቸው ተረጋግጦ አባላቱ ጸድቀዋል");
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(T.confirmDelete)) return;
    try {
      await Promise.all(selected.map(id => API.delete(`/admin/users/${id}`)));
      flash(lang === "en" ? "Members removed" : "አባላቱ ተወግደዋል");
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (selected.length === 0 || !resetPass) return;
    try {
      await Promise.all(selected.map(id => API.put(`/admin/reset-password/${id}`, { password: resetPass })));
      flash(T.passwordResetSuccess);
      setSelected([]);
      setShowReset(false);
      setResetPass("");
    } catch { flash("Error", "error"); }
  };

  const handleBlock = async () => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map(id => API.put(`/admin/block/${id}`)));
      flash(T.blockSuccess);
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const handleUnblock = async () => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map(id => API.put(`/admin/unblock/${id}`)));
      flash(T.unblockSuccess);
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const openEdit = () => {
    if (selected.length !== 1) return;
    const m = members.find(u => u.id === selected[0]);
    setEditForm({ id: m.id, name: m.name, username: m.username, email: m.email || "", address: m.address || "" });
    setShowEdit(true);
    setShowMenu(false);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/users/${editForm.id}`, editForm);
      flash(T.updateSuccess);
      setShowEdit(false);
      setSelected([]);
      load();
    } catch (err) { flash(err.response?.data?.message || "Error", "error"); }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/member", addForm);
      flash(lang === "en" ? "New member registered successfully" : "አዲስ አባል በተሳካ ሁኔታ ተመዝግቧል");
      setShowAdd(false);
      load();
    } catch (err) { flash(err.response?.data?.message || "Error", "error"); }
  };

  const pendingList = members.filter(m => !m.approved);
  const approvedList = members.filter(m => m.approved);
  const activeList = currentTab === "pending" ? pendingList : approvedList;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            <p className="text-lg font-medium text-slate-500">{T.subtitle || 'Manage your community'}</p>
          </div>
        </div>
        
        <button 
          onClick={() => { setShowAdd(true); setAddForm({ name: "", username: "", password: "", email: "", address: "" }); }}
          className="btn-premium btn-primary-premium !h-16 !px-10 shadow-2xl shadow-primary/30 text-lg hover:scale-105 active:scale-95 transition-all duration-300"
        >
          ➕ {T.addMember}
        </button>
      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-primary bg-white shadow-xl shadow-slate-200/50">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">👥</div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{T.totalMembers}</p>
              <p className="text-3xl font-black text-slate-900">{members.length}</p>
           </div>
        </div>
        <div className="card-premium !p-8 flex items-center gap-6 border-l-4 border-l-amber-500 bg-white shadow-xl shadow-slate-200/50">
           <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">🔍</div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{T.pendingApproval}</p>
              <p className="text-3xl font-black text-slate-900">{pendingList.length}</p>
           </div>
        </div>
      </div>

      {/* Tabs & Bulk Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              currentTab === "approved" 
                ? "bg-white text-primary shadow-lg shadow-black/5" 
                : "text-slate-500 hover:text-slate-700"
            }`} 
            onClick={() => changeTab("approved")}
          >
            ✅ {T.approved} 
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
              currentTab === 'approved' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
            }`}>
              {approvedList.length}
            </span>
          </button>
        </div>

        {selected.length > 0 && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-300 shadow-sm"
            >
              <span className="text-2xl leading-none transform translate-y-[3px]">⋮</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-14 z-[110] w-64 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 py-3 animate-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-2 mb-2 border-b border-slate-50">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{selected.length} {lang==='en'?'Members Selected':'አባላት ተመርጠዋል'}</p>
                </div>
                
                {currentTab === "pending" && (
                  <button onClick={() => { handleApprove(); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-3">
                    <span>✓</span> {T.approve}
                  </button>
                )}

                {selected.length === 1 && (
                  <button onClick={openEdit} className="w-full text-left px-5 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-3">
                    <span>✏️</span> {T.edit}
                  </button>
                )}

                <button onClick={() => { setShowReset(true); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <span>🔑</span> {T.resetPassword}
                </button>

                <button onClick={() => { handleBlock(); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-3">
                  <span>🚫</span> {T.block}
                </button>

                <button onClick={() => { handleUnblock(); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                  <span>🔓</span> {T.unblock}
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
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold animate-in zoom-in-95 duration-300 ${
          msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          <span>{msg.type === 'success' ? '✅' : '❌'}</span>
          {msg.text}
        </div>
      )}

      {/* Members Table */}
      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    checked={activeList.length > 0 && activeList.every(m => selected.includes(m.id))} 
                    onChange={() => toggleAll(activeList)} 
                  />
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.name}</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.username}</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.email}</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.address}</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-800 uppercase tracking-widest text-right">{T.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {activeList.map((m) => (
                <tr 
                  key={m.id} 
                  className={`group transition-all duration-200 cursor-pointer hover:bg-slate-50/80 ${selected.includes(m.id) ? "bg-primary/5" : ""}`} 
                  onClick={() => toggleSelect(m.id)}
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" checked={selected.includes(m.id)} readOnly />
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{m.name}</div>
                     <div className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider">ID: {m.id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{m.username}</code>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{m.email || "—"}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{m.address || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {m.is_blocked && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-500 text-[9px] font-extrabold uppercase">{T.blocked}</span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        m.approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {m.approved ? (lang==='en'?T.active:'የተረጋገጠ') : (lang==='en'?'Unverified':'ያልተረጋገጠ')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {activeList.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <div className="text-5xl mb-6 grayscale opacity-20">📂</div>
                    <p className="text-slate-400 font-bold text-lg">{T.noMembers}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{T.addMember}</h3>
              <button onClick={() => setShowAdd(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
            </div>
            <form onSubmit={addUser} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.fullName}</label>
                <input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required className="input-premium" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.username}</label>
                  <input value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })} required className="input-premium" placeholder="john123" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.password}</label>
                  <input type="password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} required className="input-premium" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.email}</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="input-premium" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.address}</label>
                <input value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} className="input-premium" placeholder="City, Country" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn-premium btn-primary-premium h-14 text-base shadow-lg shadow-primary/20">{T.add}</button>
                <button type="button" className="flex-1 btn-premium btn-secondary-premium h-14 text-base" onClick={() => setShowAdd(false)}>{T.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Member Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowEdit(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{T.edit}</h3>
              <button onClick={() => setShowEdit(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
            </div>
            <form onSubmit={submitEdit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.fullName}</label>
                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required className="input-premium" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.username}</label>
                <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} required className="input-premium" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.email}</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="input-premium" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.address}</label>
                <input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="input-premium" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn-premium btn-primary-premium h-14 text-base shadow-lg shadow-primary/20">{T.saveChanges}</button>
                <button type="button" className="flex-1 btn-premium btn-secondary-premium h-14 text-base" onClick={() => setShowEdit(false)}>{T.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowReset(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{T.resetPassword}</h3>
              <button onClick={() => setShowReset(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
            </div>
            <form onSubmit={handleResetPassword} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.newPassword}</label>
                <input 
                  type="password" 
                  value={resetPass} 
                  onChange={e => setResetPass(e.target.value)} 
                  required 
                  className="input-premium" 
                  placeholder="••••••••" 
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 btn-premium btn-primary-premium h-12 text-sm shadow-lg shadow-primary/20">{T.resetPassword}</button>
                <button type="button" className="flex-1 btn-premium btn-secondary-premium h-12 text-sm" onClick={() => setShowReset(false)}>{T.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

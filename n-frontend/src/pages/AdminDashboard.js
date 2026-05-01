import { useEffect, useState } from "react";
import API from "../api";

const t = {
  en: {
    title: "Admin Dashboard",
    librarians: "Librarians",
    members: "Members",
    pending: "Pending Approval",
    name: "Name",
    username: "Username",
    email: "Email",
    address: "Address",
    role: "Role",
    status: "Status",
    actions: "Actions",
    delete: "Delete Selected",
    edit: "Edit Selected",
    resetPw: "Reset Password",
    addLibrarian: "Add Librarian",
    addMember: "Add Member",
    fullName: "Full Name",
    newUsername: "Username",
    password: "Password",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    approve: "Approve Selected",
    reject: "Reject Selected",
    confirmDelete: "Delete selected users?",
    confirmReject: "Reject selected members?",
    newPassword: "New Password",
    update: "Update",
    noUsers: "No users found",
    approved: "Approved",
    pendingStatus: "Pending",
    editUser: "Edit User",
    systemRules: "System Rules",
    maxBorrowDays: "Max Borrow Duration (Days)",
    fineRate: "Daily Fine Rate (ETB)",
    saveRules: "Save Rules",
    rulesUpdated: "Rules updated successfully",
    selectOne: "Please select exactly one user to edit",
    selectAtLeastOne: "Please select at least one user",
    block: "Block",
    unblock: "Unblock",
    blocked: "Blocked",
    confirmBlock: "Block this user?",
    confirmUnblock: "Unblock this user?",
    modifyProfile: "Modify Profile",
    suspendAccount: "Suspend Account",
    restoreAccess: "Restore Access",
    removeMember: "Remove Member",
    membersSelected: "Members Selected",
    viewDetail: "View Detail",
  },
  am: {
    title: "የአድሚን ዳሽቦርድ",
    librarians: "ላይብረሪያኖች",
    members: "አባላት",
    pending: "ማጽደቅ የሚጠብቁ",
    name: "ስም",
    username: "የተጠቃሚ ስም",
    email: "ኢሜይል",
    address: "አድራሻ",
    role: "ሚና",
    status: "ሁኔታ",
    actions: "ድርጊቶች",
    delete: "የተመረጡትን ሰርዝ",
    edit: "የተመረጠውን አርም",
    resetPw: "ፓስዎርድ ቀይር",
    addLibrarian: "ላይብረሪያን ጨምር",
    addMember: "አባል ጨምር",
    fullName: "ሙሉ ስም",
    newUsername: "የተጠቃሚ ስም",
    password: "ፓስዎርድ",
    add: "ጨምር",
    save: "አስቀምጥ",
    cancel: "ሰርዝ",
    approve: "የተመረጡትን አጽድቅ",
    reject: "የተመረጡትን ውድቅ አድርግ",
    confirmDelete: "የተመረጡትን ተጠቃሚዎች መሰረዝ ይፈልጋሉ?",
    confirmReject: "የተመረጡትን አባላት ውድቅ ማድረግ ይፈልጋሉ?",
    newPassword: "አዲስ ፓስዎርድ",
    update: "አዘምን",
    noUsers: "ምንም ተጠቃሚዎች አልተገኙም",
    approved: "ጸድቋል",
    pendingStatus: "በመጠባበቅ ላይ",
    editUser: "ተጠቃሚ አርም",
    systemRules: "የሲስተም ህጎች",
    maxBorrowDays: "መጽሐፍ ተበድሮ የሚቆይበት ቀን (ቢበዛ)",
    fineRate: "የቀን የቅጣት መጠን (ብር)",
    saveRules: "ህጎችን አስቀምጥ",
    rulesUpdated: "የሲስተም ህጎች ተቀምጠዋል",
    selectOne: "እባክዎን ለማረም አንድ ተጠቃሚ ብቻ ይምረጡ",
    selectAtLeastOne: "እባክዎን ቢያንስ አንድ ተጠቃሚ ይምረጡ",
    block: "አግድ",
    unblock: "ከእገዳ አንሳ",
    blocked: "የታገደ",
    confirmBlock: "ይህን ተጠቃሚ ማገድ ይፈልጋሉ?",
    confirmUnblock: "ከእገዳ ማንሳት ይፈልጋሉ?",
    modifyProfile: "መገለጫ አርም",
    suspendAccount: "መለያ አግድ",
    restoreAccess: "መለያ ክፈት",
    removeMember: "አባል ሰርዝ",
    membersSelected: "አባላት ተመርጠዋል",
    viewDetail: "ዝርዝር እይታ",
  },
};

export default function AdminDashboard({ lang, setLang }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState("rules"); 
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showAdd, setShowAdd] = useState(null);
  const [addForm, setAddForm] = useState({ name: "", username: "", password: "", email: "", address: "" });
  const [resetModal, setResetModal] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", username: "", email: "", address: "" });
  const [rules, setRules] = useState({ maxBorrowDays: 7, fineRate: 5 });
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);
  const T = t[lang];

  const load = () => API.get("/admin/users").then(r => setUsers(r.data)).catch(() => {});
  const loadRules = () => API.get("/admin/settings").then(r => setRules(r.data)).catch(() => {});
  
  useEffect(() => { load(); loadRules(); }, []);

  useEffect(() => {
    const handleOutside = () => setShowGlobalMenu(false);
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, []);

  const changeTab = (tab) => {
    setCurrentTab(tab);
    setSelected([]);
  };

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = (list) => {
    const ids = list.map(u => u.id);
    const allIn = ids.every(id => selected.includes(id));
    if (allIn) setSelected(prev => prev.filter(id => !ids.includes(id)));
    else setSelected(prev => [...new Set([...prev, ...ids])]);
  };

  const handleAdd = (role) => {
    setShowAdd(role);
    setAddForm({ name: "", username: "", password: "", email: "", address: "" });
  };

  const handleEdit = () => {
    if (selected.length !== 1) return flash(T.selectOne, "error");
    const user = users.find(u => u.id === selected[0]);
    setEditModal(user);
    setEditForm({ name: user.name, username: user.username, email: user.email || "", address: user.address || "" });
  };

  const handleViewDetail = () => {
    if (selected.length !== 1) return flash(T.selectOne, "error");
    const user = users.find(u => u.id === selected[0]);
    setDetailModal(user);
  };

  const handleReset = () => {
    if (selected.length !== 1) return flash(T.selectOne, "error");
    setResetModal(users.find(u => u.id === selected[0]));
    setNewPw("");
  };

  const handleDelete = async () => {
    if (selected.length === 0) return flash(T.selectAtLeastOne, "error");
    if (!window.confirm(T.confirmDelete)) return;
    try {
      await Promise.all(selected.map(id => API.delete(`/admin/users/${id}`)));
      flash(lang === "en" ? "Selected users deleted" : "የተመረጡት ተሰርዘዋል");
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const handleApprove = async () => {
    if (selected.length === 0) return flash(T.selectAtLeastOne, "error");
    try {
      await Promise.all(selected.map(id => API.put(`/admin/approve/${id}`)));
      flash(lang === "en" ? "Selected members approved" : "የተመረጡት ጸድቀዋል");
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const handleReject = async () => {
    if (selected.length === 0) return flash(T.selectAtLeastOne, "error");
    if (!window.confirm(T.confirmReject)) return;
    try {
      await Promise.all(selected.map(id => API.put(`/admin/reject/${id}`)));
      flash(lang === "en" ? "Selected members rejected" : "የተመረጡት ውድቅ ተደርገዋል");
      setSelected([]);
      load();
    } catch { flash("Error", "error"); }
  };

  const addUser = async (e) => {
    e.preventDefault();
    const endpoint = showAdd === "librarian" ? "/admin/librarian" : "/admin/member";
    try {
      const res = await API.post(endpoint, addForm);
      flash(res.data.message);
      setShowAdd(null);
      load();
    } catch (err) { flash(err.response?.data?.message || "Error", "error"); }
  };

  const saveEdit = async () => {
    try {
      await API.put(`/admin/users/${editModal.id}`, editForm);
      flash(lang === "en" ? "User updated" : "ተጠቃሚ ተዘምኗል");
      setEditModal(null);
      setSelected([]);
      load();
    } catch (err) { flash(err.response?.data?.message || "Error", "error"); }
  };

  const resetPassword = async () => {
    if (!newPw.trim()) return;
    try {
      await API.put(`/admin/reset-password/${resetModal.id}`, { password: newPw });
      flash(lang === "en" ? "Password updated" : "ፓስዎርድ ተቀይሯል");
      setResetModal(null);
      setSelected([]);
    } catch { flash("Error", "error"); }
  };

  const saveRules = async (e) => {
    e.preventDefault();
    try { await API.put("/admin/settings", rules); flash(T.rulesUpdated); } catch { flash("Error", "error"); }
  };

  const UserTable = ({ list, showApproval }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 w-12">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                checked={list.length > 0 && list.every(u => selected.includes(u.id))}
                onChange={() => toggleAll(list)}
              />
            </th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-12">#</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.name}</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.username}</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{T.email}</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">{T.status}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {list.map((u, i) => (
            <tr 
              key={u.id} 
              className={`group transition-all duration-200 cursor-pointer hover:bg-slate-50/80 ${selected.includes(u.id) ? "bg-primary/5" : ""}`} 
              onClick={() => toggleSelect(u.id)}
            >
              <td className="px-6 py-4">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" checked={selected.includes(u.id)} readOnly />
              </td>
              <td className="px-6 py-4 font-bold text-slate-400">{i + 1}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{u.name}</span>
                  {u.is_blocked && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter mt-0.5">{T.blocked}</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <code className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{u.username}</code>
              </td>
              <td className="px-6 py-4 font-medium text-slate-600">{u.email || "—"}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {u.is_blocked && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-[9px] font-bold uppercase">{T.blocked}</span>
                  )}
                  {showApproval && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      u.approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {u.approved ? T.approved : T.pendingStatus}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">{T.noUsers}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const Toolbar = ({ role, isPending }) => (
    <div className="flex flex-wrap items-center gap-3 animate-in fade-in duration-300">
      <button onClick={() => handleAdd(role)} className="btn-premium btn-secondary-premium !py-2 !px-4 !text-xs !rounded-xl">
        ➕ {role === "librarian" ? T.addLibrarian : T.addMember}
      </button>
      
      {selected.length > 0 && (
        <div className="flex items-center gap-4 pl-4 border-l border-slate-200 relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{selected.length} {T.selected || "Selected"}</span>
          </div>

          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowGlobalMenu(!showGlobalMenu); }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:scale-110 transition-transform"
            >
              <span className="text-2xl leading-none transform translate-y-[3px]">⋮</span>
            </button>

            {showGlobalMenu && (
              <div 
                className="absolute right-0 mt-2 w-60 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 py-3 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right max-h-[350px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 mb-2 pb-2 border-b border-slate-50">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{selected.length} {T.membersSelected}</p>
                </div>
                
                <div className="px-2 space-y-0.5">
                  {isPending && (
                    <>
                      <button onClick={() => { handleApprove(); setShowGlobalMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-emerald-600 font-bold text-xs hover:bg-emerald-50 transition-colors">
                        <span className="text-base">✓</span> {T.approve}
                      </button>
                      <button onClick={() => { handleReject(); setShowGlobalMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors">
                        <span className="text-base">✕</span> {T.reject}
                      </button>
                      <div className="h-px bg-slate-50 my-1 mx-4"></div>
                    </>
                  )}

                  {selected.length === 1 && (
                    <>
                      <button onClick={() => { handleViewDetail(); setShowGlobalMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-teal-600 font-bold text-xs hover:bg-teal-50 transition-colors">
                        <span className="text-base">👁️</span> {T.viewDetail}
                      </button>
                      <button onClick={() => { handleEdit(); setShowGlobalMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors">
                        <span className="text-base">✏️</span> {T.modifyProfile}
                      </button>
                      <button onClick={() => { handleReset(); setShowGlobalMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors">
                        <span className="text-base">🔑</span> {T.resetPw}
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={async () => {
                      if (!window.confirm(T.confirmBlock || "Block selected?")) return;
                      try {
                        await Promise.all(selected.map(id => API.put(`/admin/block/${id}`)));
                        flash(lang === "en" ? "Users blocked" : "ተጠቃሚዎች ታግደዋል");
                        load();
                        setSelected([]);
                        setShowGlobalMenu(false);
                      } catch { flash("Error", "error"); }
                    }} 
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-amber-600 font-bold text-xs hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-base">🚫</span> {T.suspendAccount}
                  </button>

                  <button 
                    onClick={async () => {
                      if (!window.confirm(T.confirmUnblock || "Unblock selected?")) return;
                      try {
                        await Promise.all(selected.map(id => API.put(`/admin/unblock/${id}`)));
                        flash(lang === "en" ? "Users unblocked" : "ተጠቃሚዎች ከእገዳ ተነስተዋል");
                        load();
                        setSelected([]);
                        setShowGlobalMenu(false);
                      } catch { flash("Error", "error"); }
                    }} 
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-indigo-600 font-bold text-xs hover:bg-indigo-50 transition-colors"
                  >
                    <span className="text-base">🔓</span> {T.restoreAccess}
                  </button>

                  <div className="h-px bg-slate-50 my-1 mx-4"></div>

                  <button onClick={() => { handleDelete(); setShowGlobalMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors">
                    <span className="text-base">🗑️</span> {T.removeMember}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const pendingMembers = users.filter(u => u.role === "student" && !u.approved);
  const librarians = users.filter(u => u.role === "librarian");
  const approvedMembers = users.filter(u => u.role === "student" && u.approved);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-outfit font-extrabold text-slate-900 tracking-tight leading-tight">{T.title}</h1>
          <p className="mt-2 text-slate-500 font-medium">Manage library staff, members, and global rules.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl w-fit mb-8">
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            currentTab === "rules" ? "bg-white text-primary shadow-lg shadow-black/5" : "text-slate-500 hover:text-slate-700"
          }`} 
          onClick={() => changeTab("rules")}
        >
          ⚙️ {T.systemRules}
        </button>
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            currentTab === "librarians" ? "bg-white text-primary shadow-lg shadow-black/5" : "text-slate-500 hover:text-slate-700"
          }`} 
          onClick={() => changeTab("librarians")}
        >
          📋 {T.librarians}
        </button>
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            currentTab === "members" ? "bg-white text-primary shadow-lg shadow-black/5" : "text-slate-500 hover:text-slate-700"
          }`} 
          onClick={() => changeTab("members")}
        >
          👥 {T.members}
        </button>
      </div>

      {msg.text && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold animate-in zoom-in-95 duration-300 ${
          msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          <span>{msg.type === 'success' ? '✅' : '❌'}</span>
          {msg.text}
        </div>
      )}

      {/* Content Area */}
      <div className="space-y-8">
        {currentTab === "rules" && (
          <div className="card-premium max-w-2xl !p-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="text-3xl">⚙️</span> {T.systemRules}
            </h3>
            <form onSubmit={saveRules} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.maxBorrowDays}</label>
                <input type="number" value={rules.maxBorrowDays} onChange={e => setRules({...rules, maxBorrowDays: e.target.value})} className="input-premium h-14" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.fineRate}</label>
                <input type="number" value={rules.fineRate} onChange={e => setRules({...rules, fineRate: e.target.value})} className="input-premium h-14" />
              </div>
              <button type="submit" className="btn-premium btn-primary-premium w-full h-14 text-base shadow-lg shadow-primary/20">{T.saveRules}</button>
            </form>
          </div>
        )}

        {currentTab === "librarians" && (
          <div className="table-wrap !p-0 !overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">📋 {T.librarians} ({librarians.length})</h3>
              <Toolbar role="librarian" isPending={false} />
            </div>
            <UserTable list={librarians} showApproval={false} />
          </div>
        )}

        {currentTab === "members" && (
          <div className="space-y-8">
            {pendingMembers.length > 0 && (
              <div className="table-wrap !p-0 border-2 border-amber-200 !overflow-visible">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-amber-50/50 border-b border-amber-100">
                  <h3 className="text-lg font-bold text-amber-700">⏳ {T.pending} ({pendingMembers.length})</h3>
                  <Toolbar role="member" isPending={true} />
                </div>
                <UserTable list={pendingMembers} showApproval={true} />
              </div>
            )}
            <div className="table-wrap !p-0 !overflow-visible">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
                <h3 className="text-lg font-bold text-emerald-700">👥 {T.members} ({approvedMembers.length})</h3>
                <Toolbar role="member" isPending={false} />
              </div>
              <UserTable list={approvedMembers} showApproval={false} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{showAdd === "librarian" ? T.addLibrarian : T.addMember}</h3>
              <button onClick={() => setShowAdd(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
            </div>
            <form onSubmit={addUser} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.fullName}</label>
                <input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required className="input-premium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.newUsername}</label>
                  <input value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })} required className="input-premium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.password}</label>
                  <input type="password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} required className="input-premium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.email}</label>
                  <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="input-premium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.address}</label>
                  <input value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} className="input-premium" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn-premium btn-primary-premium h-14 text-base shadow-lg shadow-primary/20">{T.add}</button>
                <button type="button" className="flex-1 btn-premium btn-secondary-premium h-14 text-base" onClick={() => setShowAdd(null)}>{T.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setEditModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{T.editUser}</h3>
                <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">{editModal.name} • {editModal.role}</p>
              </div>
              <button onClick={() => setEditModal(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.fullName}</label>
                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input-premium" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.username}</label>
                <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="input-premium" />
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
                <button onClick={saveEdit} className="flex-1 btn-premium btn-primary-premium h-14 text-base shadow-lg shadow-primary/20">{T.save}</button>
                <button onClick={() => setEditModal(null)} className="flex-1 btn-premium btn-secondary-premium h-14 text-base">{T.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setResetModal(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-outfit font-extrabold text-slate-900">{T.resetPw}</h3>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">{resetModal.name}</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{T.newPassword}</label>
                <input value={newPw} onChange={e => setNewPw(e.target.value)} type="password" placeholder="••••••••" className="input-premium h-14" />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={resetPassword} className="flex-1 btn-premium btn-primary-premium h-14 text-base shadow-lg shadow-primary/20">{T.update}</button>
                <button onClick={() => setResetModal(null)} className="flex-1 btn-premium btn-secondary-premium h-14 text-base">{T.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setDetailModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{T.viewDetail}</h3>
                <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">{detailModal.role}</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{T.fullName}</label>
                <p className="text-slate-800 font-medium text-lg">{detailModal.name}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{T.username}</label>
                <p className="text-slate-600 font-medium">{detailModal.username}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{T.email}</label>
                <p className="text-slate-600 font-medium">{detailModal.email || "—"}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{T.address}</label>
                <p className="text-slate-600 font-medium">{detailModal.address || "—"}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{T.status}</label>
                <p className="mt-1 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${detailModal.approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {detailModal.approved ? T.approved : T.pendingStatus}
                  </span>
                  {detailModal.is_blocked && (
                    <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider">
                      {T.blocked}
                    </span>
                  )}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => setDetailModal(null)} className="btn-premium btn-secondary-premium px-6">{T.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

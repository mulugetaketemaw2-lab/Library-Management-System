import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { formatDateEC } from "../utils/dateFormatter";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const t = {
  en: {
    adminTitle: "Library Overview",
    studentTitle: "Personal Dashboard",
    totalBooks: "Total Books",
    members: "Members",
    issued: "Currently Issued",
    returned: "Total Returned",
    totalFines: "Total Fines (ETB)",
    booksIHave: "Books I Have",
    totalBorrowed: "Total Borrowed",
    myFines: "My Fines (ETB)",
    overdueTitle: "Overdue Books",
    myBorrowedTitle: "Loan History",
    myReservations: "My Reservations",
    book: "Book",
    student: "Student",
    dueDate: "Due Date",
    daysOverdue: "Days Overdue",
    daysLeft: "Days Remaining",
    reserveDate: "Reserved On",
    status: "Status",
    noBooks: "No records found",
    welcome: "Welcome back,",
    filterAll: "All Records",
    filterCurrent: "Currently Borrowed",
    filterHistory: "Past History",
    cancelReserve: "Cancel",
    fineBreakdown: "Fine Tracking",
    outstanding: "Owed (Overdue)",
    paidHistory: "Paid / History",
    quickReport: "Quick Report",
    recentTransactions: "Recent Transactions",
    realTimeUpdate: "Real-time update of library movement.",
    viewAnalytics: "View Analytics",
    systemIntelligence: "System Intelligence",
    membershipStatus: "Membership Status",
    dbSync: "Database Sync",
    storageUsed: "Storage Used",
    uptime: "Uptime",
    latency: "Latency",
    pendingTasks: "Pending Tasks",
    next7Days: "Next 7 Days",
    active: "Active",
    verifyMembers: "Verify Members",
    overdueAlerts: "Overdue Alerts",
    systemUpdates: "System Updates",
    quickActions: "Quick Actions",
    newBook: "New Book",
    issueBook: "Issue Book",
    returnBook: "Return Book",
    settings: "Settings",
    popularTitle: "Most Borrowed Books",
    activityTitle: "Borrowing Activity (14 Days)",
    totalLoans: "Total Loans",
    activeStatus: "Active Status",
    noReservations: "No active reservations",
    viewAll: "View All"
  },
  am: {
    adminTitle: "አጠቃላይ የቤተ-መጻሕፍት ሁኔታ",
    studentTitle: "የእኔ ዳሽቦርድ",
    totalBooks: "ጠቅላላ መጻሕፍት",
    members: "አባላት",
    issued: "በውሰት ላይ ያሉ",
    returned: "የተመለሱ",
    totalFines: "ጠቅላላ ቅጣት (ብር)",
    booksIHave: "በእጄ ላይ ያሉ",
    totalBorrowed: "ጠቅላላ የተበደርኳቸው",
    myFines: "የእኔ ቅጣት (ብር)",
    overdueTitle: "ቀጠሮ ያለፈባቸው መጻሕፍት",
    myBorrowedTitle: "የውሰት ታሪኬ (Loan History)",
    myReservations: "የያዝኳቸው መጻሕፍት",
    book: "መጽሐፍ",
    student: "ተማሪ",
    dueDate: "መመለሻ ቀን",
    daysOverdue: "ያለፈባቸው ቀናት",
    daysLeft: "የቀሩት ቀናት",
    reserveDate: "የተያዘበት ቀን",
    status: "ሁኔታ",
    noBooks: "ምንም መረጃ አልተገኘም",
    welcome: "እንኳን ደህና መጡ፣",
    filterAll: "ሁሉም",
    filterCurrent: "በውሰት ላይ ያሉ",
    filterHistory: "የቀድሞ ታሪክ",
    cancelReserve: "ሰርዝ",
    fineBreakdown: "የቅጣት መከታተያ",
    outstanding: "ያልተከፈለ (ከቀጠሮ ያለፈ)",
    paidHistory: "የተከፈለ / የቀድሞ",
    quickReport: "ፈጣን ሪፖርት",
    recentTransactions: "የቅርብ ጊዜ እንቅስቃሴዎች",
    realTimeUpdate: "የቤተ-መጻሕፍት ወቅታዊ ሁኔታ መከታተያ።",
    viewAnalytics: "ትንታኔዎችን ይመልከቱ",
    systemIntelligence: "የሲስተም መረጃ ማዕከል",
    membershipStatus: "የአባልነት ሁኔታ",
    dbSync: "የመረጃ ማከማቻ ዝግጅት",
    storageUsed: "ጥቅም ላይ የዋለ ቦታ",
    uptime: "የአገልግሎት ዝግጁነት",
    latency: "የፍጥነት መጠን",
    pendingTasks: "መከናወን ያለባቸው ተግባራት",
    next7Days: "የሚቀጥሉት 7 ቀናት",
    active: "ንቁ",
    verifyMembers: "አባላትን አረጋግጥ",
    overdueAlerts: "የቀጠሮ ማለፊያ ማስጠንቀቂያ",
    systemUpdates: "የሲስተም ማሻሻያ",
    quickActions: "ፈጣን ተግባራት",
    newBook: "አዲስ መጽሐፍ",
    issueBook: "መጽሐፍ አበድር",
    returnBook: "መጽሐፍ ተቀበል",
    settings: "ቅንብሮች",
    popularTitle: "ብዙ ጊዜ የተበደሩ መጻሕፍት",
    activityTitle: "የውሰት እንቅስቃሴ (14 ቀናት)",
    totalLoans: "ጠቅላላ ውሰቶች",
    activeStatus: "የአሁኑ ሁኔታ",
    noReservations: "ምንም የተያዘ መጽሐፍ የለም",
    viewAll: "ሁሉንም አሳይ"
  }
};

export default function Dashboard({ lang }) {
  const [stats, setStats]     = useState(null);
  const [chartData, setChartData] = useState({ popular: null, activity: null });
  const [myBooks, setMyBooks] = useState([]);
  const [myReserves, setMyReserves] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const T = t[lang];

  useEffect(() => {
    const loadData = () => {
      if (user.role === "librarian" || user.role === "admin") {
        API.get("/reports/summary").then(r => setStats(r.data)).catch(() => {});
        API.get("/borrow").then(r => setRecentActions(r.data.slice(0, 6))).catch(() => {});
        API.get("/admin/users").then(r => {}).catch(() => {});
        
        API.get("/reports/stats").then(r => {
          const pop = {
            labels: r.data.popularBooks.map(b => b.title),
            datasets: [{
              label: lang === 'en' ? 'Borrow Count' : 'የውሰት ብዛት',
              data: r.data.popularBooks.map(b => b.count),
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderRadius: 8,
            }]
          };
          const act = {
            labels: r.data.dailyActivity.map(a => a._id),
            datasets: [{
              label: lang === 'en' ? 'Books Issued' : 'የተበደሩ መጻሕፍት',
              data: r.data.dailyActivity.map(a => a.count),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
            }]
          };
          setChartData({ popular: pop, activity: act });
        }).catch(() => {});
      } else {
        API.get("/borrow/my").then(r => setMyBooks(r.data)).catch(() => {});
        API.get("/reservation/my").then(r => setMyReserves(r.data)).catch(() => {});
      }
    };
    loadData();
  }, [user.role, lang]);

  const isAdminView = user.role === "librarian" || user.role === "admin";
  const isDark = document.documentElement.classList.contains('dark');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: false,
        labels: { color: isDark ? '#94a3b8' : '#64748b' }
      } 
    },
    scales: { 
      y: { 
        beginAtZero: true, 
        grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
      }, 
      x: { 
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
      } 
    }
  };

  const outstandingFines = myBooks.filter(b => b.status === 'issued').reduce((sum, b) => sum + Number(b.fine), 0);
  const paidFines = myBooks.filter(b => b.status === 'returned').reduce((sum, b) => sum + Number(b.fine), 0);

  const StatCard = ({ title, value, icon, colorClass, subtitle }) => (
    <div className={`card-premium relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass.split(' ')[0]}`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${colorClass}`}>
            {icon}
          </div>
          {subtitle && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</div>}
        </div>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{value}</h3>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 space-y-10 pb-20">
      {/* Quick Report Button */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => navigate('/reports')} 
          className="group flex items-center gap-3 px-8 h-14 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-sm shadow-2xl shadow-primary/40 hover:scale-105 hover:shadow-primary/50 transition-all duration-300 active:scale-95"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform duration-300">📊</span>
          <span>{T.quickReport}</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isAdminView ? (
          <>
            {stats && (
              <>
                <StatCard title={T.totalBooks} value={stats.total_books} icon="📚" colorClass="bg-blue-50 text-blue-600" />
                <StatCard title={T.members} value={stats.total_members} icon="👥" colorClass="bg-emerald-50 text-emerald-600" />
                <StatCard title={T.issued} value={stats.issued_books} icon="🔄" colorClass="bg-amber-50 text-amber-600" />
                <StatCard title={T.returned} value={stats.returned_books} icon="↩️" colorClass="bg-purple-50 text-purple-600" />
                <StatCard title={T.totalFines} value={Number(stats.total_fines).toLocaleString()} icon="💰" colorClass="bg-rose-50 text-rose-600" />
              </>
            )}
          </>
        ) : (
          <>
            <StatCard title={T.booksIHave} value={myBooks.filter(b => b.status === "issued").length} icon="📖" colorClass="bg-orange-50 text-orange-600" />
            <StatCard title={T.myReservations} value={myReserves.length} icon="⏳" colorClass="bg-blue-50 text-blue-600" />
            <StatCard 
              title={T.myFines} 
              value={(outstandingFines + paidFines).toLocaleString()} 
              icon="💸" 
              colorClass="bg-rose-50 text-rose-600" 
              subtitle={`${T.outstanding}: ${outstandingFines}`}
            />
            <StatCard title={T.totalLoans} value={myBooks.length} icon="📜" colorClass="bg-indigo-50 text-indigo-600" />
            <StatCard title={T.activeStatus} value={T.active} icon="✅" colorClass="bg-emerald-50 text-emerald-600" />
          </>
        )}
      </div>

      {/* Analytics Section (Charts) */}
      {isAdminView && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="card-premium !p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-8">{T.popularTitle}</h3>
              <div className="h-[300px]">
                {chartData.popular ? <Bar 
                  data={chartData.popular} 
                  options={chartOptions} 
                /> : <div className="h-full flex items-center justify-center text-slate-300">Loading...</div>}
              </div>
           </div>
           <div className="card-premium !p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-8">{T.activityTitle}</h3>
              <div className="h-[300px]">
                {chartData.activity ? <Line 
                  data={chartData.activity} 
                  options={chartOptions} 
                /> : <div className="h-full flex items-center justify-center text-slate-300">Loading...</div>}
              </div>
           </div>
        </div>
      )}

      {/* Main Content Grid - Now Full Width */}
      <div className="space-y-8">
        
        {/* Quick Actions Grid */}
        {isAdminView && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: T.newBook, icon: "➕", color: "hover:border-blue-200 hover:bg-blue-50", link: "/books" },
              { label: T.issueBook, icon: "🤝", color: "hover:border-emerald-200 hover:bg-emerald-50", link: "/borrow" },
              { label: T.returnBook, icon: "↩️", color: "hover:border-amber-200 hover:bg-amber-50", link: "/borrow" },
              { label: T.settings, icon: "⚙️", color: "hover:border-slate-200 hover:bg-slate-50", link: "/admin" },
            ].map((act, i) => (
              <button 
                key={i} 
                onClick={() => navigate(act.link)}
                className={`p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 flex flex-col items-center gap-3 group ${act.color}`}
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{act.icon}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{act.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Transactions Table - Expanded */}
        <div className="table-wrap !p-0">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{isAdminView ? T.recentTransactions : T.myBorrowedTitle}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">{T.realTimeUpdate}</p>
            </div>
            <button onClick={() => navigate('/reports')} className="btn-premium btn-secondary-premium !py-2 !px-5 !text-[10px] !rounded-2xl">{T.viewAnalytics}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.book}</th>
                  <th className="px-8 py-5 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{isAdminView ? T.student : T.status}</th>
                  <th className="px-8 py-5 text-xs font-extrabold text-slate-800 uppercase tracking-widest">{T.dueDate}</th>
                  <th className="px-8 py-5 text-xs font-extrabold text-slate-800 uppercase tracking-widest text-right">{T.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {(isAdminView ? recentActions : myBooks).slice(0, 10).map((row, i) => {
                  const isOverdue = new Date(row.due_date) < new Date() && row.status === 'issued';
                  return (
                    <tr 
                      key={i} 
                      className="group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/books/${row.real_book_id || row.book_id}`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-300">📖</div>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-primary transition-colors">{row.title}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {(row.id || row._id)?.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {isAdminView && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{(row.student_name || 'U').charAt(0)}</div>}
                          {isAdminView ? (
                            <span className="font-bold text-slate-700">{row.student_name}</span>
                          ) : (
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${row.status === 'issued' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {row.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-mono font-extrabold text-slate-500 text-sm group-hover:text-slate-900 transition-colors">
                           {formatDateEC(row.due_date, lang)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {isOverdue ? (
                          <span className="badge-premium bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">🚩 Overdue</span>
                        ) : (
                          <span className={`badge-premium ${row.status === 'returned' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} border border-opacity-50`}>
                            {row.status === 'returned' ? '✓ Finished' : '● Active'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {(isAdminView ? recentActions : myBooks).length === 0 && (
                   <tr><td colSpan="4" className="px-8 py-20 text-center">
                      <div className="text-4xl mb-4 grayscale opacity-20">📜</div>
                      <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">{T.noBooks}</p>
                   </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

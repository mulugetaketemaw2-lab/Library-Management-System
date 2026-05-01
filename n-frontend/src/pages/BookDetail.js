import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { formatDateEC } from "../utils/dateFormatter";
const BACKEND_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');


const t = {
  en: {
    back: "Back to Collection",
    author: "Author",
    isbn: "ISBN",
    category: "Category",
    year: "Publication Year",
    shelf: "Shelf Location",
    condition: "Condition",
    description: "Description",
    status: "Status",
    available: "Available",
    borrowed: "Borrowed",
    reserveBtn: "Reserve Book",
    reservedMsg: "Book reserved successfully",
    close: "Close",
    notFound: "Book not found",
    loading: "Loading book details...",
    readOnline: "Read Online",
    viewerTitle: "Digital Reader",
    reviews: "User Reviews",
    noReviews: "No reviews yet. Be the first!",
    addReview: "Leave a Review",
    rating: "Rating",
    commentPlace: "What did you think of this book?...",
    submit: "Submit Review",
    delete: "Delete",
    avgRating: "Average Rating",
    stock: "Stock Level",
    copies: "copies available",
    lastAdded: "Last Stock Update",
    edition: "Edition",
    pages: "Pages",
    floor: "Floor"
  },
  am: {
    back: "ወደ መጻሕፍት ተመለስ",
    author: "ደራሲ",
    isbn: "ISBN",
    category: "ዘርፍ",
    year: "የታተመበት ዓመት",
    shelf: "መደርደሪያ",
    condition: "ሁኔታ",
    description: "መግለጫ",
    status: "ሁኔታ",
    available: "የሚገኝ",
    borrowed: "የተወሰደ",
    reserveBtn: "መጽሐፉን ያዝ",
    reservedMsg: "መጽሐፉ በተሳካ ሁኔታ ተይዟል",
    close: "ዝጋ",
    notFound: "መጽሐፉ አልተገኘም",
    loading: "መረጃ በመጫን ላይ...",
    readOnline: "ኦንላይን አንብብ",
    viewerTitle: "ዲጂታል አንባቢ",
    reviews: "አስተያየቶች",
    noReviews: "ምንም አስተያየት የለም። የመጀመሪያው ይሁኑ!",
    addReview: "አስተያየት ይስጡ",
    rating: "ደረጃ",
    commentPlace: "ስለ መጽሐፉ ምን ያስባሉ?...",
    submit: "አቅርብ",
    delete: "ሰርዝ",
    avgRating: "አማካይ ደረጃ",
    stock: "የክምችት መጠን",
    copies: "ኮፒዎች ቀርተዋል",
    lastAdded: "መጨረሻ ክምችት የተጨመረው",
    edition: "እትም",
    pages: "የገጽ ብዛት",
    floor: "ወለል"
  }
};

export default function BookDetail({ lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showReader, setShowReader] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  
  const T = t[lang];
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isStudent = user?.role === "student";

  const fetchReviews = useCallback(() => {
    API.get(`/reviews/${id}`).then(r => setReviews(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    API.get(`/books/${id}`)
      .then(r => {
        setBook(r.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    
    fetchReviews();
  }, [id, fetchReviews]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment) return;
    setSubmitting(true);
    try {
      await API.post("/reviews", { book_id: id, ...newReview });
      flash(lang === "en" ? "Review added" : "አስተያየቱ ተጨምሯል");
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (err) {
      flash(err.response?.data?.message || "Error", "error");
    }
    setSubmitting(false);
  };

  const deleteReview = async (rid) => {
    try {
      await API.delete(`/reviews/${rid}`);
      flash(lang === "en" ? "Review deleted" : "አስተያየቱ ተሰርዟል");
      fetchReviews();
    } catch { flash("Error", "error"); }
  };

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const reserveBook = async () => {
    try {
      await API.post("/reservation", { book_id: id });
      flash(T.reservedMsg, "success");
    } catch (err) {
      flash(err.response?.data?.message || "Error", "error");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{T.loading}</p>
      </div>
    </div>
  );

  if (!book) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-6 grayscale opacity-20">📚</div>
        <p className="text-slate-900 font-extrabold text-2xl mb-6">{T.notFound}</p>
        <button onClick={() => navigate(-1)} className="btn-premium btn-primary-premium">{T.back}</button>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 relative">
      {msg.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold animate-in zoom-in-95 duration-300 mb-8 ${
          msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          <span>{msg.type === 'success' ? '✅' : '❌'}</span>
          {msg.text}
        </div>
      )}

      <div className="card-premium p-10 md:p-16 space-y-16 relative">
        {/* Floating Close Button - Inside the card */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 right-8 z-[50] w-12 h-12 bg-primary/5 shadow-inner rounded-2xl flex items-center justify-center text-lg text-primary hover:bg-primary hover:text-white hover:rotate-90 transition-all duration-500 group animate-bounce hover:animate-none border border-primary/10"
          title={T.back}
        >
          <span className="transform group-hover:scale-125 transition-transform">✕</span>
        </button>
        {/* Header Info */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="inline-block px-5 py-2 rounded-2xl text-xs font-black bg-primary/10 text-primary uppercase tracking-[0.3em]">{book.category}</span>
          <h1 className="text-6xl md:text-8xl font-outfit font-black text-slate-900 tracking-tighter leading-[0.95]">{book.title}</h1>
          <p className="text-3xl font-bold text-slate-400">{T.author}: <span className="text-primary-dark underline decoration-primary/20 decoration-8 underline-offset-[12px]">{book.author}</span></p>
        </div>

        {/* Specs Grid - Full Width and Spacious */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-10">
          <DetailItem icon="🆔" label={T.isbn} value={book.isbn} />
          <DetailItem icon="📅" label={T.year} value={book.pub_year} />
          <DetailItem icon="📚" label={T.edition} value={book.edition} />
          <DetailItem icon="📄" label={T.pages} value={book.pages} />
          <DetailItem icon="📍" label={T.shelf} value={book.shelf} />
          <DetailItem icon="🏢" label={T.floor} value={book.floor} />
          <DetailItem icon="✨" label={T.condition} value={book.condition} />
          <DetailItem 
            icon="📊" 
            label={T.stock} 
            value={`${book.available_copies} / ${book.total_copies}`} 
            sub={book.last_added_at ? `${T.lastAdded}: ${formatDateEC(book.last_added_at, lang)}` : null}
            isStock
            available={book.available_copies}
          />
        </div>

        {/* Description Section */}
        <div className="max-w-4xl mx-auto text-center border-t border-slate-100 pt-16">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-8">{T.description}</label>
          <p className="text-slate-600 leading-relaxed font-medium text-2xl italic bg-slate-50/50 p-12 rounded-[3rem] border border-white shadow-inner">{book.description || "No description available"}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-6 justify-center pt-8">
          {book.pdf_url && (
            <button 
              onClick={() => setShowReader(true)} 
              className="btn-premium bg-indigo-600 text-white hover:bg-indigo-700 h-20 px-12 shadow-2xl shadow-indigo-200 text-xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-3xl">📖</span> {T.readOnline}
            </button>
          )}
          {book.available_copies === 0 && isStudent && (
            <button onClick={reserveBook} className="btn-premium btn-primary-premium h-20 px-12 shadow-2xl shadow-primary/30 text-xl transition-all hover:scale-105 active:scale-95">⏳ {T.reserveBtn}</button>
          )}
        </div>

        {/* Beautiful framed image at the bottom */}
        <div className="pt-24 flex justify-center">
          <div className="relative group max-w-lg w-full px-6">
            <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            {book.image_url ? (
              <div className="relative z-10 p-6 bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transform hover:rotate-2 hover:scale-[1.05] transition-all duration-1000 border border-slate-100/50">
                <img 
                  src={book.image_url} 
                  alt={book.title} 
                  className="w-full rounded-[3rem] object-cover aspect-[3/4] shadow-2xl" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "";
                    setBook({...book, image_url: null});
                  }}
                />
              </div>
            ) : (
              <div className="relative z-10 w-full aspect-[3/4] rounded-[4rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-8">
                <span className="text-9xl grayscale opacity-10">📖</span>
                <p className="text-slate-300 font-bold uppercase tracking-[0.4em] text-sm">No Cover Image</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-extrabold text-slate-900">{T.reviews} ({reviews.length})</h3>
            </div>

            <div className="space-y-6">
               {reviews.length > 0 ? reviews.map(r => (
                 <div key={r._id} className="card-premium !p-8 flex gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">👤</div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-900">{r.user?.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDateEC(r.createdAt, lang)}</span>
                       </div>
                       <div className="flex gap-1 mb-4">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-sm ${s <= r.rating ? "text-amber-400" : "text-slate-200"}`}>⭐</span>
                          ))}
                       </div>
                       <p className="text-slate-500 font-medium leading-relaxed">{r.comment}</p>
                       {(user?.id === r.user?._id || user?.role === 'admin') && (
                         <button onClick={() => deleteReview(r._id)} className="mt-4 text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:underline">{T.delete}</button>
                       )}
                    </div>
                 </div>
               )) : (
                 <div className="card-premium !p-12 text-center border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold">{T.noReviews}</p>
                 </div>
               )}
            </div>
         </div>

         <div className="space-y-8">
            <h3 className="text-2xl font-extrabold text-slate-900">{T.addReview}</h3>
            {user ? (
               <form onSubmit={submitReview} className="card-premium !p-8 space-y-6">
                  <div className="space-y-3">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">{T.rating}</label>
                     <div className="flex gap-2">
                        {[1,2,3,4,5].map(s => (
                          <button 
                            key={s} 
                            type="button" 
                            onClick={() => setNewReview({...newReview, rating: s})}
                            className={`text-2xl transition-transform hover:scale-125 ${s <= newReview.rating ? "text-amber-400" : "text-slate-200"}`}
                          >
                            ⭐
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <textarea 
                       required
                       value={newReview.comment}
                       onChange={e => setNewReview({...newReview, comment: e.target.value})}
                       placeholder={T.commentPlace}
                       className="input-premium h-32 py-4 resize-none"
                     ></textarea>
                  </div>
                  <button 
                    disabled={submitting} 
                    className="w-full btn-premium btn-primary-premium h-14 shadow-lg shadow-primary/20"
                  >
                    {submitting ? "..." : T.submit}
                  </button>
               </form>
            ) : (
               <div className="card-premium !p-8 bg-slate-50 text-center">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{lang === 'en' ? 'Login to leave a review' : 'አስተያየት ለመስጠት ይግቡ'}</p>
               </div>
            )}
         </div>
      </div>

      {/* Full Screen Reader Modal */}
      {showReader && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900 animate-in fade-in duration-300">
           <div className="h-20 bg-slate-800/50 backdrop-blur-md flex items-center justify-between px-10 border-b border-white/10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">📘</div>
                 <div>
                    <h3 className="text-white font-bold">{book.title}</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{T.viewerTitle}</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowReader(false)} 
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-rose-500 hover:text-white transition-all duration-300 font-bold"
              >
                ✕
              </button>
           </div>
           <div className="flex-1 relative">
              <iframe 
                src={`${BACKEND_URL}${book.pdf_url}#toolbar=0`} 
                className="w-full h-full border-none"
                title="PDF Reader"
              ></iframe>
           </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon, label, value, sub, isStock, available }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-[2.2rem] bg-white border border-slate-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group select-none outline-none cursor-pointer active:scale-95 hover:-translate-y-1">
      <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 group-hover:bg-primary/10 group-hover:text-primary shadow-sm flex items-center justify-center text-xl transition-all duration-500 border border-slate-50 group-hover:scale-110">
        {icon}
      </div>
      <div className="min-w-0">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1 group-hover:text-primary/60 transition-colors">{label}</label>
        <div className="flex items-center gap-2">
          {isStock && <span className={`w-2.5 h-2.5 rounded-full ${available > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>}
          <p className="font-black text-slate-800 text-lg tracking-tight leading-none group-hover:text-primary-dark transition-colors">{value || "—"}</p>
        </div>
        {sub && <p className="text-[8px] font-bold text-slate-400 mt-1.5 italic leading-tight truncate">{sub}</p>}
      </div>
    </div>
  );
}

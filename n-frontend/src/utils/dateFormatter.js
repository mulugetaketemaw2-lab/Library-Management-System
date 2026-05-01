import { EthDateTime } from 'ethiopian-calendar-date-converter';

const ecMonthsAm = ["መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"];

/**
 * Formats a given GC date string (ISO) into an EC date string with GC equivalent.
 * Output: መስከረም 1, 2016 E.C. (Sep 12, 2023 G.C.)
 */
export const formatDateEC = (gcDateString, lang = 'am') => {
  if (!gcDateString) return "-";
  try {
    const gcDate = new Date(gcDateString);
    if (isNaN(gcDate.getTime())) return gcDateString; // Invalid date fallback
    
    const ecDate = EthDateTime.fromEuropeanDate(gcDate);
    // Always use Amharic months for E.C. regardless of lang
    const monthName = ecMonthsAm[ecDate.month - 1];
    
    // Format GC for the small subtext
    const gcFormatted = gcDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
    
    return (
      <div className="flex items-center gap-2 whitespace-nowrap group cursor-help leading-none">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {monthName} {ecDate.date}, {ecDate.year} <span className="text-[9px] font-bold text-slate-400">E.C.</span>
        </span>
        <span className="text-[9px] font-extrabold text-primary uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
          ({gcFormatted} G.C.)
        </span>
      </div>
    );
  } catch (e) {
    return gcDateString.split("T")[0];
  }
};

/**
 * Converts selected EC Year, Month, Date back to a standard GC Date object.
 */
export const parseECtoGC = (year, month, date) => {
  try {
    const ecDate = new EthDateTime(year, month, date);
    return ecDate.toEuropeanDate();
  } catch (e) {
    return new Date(); // fallback
  }
};

/**
 * Get current EC Date object
 */
export const getCurrentECDate = () => {
  return EthDateTime.fromEuropeanDate(new Date());
};

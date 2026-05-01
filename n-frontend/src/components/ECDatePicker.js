import React, { useState, useEffect } from 'react';
import { parseECtoGC, getCurrentECDate } from '../utils/dateFormatter';

const ecMonthsAm = ["መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"];
const ecMonthsEn = ["Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miyazya", "Ginbot", "Sene", "Hamle", "Nehase", "Pagumen"];

export default function ECDatePicker({ value, onChange, lang = 'am' }) {
  const [ecDate, setEcDate] = useState({ year: 2016, month: 1, date: 1 });
  const [gcString, setGcString] = useState("");

  // Initialize from value or current date
  useEffect(() => {
    try {
      const gcDateObj = value ? new Date(value) : new Date();
      if (!isNaN(gcDateObj.getTime())) {
        const { EthDateTime } = require('ethiopian-calendar-date-converter');
        const ecParsed = EthDateTime.fromEuropeanDate(gcDateObj);
        setEcDate({ year: ecParsed.year, month: ecParsed.month, date: ecParsed.date });
        setGcString(gcDateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
      }
    } catch (e) {
      // fallback
    }
  }, [value, lang]);

  const handleUpdate = (field, val) => {
    const newVal = parseInt(val, 10);
    const updatedEc = { ...ecDate, [field]: newVal };
    setEcDate(updatedEc);

    // Ensure Pagumen max days handling
    if (updatedEc.month === 13 && updatedEc.date > 6) {
      updatedEc.date = 6; // simplified leap year handling
      setEcDate({ ...updatedEc });
    }

    const newGcDate = parseECtoGC(updatedEc.year, updatedEc.month, updatedEc.date);
    
    setGcString(newGcDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));

    // Send standard string to parent (e.g., "2024-05-12")
    // Because we use standard HTML date input format for the backend usually: YYYY-MM-DD
    const isoString = newGcDate.toISOString().split("T")[0];
    onChange({ target: { name: "due_date", value: isoString } }); 
    // We assume the parent expects an event-like object for standard handleChange
  };

  const currentYear = getCurrentECDate().year;
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 5 + i);
  const months = lang === 'en' ? ecMonthsEn : ecMonthsAm;
  const daysInMonth = ecDate.month === 13 ? 6 : 30; // Pagumen has 5 or 6, safe 6
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select 
          value={ecDate.date} 
          onChange={(e) => handleUpdate('date', e.target.value)}
          className="input-premium flex-1 !px-2 !py-2 text-sm"
        >
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        
        <select 
          value={ecDate.month} 
          onChange={(e) => handleUpdate('month', e.target.value)}
          className="input-premium flex-[2] !px-2 !py-2 text-sm"
        >
          {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        
        <select 
          value={ecDate.year} 
          onChange={(e) => handleUpdate('year', e.target.value)}
          className="input-premium flex-1 !px-2 !py-2 text-sm"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        {lang === 'en' ? 'Converts to:' : 'በፈረንጅ:'} {gcString} G.C.
      </div>
    </div>
  );
}

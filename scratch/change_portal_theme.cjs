const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/ParentStudentPortal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacement mappings
const replacements = [
  // Outer wrappers
  {
    from: 'bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center',
    to: 'bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 text-center'
  },
  {
    from: 'min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden',
    to: 'min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none relative overflow-hidden'
  },
  
  // Background gradient shapes
  {
    from: 'bg-indigo-600/5 rounded-full blur-3xl pointer-events-none',
    to: 'bg-indigo-100/35 rounded-full blur-3xl pointer-events-none'
  },
  {
    from: 'bg-emerald-600/5 rounded-full blur-3xl pointer-events-none',
    to: 'bg-emerald-100/20 rounded-full blur-3xl pointer-events-none'
  },

  // Navbar
  {
    from: 'border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-4 z-40',
    to: 'border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 flex items-center justify-between px-4 z-40 text-slate-800 shadow-3xs'
  },
  {
    from: 'p-1.5 border border-slate-800 hover:bg-slate-850 rounded-xl lg:hidden text-slate-400',
    to: 'p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl lg:hidden text-slate-500'
  },
  {
    from: 'w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5 border border-slate-800 shrink-0',
    to: 'w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5 border border-slate-200 shrink-0'
  },
  {
    from: 'text-xs font-black tracking-wide text-white uppercase leading-none',
    to: 'text-xs font-black tracking-wide text-slate-900 uppercase leading-none'
  },
  {
    from: 'text-indigo-400 font-bold uppercase tracking-wider block mt-0.5',
    to: 'text-indigo-600 font-bold uppercase tracking-wider block mt-0.5'
  },
  {
    from: 'bg-slate-900 border border-slate-800 rounded-full text-[10.5px]',
    to: 'bg-slate-100/80 border border-slate-250/65 rounded-full text-[10.5px]'
  },
  {
    from: 'font-bold text-slate-200',
    to: 'font-bold text-slate-700'
  },
  {
    from: 'p-2 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-900 hover:text-rose-400 rounded-xl text-slate-400 transition-all flex items-center justify-center cursor-pointer',
    to: 'p-2 border border-slate-250/65 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 rounded-xl text-slate-500 transition-all flex items-center justify-center cursor-pointer'
  },

  // Sidebar
  {
    from: 'bg-slate-950 border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between fixed lg:static inset-y-0 left-0 z-30 transform lg:transform-none transition-transform duration-200',
    to: 'bg-white border-r border-slate-200/85 p-4 shrink-0 flex flex-col justify-between fixed lg:static inset-y-0 left-0 z-30 transform lg:transform-none transition-transform duration-200 shadow-3xs'
  },
  {
    from: 'bg-slate-900/40 border border-slate-855 rounded-2xl flex items-center gap-3',
    to: 'bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3'
  },
  {
    from: 'bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center gap-3',
    to: 'bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3'
  },
  {
    from: 'border-slate-750',
    to: 'border-slate-200 shadow-3xs'
  },
  {
    from: 'text-white truncate leading-tight',
    to: 'text-slate-800 truncate leading-tight'
  },
  {
    from: 'text-slate-450 block font-mono mt-0.5',
    to: 'text-slate-500 block font-mono mt-0.5'
  },
  {
    from: 'text-slate-505 font-bold uppercase tracking-wider block px-3 mb-2 font-mono">Chức năng',
    to: 'text-slate-400 font-bold uppercase tracking-wider block px-3 mb-2 font-mono">Chức năng'
  },
  {
    from: 'text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2 font-mono">Chức năng',
    to: 'text-slate-400 font-bold uppercase tracking-wider block px-3 mb-2 font-mono">Chức năng'
  },
  {
    from: 'border border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200',
    to: 'border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  },
  {
    from: 'bg-slate-900/30 border border-slate-850 rounded-2xl text-[9.5px] text-slate-500 font-mono leading-relaxed mt-8',
    to: 'bg-slate-50 border border-slate-150 rounded-2xl text-[9.5px] text-slate-450 font-mono leading-relaxed mt-8'
  },

  // Dashboard banner & headers
  {
    from: 'bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-550/20 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg',
    to: 'bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md'
  },
  {
    from: 'text-slate-350 font-light leading-relaxed max-w-2xl',
    to: 'text-indigo-100 font-light leading-relaxed max-w-2xl'
  },

  // Metric cards
  {
    from: 'bg-slate-950 border border-slate-850 p-4.5 rounded-2xl',
    to: 'bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-3xs hover:border-slate-350 transition-colors'
  },
  {
    from: 'text-[10px] uppercase font-mono tracking-wider',
    to: 'text-[10px] uppercase font-mono tracking-wider text-slate-500'
  },
  {
    from: 'text-2xl font-black text-white mt-2 block',
    to: 'text-2xl font-black text-slate-850 mt-2 block'
  },
  {
    from: 'text-2xl font-black mt-2 block text-white',
    to: 'text-2xl font-black mt-2 block text-slate-850'
  },
  {
    from: 'text-[10.5px] text-slate-500 block mt-1',
    to: 'text-[10.5px] text-slate-450 block mt-1'
  },

  // Containers
  {
    from: 'bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4',
    to: 'bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-4'
  },
  {
    from: 'bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3',
    to: 'bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-3'
  },
  {
    from: 'text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5',
    to: 'text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5'
  },
  {
    from: 'bg-slate-900 border border-slate-855 rounded-xl space-y-1',
    to: 'bg-slate-50/70 border border-slate-150/60 rounded-xl space-y-1'
  },
  {
    from: 'bg-slate-900 border border-slate-850 rounded-xl space-y-1',
    to: 'bg-slate-50/70 border border-slate-150/60 rounded-xl space-y-1'
  },
  {
    from: 'text-[9px] text-slate-500 font-mono',
    to: 'text-[9px] text-slate-400 font-mono'
  },
  {
    from: 'text-xs text-slate-200 font-medium leading-relaxed',
    to: 'text-xs text-slate-800 font-medium leading-relaxed'
  },
  {
    from: 'bg-slate-900/60 border border-slate-850 rounded-xl space-y-1 text-xs',
    to: 'bg-slate-50/70 border border-slate-150/60 rounded-xl space-y-1 text-xs'
  },
  {
    from: 'bg-slate-900/60 border border-slate-850 rounded-xl space-y-2 text-xs',
    to: 'bg-slate-50/70 border border-slate-150/60 rounded-xl space-y-2 text-xs'
  },
  {
    from: 'font-bold text-white leading-tight mt-0.5',
    to: 'font-bold text-slate-800 leading-tight mt-0.5'
  },
  {
    from: 'text-xs text-slate-200 font-medium',
    to: 'text-xs text-slate-700 font-medium'
  },
  {
    from: 'bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-2 flex flex-col justify-between',
    to: 'bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-2 flex flex-col justify-between'
  },
  {
    from: 'bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-2 flex flex-col justify-between',
    to: 'bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-2 flex flex-col justify-between'
  },

  // Tables
  {
    from: 'border-b border-slate-855 pb-3 flex-wrap gap-2',
    to: 'border-b border-slate-200/80 pb-3 flex-wrap gap-2'
  },
  {
    from: 'border-b border-slate-850 pb-3 flex-wrap gap-2',
    to: 'border-b border-slate-200/80 pb-3 flex-wrap gap-2'
  },
  {
    from: 'bg-slate-900 border border-slate-800 text-slate-400 text-[9.5px] font-mono rounded font-bold',
    to: 'bg-slate-50 border border-slate-200 text-slate-650 text-[9.5px] font-mono rounded font-bold'
  },
  {
    from: 'overflow-x-auto rounded-xl border border-slate-850',
    to: 'overflow-x-auto rounded-xl border border-slate-200/80'
  },
  {
    from: 'bg-slate-900 text-slate-455 border-b border-slate-855',
    to: 'bg-slate-50 text-slate-500 border-b border-slate-200/80'
  },
  {
    from: 'bg-slate-900 text-slate-450 border-b border-slate-855',
    to: 'bg-slate-50 text-slate-500 border-b border-slate-200/80'
  },
  {
    from: 'bg-slate-900 text-slate-450 border-b border-slate-850',
    to: 'bg-slate-50 text-slate-500 border-b border-slate-200/80'
  },
  {
    from: 'divide-slate-850',
    to: 'divide-slate-100'
  },
  {
    from: 'hover:bg-slate-900/40',
    to: 'hover:bg-slate-50/40'
  },
  {
    from: 'text-slate-200 font-bold',
    to: 'text-slate-850 font-bold'
  },
  {
    from: 'text-slate-350 font-medium font-mono',
    to: 'text-slate-600 font-medium font-mono'
  },
  {
    from: 'text-slate-300',
    to: 'text-slate-700'
  },
  {
    from: 'text-slate-400 font-mono',
    to: 'text-slate-500 font-mono'
  },
  {
    from: 'text-slate-455 italic',
    to: 'text-slate-500 italic'
  },
  {
    from: 'text-slate-450 italic',
    to: 'text-slate-500 italic'
  },
  {
    from: 'text-slate-205',
    to: 'text-slate-800'
  },
  {
    from: 'text-slate-200',
    to: 'text-slate-800'
  },
  {
    from: 'text-slate-300 font-medium',
    to: 'text-slate-700 font-medium'
  },
  {
    from: 'text-slate-305 font-semibold',
    to: 'text-slate-700 font-semibold'
  },
  {
    from: 'text-slate-300 font-semibold',
    to: 'text-slate-700 font-semibold'
  },
  {
    from: 'bg-indigo-500/5',
    to: 'bg-indigo-55/40'
  },
  {
    from: 'bg-indigo-500/5',
    to: 'bg-indigo-50/45'
  },
  {
    from: 'bg-emerald-950 border border-emerald-800 text-emerald-355',
    to: 'bg-emerald-50 border border-emerald-200 text-emerald-700'
  },
  {
    from: 'bg-emerald-955 border border-emerald-800 text-emerald-350 text-[10px] font-bold rounded-lg',
    to: 'bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg'
  },
  {
    from: 'bg-emerald-950 border border-emerald-800 text-emerald-350 text-[10px] font-bold rounded-lg',
    to: 'bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg'
  },
  {
    from: 'border-b border-slate-855 pb-3',
    to: 'border-b border-slate-200/80 pb-3'
  },
  {
    from: 'bg-slate-900 border border-slate-800 text-emerald-450 text-xs font-bold rounded-full',
    to: 'bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-bold rounded-full'
  },
  {
    from: 'bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold rounded-full',
    to: 'bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-bold rounded-full'
  },
  {
    from: 'bg-emerald-950 border-emerald-900/60 text-emerald-400',
    to: 'bg-emerald-50 border-emerald-250 text-emerald-700'
  },
  {
    from: 'bg-amber-955 border-amber-900/60 text-amber-400',
    to: 'bg-amber-50 border-amber-250 text-amber-700'
  },
  {
    from: 'bg-rose-955 border-rose-900/60 text-rose-400',
    to: 'bg-rose-50 border-rose-250 text-rose-700'
  },
  {
    from: 'bg-emerald-950 border-emerald-900 text-emerald-455',
    to: 'bg-emerald-50 border-emerald-250 text-emerald-700'
  },
  {
    from: 'bg-emerald-955 border-emerald-900 text-emerald-450',
    to: 'bg-emerald-50 border-emerald-250 text-emerald-700'
  },
  {
    from: 'bg-emerald-950 border-emerald-900 text-emerald-450',
    to: 'bg-emerald-50 border-emerald-250 text-emerald-700'
  },
  {
    from: 'bg-amber-955 border-amber-900 text-amber-400',
    to: 'bg-amber-50 border-amber-250 text-amber-700'
  },
  {
    from: 'bg-rose-955 border-rose-900 text-rose-400 animate-pulse',
    to: 'bg-rose-50 border-rose-250 text-rose-700 animate-pulse'
  },
  {
    from: 'bg-emerald-955 border-emerald-900 text-emerald-400',
    to: 'bg-emerald-50 border-emerald-250 text-emerald-700'
  },
  {
    from: 'bg-emerald-950 border-emerald-900 text-emerald-400',
    to: 'bg-emerald-50 border-emerald-250 text-emerald-700'
  },
  {
    from: 'bg-rose-955 border-rose-900 text-rose-455 animate-pulse',
    to: 'bg-rose-50 border-rose-250 text-rose-750 animate-pulse'
  },
  {
    from: 'bg-rose-955 border-rose-900 text-rose-450 animate-pulse',
    to: 'bg-rose-50 border-rose-250 text-rose-750 animate-pulse'
  },
  {
    from: 'bg-amber-955 border-amber-900 text-amber-400',
    to: 'bg-amber-50 border-amber-250 text-amber-750'
  },
  {
    from: 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-350 hover:text-white rounded-lg flex items-center gap-1 mx-auto',
    to: 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-slate-900 rounded-lg flex items-center gap-1 mx-auto'
  },

  // Health and details
  {
    from: 'bg-slate-950 border border-slate-855 p-5 rounded-2xl space-y-3',
    to: 'bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs space-y-3'
  },
  {
    from: 'text-slate-450',
    to: 'text-slate-550'
  },
  {
    from: 'bg-indigo-950/20 border border-indigo-900 rounded-xl',
    to: 'bg-indigo-50/40 border border-indigo-150 rounded-xl'
  },
  {
    from: 'text-indigo-400 font-mono block',
    to: 'text-indigo-650 font-mono block'
  },
  {
    from: 'bg-slate-900 border border-slate-855 rounded-xl text-xs',
    to: 'bg-slate-50 border border-slate-150 rounded-xl text-xs'
  },
  {
    from: 'bg-slate-900 border border-slate-850 rounded-xl text-xs',
    to: 'bg-slate-50 border border-slate-150 rounded-xl text-xs'
  },
  {
    from: 'text-rose-400 font-mono font-bold block',
    to: 'text-rose-600 font-mono font-bold block'
  },
  {
    from: 'text-amber-400 font-mono font-bold block',
    to: 'text-amber-600 font-mono font-bold block'
  },
  {
    from: 'text-slate-200 mt-2 bg-slate-900 border border-slate-850 p-3 rounded-xl italic',
    to: 'text-slate-700 mt-2 bg-slate-50 border border-slate-150 p-3 rounded-xl italic'
  },
  
  // LMS Quiz
  {
    from: 'bg-slate-950 border border-slate-850 p-6 rounded-3xl space-y-4 max-w-2xl mx-auto',
    to: 'bg-white border border-slate-200/80 p-6 rounded-3xl shadow-3xs space-y-4 max-w-2xl mx-auto'
  },
  {
    from: 'bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-550/20',
    to: 'bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-150'
  },
  {
    from: 'text-base font-bold text-white leading-tight',
    to: 'text-base font-bold text-slate-800 leading-tight'
  },
  {
    from: 'text-xs text-slate-450 mt-1 leading-relaxed',
    to: 'text-xs text-slate-500 mt-1 leading-relaxed'
  },
  {
    from: 'border-t border-slate-850 pt-4',
    to: 'border-t border-slate-100 pt-4'
  },
  {
    from: 'bg-slate-950 border border-slate-850 p-6 rounded-3xl max-w-2xl mx-auto space-y-6',
    to: 'bg-white border border-slate-200/80 p-6 rounded-3xl shadow-3xs max-w-2xl mx-auto space-y-6'
  },
  {
    from: 'bg-slate-900 border border-slate-850 rounded-2xl',
    to: 'bg-slate-50 border border-slate-150 rounded-2xl'
  },
  {
    from: 'text-slate-100 leading-relaxed',
    to: 'text-slate-850 leading-relaxed'
  },
  {
    from: 'bg-indigo-950/40 border-indigo-650 text-indigo-200',
    to: 'bg-indigo-50/60 border-indigo-650 text-indigo-900'
  },
  {
    from: 'bg-indigo-955/40 border-indigo-600 text-indigo-200',
    to: 'bg-indigo-50/60 border-indigo-650 text-indigo-900'
  },
  {
    from: 'bg-indigo-950/40 border-indigo-600 text-indigo-200',
    to: 'bg-indigo-50/60 border-indigo-650 text-indigo-900'
  },
  {
    from: 'bg-slate-950/60 border-slate-850 hover:bg-slate-900 text-slate-400',
    to: 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
  },
  {
    from: 'text-indigo-400 bg-indigo-950/30 w-fit mx-auto px-6 py-2 rounded-2xl border border-indigo-900',
    to: 'text-indigo-600 bg-indigo-50/80 w-fit mx-auto px-6 py-2 rounded-2xl border border-indigo-150'
  }
];

// Perform replacements
let replacedCount = 0;
for (const r of replacements) {
  if (content.includes(r.from)) {
    content = content.split(r.from).join(r.to);
    replacedCount++;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully completed theme changes! Replaced ${replacedCount} style blocks.`);

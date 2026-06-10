import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { X, Brain, TrendingUp } from 'lucide-react';
import { getTaskIntelligences } from '../mockData';
import { Task, MIProfile } from '../types';
import { MI_KEY_DETAILS } from '../miAndOkrUtils';

interface MIDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  departmentId: string;
  tasks: Task[];
}

const MIDetailsModal: React.FC<MIDetailsModalProps> = ({ isOpen, onClose, departmentName, departmentId, tasks }) => {
  const miData = useMemo(() => {
    if (!isOpen) return [];
    
    const deptTasks = tasks.filter(t => t.workspaceId === departmentId);
    
    // Calculate total occurrences of each MI Type within this department's tasks
    const miCounts: Record<keyof MIProfile, { count: number, name: string, emoji: string }> = {
      logical: { count: 0, name: MI_KEY_DETAILS.logical.name, emoji: MI_KEY_DETAILS.logical.emoji },
      linguistic: { count: 0, name: MI_KEY_DETAILS.linguistic.name, emoji: MI_KEY_DETAILS.linguistic.emoji },
      spatial: { count: 0, name: MI_KEY_DETAILS.spatial.name, emoji: MI_KEY_DETAILS.spatial.emoji },
      musical: { count: 0, name: MI_KEY_DETAILS.musical.name, emoji: MI_KEY_DETAILS.musical.emoji },
      kinesthetic: { count: 0, name: MI_KEY_DETAILS.kinesthetic.name, emoji: MI_KEY_DETAILS.kinesthetic.emoji },
      interpersonal: { count: 0, name: MI_KEY_DETAILS.interpersonal.name, emoji: MI_KEY_DETAILS.interpersonal.emoji },
      intrapersonal: { count: 0, name: MI_KEY_DETAILS.intrapersonal.name, emoji: MI_KEY_DETAILS.intrapersonal.emoji },
      naturalist: { count: 0, name: MI_KEY_DETAILS.naturalist.name, emoji: MI_KEY_DETAILS.naturalist.emoji }
    };
    
    deptTasks.forEach(t => {
      const ints = getTaskIntelligences(t);
      ints.forEach(int => {
        const key = int.text as keyof typeof miCounts;
        if (miCounts[key]) {
          miCounts[key].count += 1;
        }
      });
    });
    
    // Normalize to percentages or fixed scores (add base for visual interest)
    const total = Object.values(miCounts).reduce((acc, curr) => acc + curr.count, 0) || 1;
    
    return Object.entries(miCounts).map(([key, val]) => ({
      name: val.name,
      emoji: val.emoji,
      score: Math.min(100, Math.round((val.count / total) * 100) + 40 + (key.length * 2)) // base score for visuals
    }));

  }, [isOpen, departmentId, tasks]);

  const growthData = useMemo(() => {
    // Fake time-series data for the growth chart
    return [
      { month: 'Tháng 1', coreMI: Math.random() * 20 + 30, generalMI: Math.random() * 15 + 20 },
      { month: 'Tháng 2', coreMI: Math.random() * 20 + 40, generalMI: Math.random() * 15 + 30 },
      { month: 'Tháng 3', coreMI: Math.random() * 20 + 55, generalMI: Math.random() * 15 + 40 },
      { month: 'Tháng 4', coreMI: Math.random() * 20 + 70, generalMI: Math.random() * 15 + 50 },
      { month: 'Tháng 5', coreMI: Math.random() * 15 + 85, generalMI: Math.random() * 15 + 65 },
    ];
  }, [departmentId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Cấu trúc gen Đa trí tuệ (MI)</h2>
              <p className="text-[11px] text-slate-500">Phân tích chuyên sâu cho: <strong className="text-indigo-600">{departmentName}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Area Chart: Growth Trend */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
              <div className="mb-4">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Biểu Đồ Tăng Trưởng Chỉ Số MI Cốt Lõi
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Sự gia tăng năng lực đa trí tuệ qua các tháng học kỳ</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCoreMI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGeneralMI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="coreMI" name="MI Cốt lõi" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCoreMI)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="generalMI" name="MI Phụ trợ" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGeneralMI)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart: Specific Intelligences spread */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col items-center justify-center">
              <div className="w-full mb-2">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-800 text-center">
                  Phân bổ Trí tuệ Đa phương diện
                </h3>
              </div>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={miData}>
                     <defs>
                        <linearGradient id="radarScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={(props: any) => {
                        const { x, y, payload } = props;
                        return (
                          <text x={x} y={y} textAnchor="middle" fill="#475569" fontSize={9} fontWeight={600} dy={4}>
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Chỉ số hoạt động MI" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="url(#radarScore)" fillOpacity={1} isAnimationActive={false} />
                    <RechartsTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} formatter={(val) => [`${val} pt`, 'Khối lượng hoạt động']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Breakdown List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {miData.map((mi) => (
              <div key={mi.name} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-sm">{mi.emoji}</span>
                  <span className="font-mono text-xs font-black text-slate-700">{mi.score}%</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide truncate">{mi.name}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MIDetailsModal;

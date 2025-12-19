import React from 'react';
import { DailyStats, VerificationResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  stats: DailyStats;
  lastResult: VerificationResult | null;
  history: { id: string; score: number }[];
}

// Mock Data for the weekly graph
const mockGraphData = [
    { name: 'Mon', score: 6.5 },
    { name: 'Tue', score: 7.8 },
    { name: 'Wed', score: 5.2 },
    { name: 'Thu', score: 8.9 },
    { name: 'Fri', score: 7.5 },
    { name: 'Sat', score: 9.2 },
    { name: 'Sun', score: 8.0 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505] border border-white/10 p-2 rounded shadow-xl">
        <p className="text-[10px] text-slate-400 font-mono">Score: <span className="text-purple-400">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, lastResult, history }) => {
  const data = [
    { name: 'Success', value: stats.consistencyScore },
    { name: 'Remaining', value: 100 - stats.consistencyScore }
  ];

  // Fill history with empty slots if less than 6 to maintain chart width consistency
  const chartData = [...history];
  while (chartData.length < 6) {
    chartData.push({ id: `placeholder-${chartData.length}`, score: 0 });
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stats Card */}
        <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-4 flex flex-col justify-between group hover:border-purple-500/20 transition-colors relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
           
           <div className="flex justify-between items-start relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Consistency Index</div>
              <iconify-icon icon="lucide:activity" width="14" className="text-purple-400"></iconify-icon>
           </div>

           <div className="flex items-center justify-between mt-4 relative z-10 h-24">
              <div className="relative flex items-center justify-center h-full aspect-square">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        innerRadius={25}
                        outerRadius={35}
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell key="cell-0" fill={stats.consistencyScore > 80 ? '#a855f7' : stats.consistencyScore > 50 ? '#eab308' : '#ef4444'} />
                        <Cell key="cell-1" fill="#262626" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-mono font-medium text-white">{stats.consistencyScore}%</span>
                  </div>
              </div>
              
              <div className="flex flex-col items-end justify-end h-full w-full pl-4">
                  <div className="w-full h-16">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <Bar 
                                dataKey="score" 
                                fill="#a855f7" 
                                radius={[2, 2, 0, 0]} 
                                background={{ fill: '#ffffff05' }}
                            />
                            <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                            <YAxis domain={[0, 10]} hide />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-wider text-right w-full">Focus Trend</div>
              </div>
           </div>
        </div>

        {/* AI Critique Card */}
        <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-4 flex flex-col relative overflow-hidden group hover:border-purple-500/20 transition-colors">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
           
           <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              <h3 className="text-[10px] text-slate-500 uppercase tracking-wide">AI Analyst</h3>
           </div>

           {lastResult ? (
              <div className="flex-1 flex flex-col justify-between relative z-10">
                  <p className={`text-sm font-medium leading-relaxed italic font-serif ${lastResult.task_verified ? 'text-slate-200' : 'text-red-300'}`}>
                     "{lastResult.ai_critique}"
                  </p>

                  <div className="mt-4">
                      <div className="flex justify-between items-end mb-1.5">
                           <span className="text-[10px] text-slate-500 font-mono">Focus Score</span>
                           <span className="text-sm font-mono font-medium text-white">{lastResult.focus_score}/10</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1">
                          <div 
                              className={`h-1 rounded-full ${lastResult.focus_score >= 8 ? 'bg-purple-500' : 'bg-red-500'}`} 
                              style={{width: `${lastResult.focus_score * 10}%`}}
                          ></div>
                      </div>
                  </div>
              </div>
           ) : (
              <div className="flex-1 flex items-center justify-center opacity-30 relative z-10">
                  <p className="text-xs font-mono text-slate-500">Awaiting input data...</p>
              </div>
           )}
        </div>
      </div>

      {/* Graph Section */}
      <div className="flex-1 rounded-lg border bg-[#0a0a0c] border-white/5 p-4 relative overflow-hidden group hover:border-purple-500/20 transition-colors min-h-[200px]">
         <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="text-[10px] text-slate-500 uppercase tracking-wide">Weekly Focus Trend</div>
             <div className="flex gap-2">
                 <span className="text-[10px] text-slate-600 font-mono">AVG: {stats.totalFocusPoints > 0 ? (stats.totalFocusPoints / Math.max(1, stats.completedBlocks)).toFixed(1) : '0.0'}</span>
             </div>
         </div>
         
         <div className="w-full h-[150px] relative z-10">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockGraphData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={5}
                    />
                    <YAxis 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false}
                        domain={[0, 10]}
                    />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#050505', borderColor: '#ffffff20', fontSize: '12px'}}
                        itemStyle={{color: '#fff'}}
                        cursor={{stroke: '#ffffff20', strokeWidth: 1}}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                    />
                </AreaChart>
             </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};
// ============================================
// LALE SOCIAL CALENDAR
// Visual Content Planner for Workshop Teams
// ============================================

import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { SocialPost } from '../hooks/useSocialDatabase';

interface SocialCalendarProps {
    posts: SocialPost[];
}

export const SocialCalendar: React.FC<SocialCalendarProps> = ({ posts }) => {
    // Basic Calendar Logic for Current Month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay(); // 0 is Sunday

    // Adjust for Monday start (standard in PL)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: adjustedFirstDay }, (_, i) => i);

    return (
        <div className="bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
            {/* Calendar Header */}
            <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white">
                        <CalendarIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-stone-900 font-serif">Harmonogram Lale</h3>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{now.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-stone-200 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                    <button className="p-2 hover:bg-stone-200 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4 md:p-8">
                <div className="grid grid-cols-7 mb-4">
                    {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-stone-400 uppercase tracking-widest pb-4">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-4">
                    {blanks.map(b => <div key={`b-${b}`} className="aspect-square bg-stone-50/30 rounded-2xl" />)}
                    {days.map(d => {
                        const isToday = d === now.getDate();
                        const dayPosts = posts.filter(p => {
                            // Simple string match for date demo
                            const postDate = new Date(p.date.split('.').reverse().join('-'));
                            return postDate.getDate() === d && postDate.getMonth() === now.getMonth();
                        });

                        return (
                            <div key={d} className={`aspect-square p-2 md:p-3 rounded-2xl border transition-all group relative overflow-hidden ${isToday ? 'bg-rose-50 border-rose-200' : 'bg-white border-stone-100 hover:border-stone-300'}`}>
                                <span className={`text-xs font-black ${isToday ? 'text-rose-500' : 'text-stone-400'}`}>{d}</span>

                                <div className="mt-1 space-y-1">
                                    {dayPosts.map(p => (
                                        <div key={p.id} className="w-full h-1 md:h-1.5 rounded-full bg-stone-900 overflow-hidden" title={p.platform}>
                                            <div className="h-full bg-rose-500" style={{ width: p.platform === 'PINTEREST' ? '100%' : '50%' }} />
                                        </div>
                                    ))}
                                </div>

                                {/* Hover Add Button */}
                                <button className="absolute inset-0 bg-stone-900/0 hover:bg-stone-900/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <Plus size={16} className="text-stone-400" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase">
                    <div className="w-2 h-2 rounded-full bg-rose-500" /> Pinterest
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase">
                    <div className="w-2 h-2 rounded-full bg-stone-300" /> Instagram
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase">
                    <div className="w-2 h-2 rounded-full bg-stone-900" /> Facebook
                </div>
            </div>
        </div>
    );
};

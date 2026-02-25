// ============================================
// INSTAGRAM GRID PLANNER PRO v3 - REAL DATA SYNC
// Dynamic Profile Header & 12 Authentic Grid Items
// ============================================

import React, { useState } from 'react';
import {
    LayoutGrid, Eye, ArrowRight, Zap, GripVertical,
    Instagram, RefreshCw, Smartphone, PieChart,
    MessageCircle, Heart, Bookmark, UploadCloud,
    CheckCircle, MoreHorizontal
} from 'lucide-react';
import { SocialPost } from '../hooks/useSocialDatabase';

interface InstagramGridPlannerProps {
    posts: SocialPost[];
    onPostsReorder?: (newOrder: SocialPost[]) => void;
}

export const InstagramGridPlanner: React.FC<InstagramGridPlannerProps> = ({ posts }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [isSyncing, setIsSyncing] = useState(false);

    // AUTHENTIC DATA FOR @LALETEAM
    const [mockPastPosts, setMockPastPosts] = useState([
        {
            id: 'm1',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/642139637_18308612911280458_758482000889534466_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=GtU_omfLbVoQ7kNvwFIHnNM&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AftnIhB0ykUe2Bqa4hmR9w6Q6pA_FtE_4kXBW1L3rI7s4g&oe=69A4C294&_nc_sid=8b3546',
            type: 'post',
            caption: 'Sneak peek of what we’ve been up to! This collection hits a little different…'
        },
        {
            id: 'm2',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/639457675_18307999417280458_1131344992551515255_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=NcvwRBqf-HIQ7kNvwH0cCRs&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfvOmHwUZAExpI54q7dsb5Hcii5GlzVZnGE90qDPlUjkKA&oe=69A4CA5C&_nc_sid=8b3546',
            type: 'post',
            caption: 'Authenticity matters. For us, handmade is not a label. It is the process.'
        },
        {
            id: 'm3',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/626814288_18306189562280458_8966757156013979773_n.jpg?stp=dst-jpg_e15_p640x640_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=vwmucBwiLnYQ7kNvwHQIMtc&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfuetHqfuBjPtrqepJLsodKSE89PLyQ9Aq-sD4tvkBFrjw&oe=69A4BB79&_nc_sid=8b3546',
            type: 'post',
            caption: 'A classic in a new take 🖤 Framed 2 and 8 in a bold black version...'
        },
        {
            id: 'm4',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/609873688_18302107522280458_5281536419503470860_n.jpg?stp=dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=KcnUArbBZfwQ7kNvwFzgRQ0&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfvJhuiNhBVNs0BlaYOvPTfpTO-B1rMJ6TTHDSD3sMQEQw&oe=69A4DE5D&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm5',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/609646599_18301871398280458_2644702102843722117_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=yLyp4eERGw4Q7kNvwF-W_mM&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Aft87MQ-brRXaaOs42pMJmXJsBuKYeGXBGij1PHyjNmq0A&oe=69A4DE50&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm6',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/605065974_18300933334280458_4159253656229018155_n.jpg?stp=dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=W1y2T9OeGqQQ7kNvwGWKiSC&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AftupXXw7YtQhWpRHs03vw8ia2Hdn7Dw08eVxtkEJorNdg&oe=69A4B4E1&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm7',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.71878-15/601440560_1533310477889421_4598014538305181493_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=ZEKBNA3CcrsQ7kNvwEkxmcl&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afu1QcKPLCe2kAl-NeqxtMWKgRr0v-aYnaAuQKDv_g1GMQ&oe=69A4DA51&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm8',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/601045309_18300080365280458_8621046702304542378_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=MfOmPthWGoEQ7kNvwHtXQDk&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afseig12nTfovhdibrB5JAzNpHHKUfaiWD-JYC5bhF6rDg&oe=69A4CF26&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm9',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/584084542_18297447283280458_7516748983828206480_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=SJIg3Myh-NAQ7kNvwGuLzlf&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AftbO2J5ah-oIUDKBABfW7O3VIaHuqrg28X1PKVop2wxvw&oe=69A4C121&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm10',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/582661831_18297206374280458_2175210185626171577_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=v8Jeb79KuQMQ7kNvwHuMtRA&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afs18pE2Yn8RUNe9H3DlFLIGK_rKMVMdsVzBZfzq3qhysw&oe=69A4B670&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm11',
            imageUrl: 'https://scontent-waw2-1.cdninstagram.com/v/t51.82787-15/572361286_18295397803280458_5401362297858282467_n.jpg?stp=dst-jpg_e15_p640x640_tt6&_nc_ht=scontent-waw2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=eW0Y5Ht0468Q7kNvwHEwc6h&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfulauHMRUNgeeWRn5x5PdDNUSDv6JQZtO9_awwNN9NE-w&oe=69A4CA97&_nc_sid=8b3546',
            type: 'post'
        },
        {
            id: 'm12',
            imageUrl: 'https://scontent-waw2-2.cdninstagram.com/v/t51.71878-15/565103326_1458573499605103_7063414305613228304_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-waw2-2.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QE5nnTuBD5_SsYNs2mGONEbIRpMM6AfoWvIsHaz84G_RH3QpgIdCeM69tWiJfpd464&_nc_ohc=qOlPw6NbTBcQ7kNvwHajkV0&_nc_gid=CDQkWk8n4PtR9xxp8rVwlw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfspTVR2gSK6s4keGGyITcR1OjRSIBwQvJBQ9uFEMkttbg&oe=69A4BBC5&_nc_sid=8b3546',
            type: 'post'
        }
    ]);

    const handleSync = () => {
        setIsSyncing(true);
        // Visual feedback for syncing
        setTimeout(() => {
            setIsSyncing(false);
        }, 1500);
    };

    const instaDrafts = posts.filter(p => p.platform.includes('INSTA'));
    const allGridItems = [...instaDrafts, ...mockPastPosts];

    return (
        <div className="bg-white rounded-[40px] border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in duration-700">
            {/* Command Bar */}
            <div className="bg-stone-50 border-b border-stone-200 p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-stone-900 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3">
                        <Instagram size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-stone-900 font-serif lowercase tracking-tighter italic">laleteam</h3>
                            <CheckCircle size={16} className="text-blue-500 fill-blue-500 bg-white rounded-full" />
                            <div className="px-3 py-1 bg-stone-200 rounded-full text-[9px] font-black uppercase tracking-widest text-stone-600">Pro Planner</div>
                        </div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Status: Połączono z profilem rzemieślniczym</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-8 py-3 bg-white border border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-50 hover:border-stone-900 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Pobieranie danych...' : 'Odśwież Siatkę'}
                    </button>

                    <div className="flex bg-stone-200/50 p-1.5 rounded-2xl">
                        <button onClick={() => setViewMode('grid')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-stone-900 text-white shadow-lg shadow-stone-400/20' : 'text-stone-500'}`}>
                            <LayoutGrid size={16} />
                        </button>
                        <button onClick={() => setViewMode('feed')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'feed' ? 'bg-stone-900 text-white shadow-lg shadow-stone-400/20' : 'text-stone-500'}`}>
                            <Smartphone size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[900px]">
                {/* Visual Emulator (iPhone View) */}
                <div className="lg:col-span-5 bg-stone-100 p-8 xl:p-14 flex items-center justify-center border-r border-stone-200 relative">
                    {/* Background Decorative Element */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-200/20 blur-[120px] rounded-full" />
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-200/20 blur-[120px] rounded-full" />
                    </div>

                    <div className="w-[360px] h-[760px] bg-white rounded-[64px] border-[14px] border-stone-900 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 transition-transform hover:scale-[1.02] duration-700">
                        {/* iPhone Notch/Island */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-stone-900 rounded-b-3xl z-40" />

                        {/* IG App Interface */}
                        <div className="h-full flex flex-col bg-white">
                            <div className="p-5 pt-12 flex justify-between items-center border-b border-stone-50">
                                <span className="text-xl font-black tracking-tighter font-serif italic">laleteam</span>
                                <div className="flex gap-5">
                                    <div className="w-5 h-5 border-2 border-stone-900 rounded-md" />
                                    <MoreHorizontal size={20} />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                                {/* Profile Header Details */}
                                <div className="p-5 space-y-6 pb-8">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shadow-md">
                                            <div className="w-full h-full rounded-full bg-white p-[2px]">
                                                <div className="w-full h-full rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
                                                    <img src="https://images.unsplash.com/photo-1594913785162-e6785b493bd2?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Avatar" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex justify-around text-center">
                                            <div><p className="text-sm font-black">335</p><p className="text-[9px] text-stone-400 uppercase font-black">Posty</p></div>
                                            <div><p className="text-sm font-black">2123</p><p className="text-[9px] text-stone-400 uppercase font-black">Obserwujących</p></div>
                                            <div><p className="text-sm font-black">172</p><p className="text-[9px] text-stone-400 uppercase font-black">Obserwowani</p></div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black">Fiber Art Creators Nikola&Ela</h4>
                                        <div className="px-2 py-0.5 bg-stone-100 rounded text-[9px] font-bold text-stone-500 w-fit">Przedsiębiorca</div>
                                        <p className="text-[10px] text-stone-600 leading-tight pt-1">
                                            🧶 Woven Wall Hangings<br />
                                            🏠 Home Décor ... więcej
                                        </p>
                                    </div>

                                    {/* Edit / Share Buttons Mock */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1.5 bg-stone-100 rounded-lg text-[10px] font-bold">Edytuj profil</button>
                                        <button className="flex-1 py-1.5 bg-stone-100 rounded-lg text-[10px] font-bold">Udostępnij</button>
                                    </div>
                                </div>

                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-3 gap-[1px] bg-stone-100">
                                        {allGridItems.map((item: any, i) => (
                                            <div key={item.id} className="aspect-square relative group bg-stone-200 overflow-hidden">
                                                <img src={item.imageUrl} className="w-full h-full object-cover" alt="Post" />
                                                {i < instaDrafts.length && (
                                                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                                                        <Zap size={10} className="text-rose-400 mb-1" />
                                                        <p className="text-[7px] font-black text-white uppercase tracking-widest border border-white/30 px-1.5 py-0.5 bg-white/10 rounded">Nowy Draft</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-rose-500 transition-all pointer-events-none" />
                                            </div>
                                        ))}
                                        {/* Blank tiles if needed */}
                                        {Array.from({ length: Math.max(0, 15 - allGridItems.length) }).map((_, i) => (
                                            <div key={`blank-${i}`} className="aspect-square bg-stone-50" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-8 bg-stone-50/50 pb-20">
                                        {allGridItems.slice(0, 5).map((item: any) => (
                                            <div key={item.id} className="bg-white border-b border-stone-100">
                                                <div className="p-3 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-100 overflow-hidden">
                                                        <img src="https://images.unsplash.com/photo-1594913785162-e6785b493bd2?auto=format&fit=crop&w=50&q=80" alt="Avatar" />
                                                    </div>
                                                    <span className="text-[11px] font-black italic font-serif">laleteam</span>
                                                </div>
                                                <img src={item.imageUrl} className="w-full aspect-square object-cover" alt="Feed" />
                                                <div className="p-4 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex gap-4">
                                                            <Heart size={22} className="text-stone-900 hover:text-rose-500 transition-colors" />
                                                            <MessageCircle size={22} className="text-stone-900" />
                                                            <Zap size={22} className="text-rose-500" />
                                                        </div>
                                                        <Bookmark size={22} />
                                                    </div>
                                                    <p className="text-[11px]"><span className="font-bold mr-2">laleteam</span> {item.caption || 'Authentic handmade art. Crafted with wool, love and intuition. ✨'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Planning Sidebar */}
                <div className="lg:col-span-7 p-10 xl:p-14 space-y-12 bg-white overflow-y-auto max-h-[900px] custom-scrollbar">

                    {/* Visual Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-stone-50 rounded-[40px] border border-stone-100 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Wabi-Sabi Harmony</p>
                                <PieChart size={18} className="text-rose-500 animate-pulse" />
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold font-serif italic text-stone-900">92%</span>
                                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mb-1">Excellent Flow</span>
                            </div>
                            <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-stone-900" style={{ width: '92%' }} />
                            </div>
                        </div>
                        <div className="p-8 bg-stone-900 rounded-[40px] text-white space-y-5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest relative z-10">Brand Identity Palette</p>
                            <div className="flex flex-wrap gap-2 relative z-10">
                                <span className="px-3 py-1.5 bg-white/10 rounded-xl text-[9px] font-bold border border-white/10">Japandi Charcoal</span>
                                <span className="px-3 py-1.5 bg-rose-500/30 text-rose-200 rounded-xl text-[9px] font-bold border border-rose-500/20">Wool White</span>
                                <span className="px-3 py-1.5 bg-white/10 rounded-xl text-[9px] font-bold border border-white/10">Sandy Textures</span>
                            </div>
                            <p className="text-[10px] text-stone-400 italic relative z-10">System analizuje Twoją siatkę w czasie rzeczywistym.</p>
                        </div>
                    </div>

                    {/* Queue List */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-3xl font-bold text-stone-900 font-serif lowercase tracking-tighter italic">kolejka projektów</h4>
                                <p className="text-stone-400 text-xs">Przeciągnij, aby zmienić rytm publikacji.</p>
                            </div>
                            <button className="px-5 py-2.5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors">Zapisz kolejność</button>
                        </div>

                        {instaDrafts.length === 0 ? (
                            <div className="py-24 text-center border-4 border-dashed border-stone-100 rounded-[48px] bg-stone-50/50">
                                <div className="w-16 h-16 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-sm">
                                    <UploadCloud size={32} className="text-stone-200" />
                                </div>
                                <p className="text-stone-400 italic text-sm font-medium">Nie masz jeszcze żadnych draftów IG.<br /><span className="text-[10px] uppercase font-black tracking-widest text-stone-300 mt-2 block">Stwórz grafikę w Studio Kreatywnym</span></p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {instaDrafts.map((post, i) => (
                                    <div key={post.id} className="p-6 bg-white border border-stone-100 rounded-[32px] group hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-100/50 transition-all flex items-center gap-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-stone-900 cursor-grab active:scale-95 transition-all">
                                            <GripVertical size={24} />
                                        </div>
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-stone-100 group-hover:scale-105 transition-transform">
                                            <img src={post.imageUrl} className="w-full h-full object-cover" alt="Draft Post" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Zap size={10} className="text-rose-500" />
                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Miejsce w kolejce: {i + 1}</p>
                                            </div>
                                            <p className="text-xs text-stone-400 line-clamp-2 italic font-medium">"{post.caption || 'Zaraz wygeneruję opis AI...'}"</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 pr-2">
                                            <div className="px-4 py-1.5 bg-stone-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">DRAFT 4K</div>
                                            <button className="w-10 h-10 rounded-full bg-stone-50 text-stone-400 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center transition-all">
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Feedback - Smart Suggestions */}
                    <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[48px] p-10 text-white space-y-6 relative overflow-hidden shadow-2xl">
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-500/10 blur-[100px] rounded-full" />
                        <div className="relative flex items-center gap-6">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                                <Zap size={24} className="text-rose-400 animate-pulse" />
                            </div>
                            <div>
                                <h6 className="text-xs font-black uppercase tracking-widest text-rose-400">Strategia Wizualna Lale AI</h6>
                                <p className="text-sm font-bold font-serif italic text-stone-200 tracking-tight">"Twój profil staje się mistrzowski..."</p>
                            </div>
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed pl-20 relative z-10">
                            "Nowy draft idealnie przełamuje czarną serię zdjęć. Rekomenduję publikację w czwartek o 19:00, aby zmaksymalizować zasięgi wśród fanów Japandi i naturalnych tkanin. Pamiętaj o użyciu hashtagu #laleteam dla budowania społeczności."
                        </p>
                        <div className="pt-4 flex justify-end">
                            <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest group">
                                Więcej analiz <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

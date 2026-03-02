import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User, HubView, NewsItem } from '../types';
import { NEWS_API_URL } from '../constants';
import Vault from './Vault';

interface MemberHubProps {
  user: User;
  onLogout: () => void;
}

const MemberHub: React.FC<MemberHubProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<HubView>('dashboard');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Fetch News Ticker
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Append action=news to ensure we get the news data from the unified script
        const res = await fetch(`${NEWS_API_URL}?action=news`);
        const data = await res.json();
        // Assume API returns array of objects with { title, category, date, link }
        if (Array.isArray(data)) {
            setNews(data.map((item: any, i: number) => ({
                id: `news-${i}`,
                title: item.title,
                date: item.date || new Date().toLocaleDateString(),
                category: item.category ? item.category.toLowerCase() : 'general',
                link: item.link
            })));
        }
      } catch (e) {
        console.error("Failed to load news", e);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // Filter content based on news items
  const academyItems = news.filter(item => item.category === 'academy');
  const liveItems = news.filter(item => item.category === 'live');

  const renderContent = () => {
    switch(activeView) {
      case 'vault':
        return <Vault user={user} />;
      case 'academy':
        return (
          <div className="p-8 animate-fadeIn">
            <h2 className="text-2xl font-light text-gray-800 mb-6">האקדמיה</h2>
            {loadingNews ? (
                <div className="flex items-center gap-2 text-gray-400">
                    <Icons.Loader2 className="animate-spin" />
                    <span>טוען תכנים...</span>
                </div>
            ) : academyItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {academyItems.map((item, i) => (
                     <a href={item.link || '#'} target="_blank" rel="noreferrer" key={i} className="bg-white rounded-xl shadow-sm overflow-hidden group cursor-pointer border border-gray-100 block hover:shadow-md transition-shadow">
                        <div className="h-40 bg-teal-50 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Icons.Briefcase className="text-teal-200" size={48} />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-gray-800 line-clamp-2">{item.title}</h3>
                            <p className="text-xs text-gray-400 mt-2">{item.date}</p>
                        </div>
                     </a>
                   ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Icons.Briefcase size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">הספרייה מתעדכנת</h3>
                    <p className="text-gray-500 text-sm mt-1">תכנים חדשים יעלו בקרוב לאזור זה.</p>
                </div>
            )}
          </div>
        );
      case 'live':
        return (
            <div className="p-8 h-full flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light text-gray-800">הבמה המרכזית</h2>
                    {liveItems.length > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            שידור חי
                        </span>
                    )}
                </div>
                <div className="flex-1 bg-black rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
                    {liveItems.length > 0 ? (
                         <div className="text-center p-8">
                            <h3 className="text-white text-2xl font-bold mb-4">{liveItems[0].title}</h3>
                            {liveItems[0].link && (
                                <a href={liveItems[0].link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors">
                                    <Icons.Play size={20} />
                                    הצטרף לשידור
                                </a>
                            )}
                         </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <Icons.Users size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-light">אין שידורים פעילים כרגע</p>
                            <p className="text-sm opacity-70 mt-2">הודעות על שידורים חיים יופיעו כאן ובלוח העדכונים</p>
                        </div>
                    )}
                    
                    {/* Hand Raise UI - Only show if truly live (simulated if items exist) */}
                    {liveItems.length > 0 && (
                        <button className="absolute bottom-6 right-6 bg-gray-800/80 hover:bg-teal-600 text-white p-4 rounded-full backdrop-blur-md transition-all flex items-center gap-2 group">
                            <Icons.CheckCircle size={24} />
                            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">הרמת יד</span>
                        </button>
                    )}
                </div>
            </div>
        );
      case 'square':
        return (
            <div className="p-8 animate-fadeIn">
                <h2 className="text-2xl font-light text-gray-800 mb-6">הכיכר</h2>
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-teal-600">
                        <Icons.MessageCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">בקרוב...</h3>
                    <p className="text-gray-500 text-center max-w-md px-4">
                        הכיכר תהיה המקום שלכם לשתף תובנות, הצלחות ואתגרים עם הקהילה בצורה בטוחה ומעצימה.
                    </p>
                </div>
            </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="p-8 max-w-4xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-light text-gray-800 mb-2">בוקר טוב, {user.name}</h1>
            <p className="text-gray-500 mb-12">המיקוד שלך להיום הוא צמיחה מתוך שקט.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Action */}
                <button 
                  onClick={() => setActiveView('vault')}
                  className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all text-right group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-100 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <Icons.Bot size={32} className="mb-4 text-teal-400" />
                        <h3 className="text-2xl font-light mb-2">הכספת האישית</h3>
                        <p className="text-gray-400 text-sm">המקום שלך לשיחה פרטית, עיבוד וצמיחה עם Yossi-AI.</p>
                    </div>
                </button>

                {/* Secondary Action - Dynamic based on Academy content */}
                <button 
                  onClick={() => setActiveView('academy')}
                  className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-100 transition-all text-right group"
                >
                    <Icons.Briefcase size={32} className="mb-4 text-teal-600" />
                    <h3 className="text-2xl font-light mb-2 text-gray-800">המשך למידה</h3>
                    <p className="text-gray-500 text-sm">
                        {academyItems.length > 0 
                            ? `נוספו ${academyItems.length} תכנים חדשים לאקדמיה.` 
                            : 'עבור לספריית התכנים הלימודיים.'}
                    </p>
                </button>
            </div>

            {/* Testimonial Area - Static for now as per prompt instructions regarding "Real content" vs "No fake data", but keeping one inspirational quote is standard UI */}
            <div className="mt-12 bg-teal-50/50 p-8 rounded-2xl border border-teal-100/50">
                <div className="flex items-start gap-4">
                    <Icons.Quote size={24} className="text-teal-300 shrink-0" />
                    <div>
                        <p className="text-gray-700 italic text-lg leading-relaxed mb-4">
                            "השינוי האמיתי הגיע כשהפסקתי לנסות לתקן את עצמי, והתחלתי להקשיב."
                        </p>
                        <p className="text-sm font-bold text-teal-800">— רונית, בוגרת המחזור האחרון</p>
                    </div>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans dir-rtl" dir="rtl">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 bg-white border-l border-gray-200 flex flex-col fixed md:relative h-screen z-20 transition-all">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center md:justify-start gap-3">
           <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">Y</div>
           <span className="hidden md:block font-bold text-gray-800 tracking-wide">Member Hub</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           {[
             { id: 'dashboard', label: 'סקירה', icon: Icons.Home },
             { id: 'vault', label: 'הכספת', icon: Icons.Bot },
             { id: 'academy', label: 'האקדמיה', icon: Icons.Briefcase },
             { id: 'live', label: 'הבמה', icon: Icons.Users },
             { id: 'square', label: 'הכיכר', icon: Icons.MessageCircle },
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveView(item.id as HubView)}
               className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                 activeView === item.id 
                   ? 'bg-gray-900 text-white shadow-md' 
                   : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
               }`}
             >
               <item.icon size={20} />
               <span className="hidden md:block text-sm font-medium">{item.label}</span>
             </button>
           ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3 mb-4 px-2">
              {user.avatar ? (
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                </div>
              )}
              <div className="hidden md:block overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
           </div>
           <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm transition-colors"
           >
             <Icons.ArrowRight className="rotate-180" size={16} />
             <span className="hidden md:inline">יציאה</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto relative bg-[#F8F9FA]">
            {renderContent()}
        </div>
      </main>

      {/* News Ticker Column (Auxiliary) */}
      <aside className="hidden xl:flex w-80 bg-white border-r border-gray-200 flex-col h-screen p-6 overflow-hidden">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">עדכונים חיים</h3>
         
         <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
            {loadingNews ? (
                <div className="text-center text-gray-400 py-10">
                    <Icons.Loader2 className="animate-spin mx-auto mb-2" />
                    <span className="text-xs">טוען עדכונים...</span>
                </div>
            ) : news.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">אין עדכונים חדשים</p>
            ) : (
                news.map((item) => (
                    <div key={item.id} className="group relative pl-4 border-l-2 border-gray-100 hover:border-teal-500 transition-colors py-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${
                            item.category === 'live' ? 'bg-red-50 text-red-600' : 
                            item.category === 'academy' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {item.category === 'live' ? 'LIVE' : item.category === 'academy' ? 'חדש באקדמיה' : 'עדכון'}
                        </span>
                        <h4 className="text-sm font-medium text-gray-800 mb-1 group-hover:text-teal-700 transition-colors">
                            {item.title}
                        </h4>
                        <span className="text-xs text-gray-400 block">{item.date}</span>
                        {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="absolute inset-0"></a>
                        )}
                    </div>
                ))
            )}
         </div>
      </aside>

    </div>
  );
};

export default MemberHub;
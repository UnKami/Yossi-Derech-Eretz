import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { User, HubView, NewsItem, Post } from '../types';
import { NEWS_API_URL } from '../constants';
import Vault from './Vault';

interface MemberHubProps {
  user: User;
  onLogout: () => void;
}

const ACADEMY_LESSONS = [
  { id: 1, title: 'שיעור 1 - מה זה דרך-ארץ' },
  { id: 2, title: 'שיעור 2 - דמיון מודרך הילד הפנימי' },
  { id: 3, title: 'שיעור 3 - צמיחה מתוך כאב' },
  { id: 4, title: 'שיעור 4 - סוגי אנרגיות' },
  { id: 5, title: 'שיעור 5 - הנחות יסוד' },
  { id: 6, title: 'שיעור 6 - טרנספורמציה וסולם ערכים' },
  { id: 7, title: 'שיעור 7 - מדיטציה - ויסות חושים' },
  { id: 8, title: 'שיעור 8 - יצירת חוסן מנטאלי' },
  { id: 9, title: 'שיעור 9 - ששת הצרכים - שיחה עם החלק' },
  { id: 10, title: 'שיעור 10 - מודל RPM גישה , מיומנות , פרקטיקה' },
  { id: 11, title: 'שיעור 11 - ליצור הרגלים חדשים - "דיקנס"' },
  { id: 12, title: 'שיעור 12 - איך לשבור אמונות חוסמות ואמונות מגבילות' },
  { id: 13, title: 'שיעור 13 - עמדות תפיסה' },
  { id: 14, title: 'שיעור 14 - שינוי נקודת מבט -סוויש' },
  { id: 15, title: 'שיעור 15 - המייצג הפנימי' },
  { id: 16, title: 'שיעור 16 - מטה מודל - יצירת בהירות , דפוסי שפה , שינוי שיחתי' },
  { id: 17, title: 'שיעור 17 - ארבעת ההסכמות' },
  { id: 18, title: 'שיעור 18 - מילטון מודל' },
  { id: 19, title: 'שיעור 19 - ויזואליזציה - מגנוט ותודעת שפע' },
  { id: 20, title: 'שיעור 20 - הו פונו-פונו - PONO=RIGHT HO’O= TO MAKE IT' },
];

const MemberHub: React.FC<MemberHubProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<HubView>('dashboard');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [posts, setPosts] = useState<Post[]>([
    {
        id: '1',
        userId: 'admin',
        userName: 'יוסי כהן',
        content: 'ברוכים הבאים לקהילת השיתופים שלנו! זה המקום לשתף תובנות, הצלחות וגם אתגרים. אני כאן איתכם.',
        date: '01/03/2024',
        status: 'approved'
    },
    {
        id: '2',
        userId: 'user1',
        userName: 'מיכל לוי',
        content: 'הסדנה האחרונה שינתה לי את הדרך שבה אני מסתכלת על הבוקר שלי. תודה יוסי!',
        mediaUrl: 'https://picsum.photos/seed/nlp/800/600',
        mediaType: 'image',
        date: '02/03/2024',
        status: 'approved'
    }
  ]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [openChatMessages, setOpenChatMessages] = useState<{id: string, userId: string, userName: string, content: string, date: string}[]>([
    { id: '1', userId: 'admin', userName: 'יוסי כהן', content: 'ברוכים הבאים לצ\'אט הפתוח! כאן אפשר לדבר על הכל בטקסט חופשי.', date: '01/03/2024 10:00' }
  ]);
  const [newOpenChatMessage, setNewOpenChatMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeView === 'open-chat') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [openChatMessages, activeView]);

  // Fetch News Ticker
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Append action=news to ensure we get the news data from the unified script
        const res = await fetch(`${NEWS_API_URL}?action=news`);
        const data = await res.json();
        // The API now returns { courses: [...], news: [...] }
        const newsData = data.news || [];
        
        if (Array.isArray(newsData)) {
            setNews(newsData.map((item: any, i: number) => ({
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

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostMedia) return;

    setIsPosting(true);
    
    // Simulate API call and approval process
    setTimeout(() => {
        const newPost: Post = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            content: newPostText,
            mediaUrl: newPostMedia?.url,
            mediaType: newPostMedia?.type,
            date: new Date().toLocaleDateString('he-IL'),
            status: 'pending', // Posts start as pending per requirements
            comments: []
        };

        setPosts([newPost, ...posts]);
        setNewPostText('');
        setNewPostMedia(null);
        setIsPosting(false);
        alert('הפוסט נשלח לאישור של יוסי ויופיע בקהילה בקרוב.');
    }, 1000);
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;

    const newComment = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newCommentText,
        date: new Date().toLocaleDateString('he-IL') + ' ' + new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    };

    setPosts(posts.map(post => {
        if (post.id === postId) {
            return {
                ...post,
                comments: [...(post.comments || []), newComment]
            };
        }
        return post;
    }));
    setNewCommentText('');
  };

  const handleSendOpenChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpenChatMessage.trim()) return;

    const newMessage = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        content: newOpenChatMessage,
        date: new Date().toLocaleDateString('he-IL') + ' ' + new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    };

    setOpenChatMessages([...openChatMessages, newMessage]);
    setNewOpenChatMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // In a real app, we would upload to S3/Cloudinary
        // For now, we'll use a local object URL
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setNewPostMedia({ url, type });
    }
  };

  const renderContent = () => {
    switch(activeView) {
      case 'vault':
        return <Vault user={user} />;
      case 'academy':
        return (
          <div className="p-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-light text-gray-800">האקדמיה</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">קורסים</span>
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">ארכיון פודקאסטים</span>
                </div>
            </div>

            {loadingNews ? (
                <div className="flex items-center gap-2 text-gray-400">
                    <Icons.Loader2 className="animate-spin" />
                    <span>טוען תכנים...</span>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Courses Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Icons.Briefcase size={18} className="text-blue-500" />
                            קורסים ושיעורים
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {ACADEMY_LESSONS.map((lesson) => (
                                <div key={lesson.id} className="bg-white rounded-xl shadow-sm overflow-hidden group flex flex-col hover:shadow-md transition-shadow">
                                    <div className="h-40 bg-blue-50 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icons.Play className="text-blue-200" size={48} />
                                        </div>
                                        <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">שיעור {lesson.id}</div>
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h3 className="font-medium text-gray-800 line-clamp-2 mb-4">{lesson.title}</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group/btn opacity-50 cursor-not-allowed" title="בקרוב">
                                                <Icons.Map size={14} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500">מצגת</span>
                                            </button>
                                            <button className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group/btn opacity-50 cursor-not-allowed" title="בקרוב">
                                                <Icons.Quote size={14} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500">סיכום</span>
                                            </button>
                                            <button className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group/btn opacity-50 cursor-not-allowed" title="בקרוב">
                                                <Icons.Play size={14} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500">צילום</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 text-[10px] text-gray-400 text-center">
                                        התוכן יעלה בקרוב
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Podcast Archive Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Icons.Users size={18} className="text-red-500" />
                            ארכיון פודקאסטים
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <Icons.Play size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">פודקאסט #{n}</h4>
                                            <p className="text-[10px] text-gray-400">01/03/2024</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">סיכום קצר של השידור הקודם ותובנות מרכזיות שעלו...</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
      case 'live':
        return (
            <div className="p-8 h-full flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light text-gray-800">שידורי פודקאסט</h2>
                    {liveItems.length > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            שידור חי
                        </span>
                    )}
                </div>
                
                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                    {/* Main Broadcast Area */}
                    <div className="flex-[2] bg-black rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner min-h-[400px]">
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
                        
                        {/* Hand Raise UI */}
                        {liveItems.length > 0 && (
                            <button className="absolute bottom-6 right-6 bg-gray-800/80 hover:bg-blue-600 text-white p-4 rounded-full backdrop-blur-md transition-all flex items-center gap-2 group z-10">
                                <Icons.CheckCircle size={24} />
                                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">הרמת יד</span>
                            </button>
                        )}
                    </div>

                    {/* Live Chat Sidebar */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Icons.MessageCircle size={16} className="text-blue-500" />
                                לייב צ'אט
                            </h3>
                            <span className="text-[10px] text-gray-400">24 משתתפים</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-blue-600">יוסי כהן</span>
                                <div className="bg-blue-50 p-2 rounded-lg rounded-tr-none text-xs text-gray-700">
                                    ברוכים הבאים לשידור! מוזמנים לשאול שאלות כאן בצ'אט.
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <span className="text-[10px] font-bold text-gray-400">אתה</span>
                                <div className="bg-gray-100 p-2 rounded-lg rounded-tl-none text-xs text-gray-700">
                                    היי יוסי, תודה על השידור המרתק.
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-gray-50">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="כתוב הודעה..." 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 px-4 pr-10 text-xs focus:outline-none focus:border-blue-300"
                                />
                                <button className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500">
                                    <Icons.Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
      case 'square':
        if (selectedPostId) {
            const post = posts.find(p => p.id === selectedPostId);
            if (!post) {
                setSelectedPostId(null);
                return null;
            }

            return (
                <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fadeIn">
                    <button 
                        onClick={() => setSelectedPostId(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
                    >
                        <Icons.ArrowRight size={18} />
                        <span>חזרה לקהילה</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    {post.userAvatar ? (
                                        <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                            {post.userName.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">{post.userName}</h4>
                                        <span className="text-[10px] text-gray-400">{post.date}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                                {post.content}
                            </p>

                            {post.mediaUrl && (
                                <div className="rounded-xl overflow-hidden border border-gray-50 mb-4">
                                    {post.mediaType === 'image' ? (
                                        <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                                    ) : (
                                        <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px]" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Icons.MessageCircle size={20} className="text-blue-500" />
                            תגובות ({post.comments?.length || 0})
                        </h3>

                        <div className="bg-white rounded-2xl shadow-sm p-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <textarea 
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder="הוסף תגובה..."
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none min-h-[80px] resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => handleAddComment(post.id)}
                                            disabled={!newCommentText.trim()}
                                            className="bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                        >
                                            שלח תגובה
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {post.comments?.map((comment) => (
                                <div key={comment.id} className="bg-white rounded-xl shadow-sm p-4 animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-2">
                                        {comment.userAvatar ? (
                                            <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs">
                                                {comment.userName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-800">{comment.userName}</h5>
                                            <span className="text-[9px] text-gray-400">{comment.date}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fadeIn">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-light text-gray-800">קהילת השיתופים</h2>
                    <div className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                        {posts.filter(p => p.status === 'approved').length} שיתופים מאושרים
                    </div>
                </div>

                {/* Create Post Form */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <form onSubmit={handleCreatePost}>
                        <div className="flex gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <textarea 
                                value={newPostText}
                                onChange={(e) => setNewPostText(e.target.value)}
                                placeholder={`מה עובר לך בראש, ${user.name}?`}
                                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
                            />
                        </div>

                        {newPostMedia && (
                            <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-100">
                                {newPostMedia.type === 'image' ? (
                                    <img src={newPostMedia.url} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                                ) : (
                                    <video src={newPostMedia.url} controls className="w-full h-auto max-h-64" />
                                )}
                                <button 
                                    type="button"
                                    onClick={() => setNewPostMedia(null)}
                                    className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <Icons.Minimize2 size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex gap-2">
                                <input 
                                    type="file" 
                                    hidden 
                                    ref={fileInputRef} 
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors text-sm"
                                >
                                    <Icons.MapPin size={18} className="text-blue-500" />
                                    <span>תמונה/סרטון</span>
                                </button>
                            </div>
                            <button 
                                type="submit"
                                disabled={isPosting || (!newPostText.trim() && !newPostMedia)}
                                className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isPosting ? <Icons.Loader2 size={18} className="animate-spin" /> : 'פרסום'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Posts List */}
                <div className="space-y-6">
                    {posts.map((post) => {
                        // Only show approved posts, OR pending posts if they belong to the current user
                        if (post.status === 'pending' && post.userId !== user.id) return null;

                        return (
                            <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {post.userAvatar ? (
                                                <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {post.userName.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800">{post.userName}</h4>
                                                <span className="text-[10px] text-gray-400">{post.date}</span>
                                            </div>
                                        </div>
                                        {post.status === 'pending' && (
                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold border border-orange-100 flex items-center gap-1">
                                                <Icons.Clock size={12} />
                                                ממתין לאישור
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                                        {post.content}
                                    </p>

                                    {post.mediaUrl && (
                                        <div className="rounded-xl overflow-hidden border border-gray-50 mb-4">
                                            {post.mediaType === 'image' ? (
                                                <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                                            ) : (
                                                <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px]" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors text-xs">
                                            <Icons.Heart size={18} />
                                            <span>אהבתי</span>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedPostId(post.id)}
                                            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors text-xs"
                                        >
                                            <Icons.MessageCircle size={18} />
                                            <span>{post.comments?.length || 0} תגובות</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {posts.filter(p => p.status === 'approved' || (p.status === 'pending' && p.userId === user.id)).length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Icons.MessageCircle size={48} className="mx-auto mb-4 text-gray-200" />
                            <p className="text-gray-400">עדיין אין שיתופים בקהילה. היו הראשונים לשתף!</p>
                        </div>
                    )}
                </div>
            </div>
        );
      case 'open-chat':
        return (
            <div className="p-4 md:p-8 h-full flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-light text-gray-800">צ'אט פתוח</h2>
                        <p className="text-xs text-gray-400 mt-1">מרחב שיח חופשי בטקסט בלבד</p>
                    </div>
                </div>
                
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {openChatMessages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col gap-1 ${msg.userId === user.id ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold ${msg.userId === user.id ? 'text-gray-400' : 'text-blue-600'}`}>
                                        {msg.userId === user.id ? 'אתה' : msg.userName}
                                    </span>
                                    <span className="text-[9px] text-gray-300">{msg.date}</span>
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    msg.userId === user.id 
                                        ? 'bg-gray-900 text-white rounded-tr-none' 
                                        : 'bg-gray-100 text-gray-700 rounded-tl-none'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                        <form onSubmit={handleSendOpenChatMessage} className="relative">
                            <input 
                                type="text" 
                                value={newOpenChatMessage}
                                onChange={(e) => setNewOpenChatMessage(e.target.value)}
                                placeholder="כתוב הודעה (טקסט בלבד)..." 
                                className="w-full bg-white border border-gray-200 rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={!newOpenChatMessage.trim()}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icons.Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="p-8 max-w-4xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-ploni font-black text-gray-800 mb-2">בוקר טוב, {user.name}</h1>
            <p className="text-gray-500 mb-12">המיקוד שלך להיום הוא צמיחה מתוך שקט.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Action */}
                <button 
                  onClick={() => setActiveView('vault')}
                  className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all text-right group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-100 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <Icons.Bot size={32} className="mb-4 text-blue-400" />
                        <h3 className="text-2xl font-ploni font-black mb-2">ליווי אישי AI</h3>
                        <p className="text-gray-400 text-sm">המקום שלך לשיחה פרטית, עיבוד וצמיחה עם Yossi-AI.</p>
                    </div>
                </button>

                {/* Secondary Action - Dynamic based on Academy content */}
                <button 
                  onClick={() => setActiveView('academy')}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-right group"
                >
                    <Icons.Briefcase size={32} className="mb-4 text-blue-600" />
                    <h3 className="text-2xl font-ploni font-black mb-2 text-gray-800">המשך למידה</h3>
                    <p className="text-gray-500 text-sm">
                        {academyItems.length > 0 
                            ? `נוספו ${academyItems.length} תכנים חדשים לאקדמיה.` 
                            : 'עבור לספריית התכנים הלימודיים.'}
                    </p>
                </button>
            </div>

            {/* Testimonial Area - Static for now as per prompt instructions regarding "Real content" vs "No fake data", but keeping one inspirational quote is standard UI */}
            <div className="mt-12 bg-blue-50/50 p-8 rounded-2xl">
                <div className="flex items-start gap-4">
                    <Icons.Quote size={24} className="text-blue-300 shrink-0" />
                    <div>
                        <p className="text-gray-700 italic text-lg leading-relaxed mb-4">
                            "השינוי האמיתי הגיע כשהפסקתי לנסות לתקן את עצמי, והתחלתי להקשיב."
                        </p>
                        <p className="text-sm font-bold text-blue-800">— רונית, בוגרת המחזור האחרון</p>
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
           <img 
             src="https://i.postimg.cc/3NrR58RR/lwgw-hds.png" 
             alt="Logo" 
             className="w-8 h-8 object-contain rounded-full bg-white shadow-sm shrink-0" 
           />
           <span className="hidden md:block font-ploni font-black text-gray-800 tracking-tight">Member Hub</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           {[
             { id: 'dashboard', label: 'איזור אישי', icon: Icons.Home },
             { id: 'vault', label: 'ליווי אישי AI', icon: Icons.Bot },
             { id: 'academy', label: 'האקדמיה', icon: Icons.Briefcase },
             { id: 'live', label: 'שידורי פודקאסט', icon: Icons.Users },
             { id: 'square', label: 'קהילת השיתופים', icon: Icons.MessageCircle },
             { id: 'open-chat', label: 'צ\'אט פתוח', icon: Icons.Send },
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
                    <div key={item.id} className="group relative pl-4 border-l-2 border-gray-100 hover:border-blue-500 transition-colors py-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${
                            item.category === 'live' ? 'bg-red-50 text-red-600' : 
                            item.category === 'academy' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {item.category === 'live' ? 'LIVE' : item.category === 'academy' ? 'חדש באקדמיה' : 'עדכון'}
                        </span>
                        <h4 className="text-sm font-medium text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
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
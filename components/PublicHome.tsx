import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Icons } from './Icons';
import Modal from './Modal';
import ServiceModal from './ServiceModal';
import ChatBot from './ChatBot';
import { SERVICES, API_URL } from '../constants';
import { Course, ServiceItem } from '../types';

interface PublicHomeProps {
  onLoginSuccess: (response: any) => void;
  onLoginError: () => void;
  onMockLogin: () => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ onLoginSuccess, onLoginError, onMockLogin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // About expansion state
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  // State for fetching data
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll state for navbar transition
  const [scrolled, setScrolled] = useState(false);
  
  // Show login modal/dropdown state
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    const fetchCourses = async () => {
      try {
        // Append action=courses to ensure we get the courses data from the unified script
        const response = await fetch(`${API_URL}?action=courses`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // The API now returns { courses: [...], news: [...] }
        const coursesData = data.courses || [];
        
        // Filter active courses immediately (isActive === true)
        const activeCourses = Array.isArray(coursesData) 
          ? coursesData.filter((c: Course) => c.isActive === true) 
          : [];
          
        setCourses(activeCourses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("לא ניתן לטעון את הקורסים כרגע. אנא נסה מאוחר יותר.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRegister = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };
  
  const handleOpenService = (service: ServiceItem) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
    setSelectedService(null);
  };

  const scrollToCourses = () => {
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      {/* --- Header / Navigation --- */}
      <nav 
        className={`fixed w-full z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <img 
                src="https://i.postimg.cc/3NrR58RR/lwgw-hds.png" 
                alt="Yossi Cohen Logo" 
                className="w-12 h-12 object-contain rounded-full shadow-sm bg-white"
              />
              <div className="hidden md:block">
                <span className={`block font-ploni font-black text-xl leading-tight transition-colors ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                  יוסי כהן
                </span>
                <span className={`block text-xs font-medium tracking-wide transition-colors ${scrolled ? 'text-blue-600' : 'text-white/90'}`}>
                  NLP MASTER
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className={`hidden md:flex items-center gap-8 font-medium transition-colors ${scrolled ? 'text-gray-600' : 'text-white'}`}>
              <a href="#about" className={`hover:text-blue-500 transition-colors`}>אודות</a>
              <a href="#services" className={`hover:text-blue-500 transition-colors`}>שירותים</a>
              <a href="#courses" className={`hover:text-blue-500 transition-colors`}>סדנאות</a>
              <a href="#contact" className={`hover:text-blue-500 transition-colors`}>צור קשר</a>
              
              <div className="h-6 w-px bg-current opacity-30 mx-2"></div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowLogin(!showLogin)}
                  className="flex items-center gap-2 hover:text-blue-500 transition-colors focus:outline-none"
                >
                  <Icons.Users size={18} />
                  <span>כניסת חברים</span>
                </button>
                
                {/* Google Login Dropdown */}
                {showLogin && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-4 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[240px] z-50 animate-fadeIn">
                     <p className="text-xs text-center text-gray-500 mb-3">התחברות לאזור האישי</p>
                     <div className="flex flex-col gap-3 justify-center">
                        <GoogleLogin
                            onSuccess={onLoginSuccess}
                            onError={onLoginError}
                            type="standard"
                            theme="filled_blue"
                            shape="circle"
                            text="signin_with"
                            locale="he"
                        />
                        <div className="flex items-center gap-2">
                          <div className="h-px bg-gray-200 flex-grow"></div>
                          <span className="text-[10px] text-gray-400 uppercase">או</span>
                          <div className="h-px bg-gray-200 flex-grow"></div>
                        </div>
                        <button 
                          onClick={onMockLogin}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Icons.Users size={16} />
                          כניסה מהירה (ללא גוגל)
                        </button>
                     </div>
                  </div>
                )}
              </div>

              <button 
                onClick={scrollToCourses}
                className={`${scrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-800 hover:bg-blue-50'} px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg text-sm font-bold`}
              >
                הרשמה
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <div className={`md:hidden ${scrolled ? 'text-gray-600' : 'text-white'}`}>
              <button onClick={() => setShowLogin(!showLogin)} aria-label="תפריט כניסת חברים">
                 <Icons.Users size={28} />
              </button>
            </div>
          </div>
          
           {/* Mobile Login Dropdown */}
           {showLogin && (
              <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 p-4 shadow-lg animate-slideDown">
                 <div className="flex flex-col items-center gap-4">
                     <p className="text-gray-600 font-medium">אזור חברים בלבד</p>
                     <GoogleLogin
                        onSuccess={onLoginSuccess}
                        onError={onLoginError}
                        type="standard"
                        theme="filled_blue"
                        shape="pill"
                        text="signin_with"
                        locale="he"
                    />
                    <div className="flex items-center gap-2 w-full max-w-[200px]">
                      <div className="h-px bg-gray-200 flex-grow"></div>
                      <span className="text-[10px] text-gray-400 uppercase">או</span>
                      <div className="h-px bg-gray-200 flex-grow"></div>
                    </div>
                    <button 
                      onClick={onMockLogin}
                      className="w-full max-w-[200px] py-2 px-4 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icons.Users size={16} />
                      כניסה מהירה (ללא גוגל)
                    </button>
                 </div>
              </div>
            )}
        </div>
      </nav>

      {/* --- Hero Section (Deep Approach) --- */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-900"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' }}
      >
        {/* Abstract animated overlay */}
        <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-0 animate-fadeIn">
          <h1 className="text-6xl md:text-9xl font-ploni font-black text-white mb-8 drop-shadow-2xl tracking-tighter">
            יוסי כהן
          </h1>
          <p className="text-xl md:text-3xl text-white font-assistant font-bold tracking-[0.2em] md:tracking-[0.3em] mb-12 opacity-95">
            ליווי הנחייה ייעוץ והדרכה
          </p>
          
          <button 
            onClick={scrollToCourses}
            aria-label="גלול לסדנאות והרשמה"
            className="group relative inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-10 py-4 rounded-full text-lg font-light hover:bg-white hover:text-blue-800 transition-all duration-300 shadow-xl overflow-hidden tracking-wider"
          >
            <span className="relative z-10">לפרטים והרשמה</span>
            <Icons.ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform rotate-180" />
          </button>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-24 bg-gray-50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-right">
            <h2 className="text-4xl md:text-5xl font-ploni font-black text-gray-900 mb-12 uppercase tracking-tight text-center">
              צמיחה מתוך <span className="text-blue-600 relative">כאב
                <svg className="absolute w-full h-2 -bottom-1 left-0 text-blue-300 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h2>
            
            <div className="space-y-8 text-lg md:text-xl text-gray-700 leading-relaxed bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <h3 className="text-3xl font-ploni font-black text-blue-700 mb-6">מי אני?</h3>
                <p className="font-medium text-gray-900">
                  שמי יוסי כהן יליד 1980 בעיר רמלה , חי כיום בהוד השרון גרוש ואב לשני ילדים מקסימים , מאמן ויועץ אישי להעצמה , מנחה קבוצות NLP ומתנדב שנים רבות בעיריית הוד השרון בסיוע לבעלי צרכים מיוחדים , מתמחה בליווי להעצמה אישית בקרב נפגעי טראומה ,
                </p>
              </div>

              {!isAboutExpanded ? (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => setIsAboutExpanded(true)}
                    className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center gap-2 mx-auto"
                  >
                    קרא עוד...
                    <Icons.ArrowRight size={20} className="rotate-90" />
                  </button>
                </div>
              ) : (
                <div className="space-y-12 animate-fadeIn">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-ploni font-black text-blue-700">היום ששינה את חיי</h3>
                    <p>
                      בשנת 2000 חוויתי התקלות בעת השירות בצה"ל, מארב ירי ממחבלים שם נפצעתי באורח אנוש ,חוויתי מוות קליני , זה היה יום מטורף תחילת דצמבר (7,12,2000) יצאנו משא-נור באוטובוס ממוגן ירי קו 38 וכבר בכפר הראשון שעברנו דרכו סיליית' הא דאהאר" הציבו לנו מחסום וזרקו בקט"ב על האוטובוס , הגענו לישוב חומש אך משם נאלצנו להמשיך ב"טרמפ" ואז הגיע אזרח מהישוב שטען כי עוד שעתיים הוא יוצא לכיוון רחובות , אני שגרתי ברמלה מייד קפצתי ואמרתי לו שאני מצטרף אליו , כשיצאנו מחומש הצרפה אלינו עוד תושבת מהישוב ועוד חייל שחיכה בשער היציאה מהישוב , התחלנו את הנסיעה ,ההרגשה הפנימית שלי הייתה ממש רעה ,משהו ממש הציק לי ואני דורך כדור לקנה, ואז אחרי שתי דקות נסיעה החל ירי על הרכב ואני מייד מנסה לירות חזרה חלון הרכב היה נפתח רק עד חצי הדרך כמנגנון בטיחות לילדים מה שהקשה עלי להוציא את פלג הגוף העליון ולהשיב אש , אני זוכר ששברתי את החלון עם היד וקיפלתי את הכיסא שבו ישבה האישה מקדימה ואז הצלחתי להשיב אש שהצילה את חיינו ,משם לאחר שהמשכנו בנסיעה על מנת לנסות להגיע ל"שבי שומרון" לקבל טיפול רפואי כי עקב הירי על הרכב נפצענו אני החייל הנוסף והאישה משישבה מקדימה , היינו חייבים לעבור דרך כפר "בורכא" בדרך לשם ובכפר עצמו דאגו לנו ל"קבלת פנים " עם אבנים וחפצים שנזרקו על הרכב ומשאית שנוסעת מקדימה ולא נותנת לעבור , התושייה גברה ויצאנו גם משם בסוף הגענו לשבי שומרון ושם התחילו לטפל בנו והעבירו אותי ל"ניתוח שדה" בשער אפרים שם חיכה פרופ' יוסי סביר שפשוט ניתח אותי בשטח כאשר אני בהכרה מלאה לפני העלייה למסוק, ואז החלו כוחותיי להיחלש הרגשתי שאני לא שורד יותר והסוף מגיע, ואז ברגע העלייה למסוק, "מוות קליני" והצוות הרפואי של 669 מתחיל בהחייאה ומצליח לייצב אותי ואז שוב קריסה ,אין דופק, והצוות שוב מחייה אותי , משם נחתנו בתל השומר ועברתי סדרת ניתוחים ארוכה מאוד והתעוררתי לאחר שלושה ימים ,
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-ploni font-black text-blue-700">הדרך לשיקום</h3>
                    <p>
                      משם הגיע לחיי המושג "שיקום" מושג שרק נאמר אך לא הוסבר מעולם מה הוא השיקום ואיך אוכל להשתקם באמת?, אז זה לקח לי שנים רבות אני לא אשקר ולפעמים שאלתי האם שווה לחיות בכלל.. נפלתי קורבן לptsd ותמיד קיללתי את היום ה"ארור" הזה היום אני מבין שעקב הפציעה קיבלתי גם "מתנה " אך לא כל חיי ראיתי את המקרה כמתנה ו היום בעזרת הכלים שרכשתי באן אל פי אני יכול לומר בלב שלם שלמדתי לחיות עם הפחדים שלי ולהתמודד עם כל מה שיקרא בדרכי , נכון ש"זה" לא עובר ודורש התמודדות מתמדת יומיומית אך הצד השני הצד של ה"ויתור" לא תרם למצבי הנפשי להשתפר אלא להפך, ואז בתוך כל הכאוס התחלתי לקבל את המציאות כפי שהיא ולהפסיק את הסיפור ש"תפרתי" לעצמי ו/או ש"נתפר" לי , כיום אני יוצא למסע שבו אני רוצה להעביר את זה הלאה ולהעניק מהמתנה הנפלא הזאת לכל אדם ללא יוצא מן הכלל . ומתוך ה מקום שנקרא "צמיחה מתוך כאב" למדתי לתת למכאובי את הבמה המגיעה להם ולהתמודד איתם, אך כפי שציינתי התהליך לא היה פשוט , לאחר שיקום פיזי ומנטלי ארוך ומייגע אני יכול לומר היום שאם לא הייתי חווה את כל השיקום וכל ההתמודדות הקשה מנשוא , לא הייתי מגיע לתובנה שהחיים שלנו יקרים ושכל רגע שחולף ימשיך לחלוף וכל מה שאני צריך לעשות זה פשוט לתת לדברים לקרות , להיות כאן ועכשיו , להתעסק במה שאני אוהב ולצמוח למקום שכל חיי ייחלתי לו מבלי להטיל ספק בקיום ולחיות בשלום עם הילד הפנימי.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-ploni font-black text-blue-700">נתינה וריפוי</h3>
                    <p>
                      לאחרונה בשל כל נושא המודעות לפוסט טראומה ועקב ההצלחה של חברי מחלקת ההתנדבות (המונים גם פוסט טראומתיים) של עיריית הוד השרון שמנהלת הגברת אסנת סטוצינר , יצאנו למסע משותף עם מחלקות משאבי התנדבות בערים שונות "להעביר את זה הלאה" ופתחנו סדנאות של 10 מפגשים המספקים כלים להתמודדות עם PTSD כלים שנלקחו מעולם ההתפתחות האישית ,כלים שרובינו כבר מכירים אך אופן הביצוע שלהם כמעט אף פעם לא יוצא לפועל כפי שרצינו או לא קורה כלל .
                    </p>
                    <p>
                      האמת היא שבתחילת תקופת השיקום שלי כל הזמן חיפשתי פתרונות להעביר את הזמן להעביר את הכאב הזה שאני לא מכיר , לברוח מעצמי, וזה היה מה שהביא אותי להתנדבות אצל אסנת בהוד השרון, שם קיבלתי שיעור לחיים שלא קיבלתי באף גוף חינוכי , שם באמת טעמתי טעימה מן הדבר הזה שנקרא חיים , ראיתי מקרים לא פשוטים ואף הייתי משווה בין חומרת מצבי לחומרת מצבם של מקרים אילו , , לעיתים הייתי מתקשר לאסנת לשאול אם יש פעילות של התנדבות רק כדי לשנות סביבה לפני שאני יורד מהפסים , המון שאלות היו עולות לראשי בכל פעם שהתנדבתי ומשם הדרך ל"ריפוי" (תובנות) באמת החלה ,
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-ploni font-black text-blue-700">התפתחות אישית ו-NLP</h3>
                    <p>
                      לימים הכרתי בת זוג ,אישה מדהימה שידעה איך להפעיל את כל ה"מנגנון" המכובה שלי וביקשה ממני ללכת איתה להרצאה של אריה כגן, שם תוך כדי שאני שואל את עצמי מה אני עושה פה החלו לקרות דברים , הרגשתי שמישהו שם לב נושאים מאוד חשובים ואף מדבר עליהם ומדגים אותם, תשומת הלב שלי פנתה מייד למתרחש ותוך כדי שאני מניח הנחות לגבי המתרחש המרצה מדבר על אותם הנחות שאנו מניחים בחיים ,ואני רואה בזווית העין את האישה המדהימ ה הזאת יודעת שהיא הביאה אותי למקום הנכון ואף מרוצה מעצמה (מה שללא ספק מגיע לה) , מאותו הרגע התחלתי לברר בכל מקום לגבי ההתפתחות האישית והגעתי לבסוף לסדנאות של "דניאל דוידזון" , אדם שהכרתי בעבר ולא זיהיתי אבל הוא זיהה אותי מתוך 200 איש באולם וזיהה גם את הצורך שלי בכלים להתמודדות ומשם שלח אותי ללמוד NLP אצל "חופית גנדי יצחק" אחת המנהלות היום במכללת "תוצאות" בתל אביב , אצל חופית למדתי את ה"אן אל פי therapist " ומשם גם לקחתי המון כלים ,
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-ploni font-black text-blue-700">השליחות שלי היום</h3>
                    <p>
                      היום בשילוב כל מה שלמדתי וכל מה שסייע לי ולחברי ואחרי כל השאלות לפרופ' מיכאל פולאק (מנהל פסיכיאטריה בתל השומר) במצבים הכי קשים ואף הפגישות אתו במקומות הזויים בשעות הזויות, שיחות עם חברים פוסט טראומתיים בשעות לא שעות וכדומה, למדתי המון ויישמתי חלקים חשובים לתוך תכנית של 10 מפגשים הכוללת גם לימודים מאוד מעניינים על אופן פעולת "המנגנון האוטומטי" ווגם על הכלים שיכולים לסייע לנו בכל מצב המזדמן לפנינו, התוכנית הוקמה מטעמי שיקום אך כמו כן גם על מנת לקשר בין משתתפי הקורס הפוסט טראומתיים לבין האזרחים בישוב בו הוא מתגורר, וליצור קהילת מחוברת ומועצמת בזכות החיבור {"}"}למשל חלוקת חבילות מזון בחגים וכדומה , במקרה שלי תוך כדי חלוקת חבילות מזון הכרתי אנשים נפלאים שכל מטרתם היא עשייה ולמדתי המון הן מאילו והן מאילו , ( והמלצתי האישית היא פשוט להתנסות פעם אחת לא משנה באיזה סוג של התנדבות ו"לטעום" . הכי הרבה יהיה "טעים".
                    </p>
                  </div>

                  <div className="text-center pt-4">
                    <button 
                      onClick={() => {
                        setIsAboutExpanded(false);
                        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center gap-2 mx-auto"
                    >
                      הצג פחות
                      <Icons.ArrowRight size={20} className="-rotate-90" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 flex justify-center gap-8">
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[140px]">
                <span className="text-4xl font-ploni font-black text-blue-600">20+</span>
                <span className="text-sm text-gray-500 font-medium">שנות ניסיון</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[140px]">
                <span className="text-4xl font-ploni font-black text-blue-500">1000+</span>
                <span className="text-sm text-gray-500 font-medium">בוגרים ותלמידים</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Services Grid --- */}
      <section id="services" className="py-24 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-ploni font-black text-gray-900 mb-4 uppercase tracking-tight">תחומי התמחות</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-400 mx-auto rounded-full"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              לחצו על הכרטיס לקבלת מידע נוסף
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service) => {
              const iconMap = {
                'globe': Icons.Globe,
                'compass': Icons.Compass,
                'map': Icons.Map,
                'heart': Icons.Heart
              };
              const SelectedIcon = iconMap[service.icon];

              return (
                <button 
                  key={service.id} 
                  onClick={() => handleOpenService(service)}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col text-right h-full"
                >
                  <div className="p-8 flex-grow flex flex-col items-center text-center">
                     <div className="w-20 h-20 rounded-full border-2 border-blue-400 flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-50 transition-colors">
                        <SelectedIcon size={40} strokeWidth={1.5} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-800 mb-4">{service.title}</h3>
                     <p className="text-gray-600 leading-relaxed text-sm mb-4">
                       {service.description}
                     </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 w-full text-center border-t border-blue-100 group-hover:bg-blue-100 transition-colors">
                    <span className="text-blue-600 font-medium text-sm flex items-center justify-center gap-1">
                      מידע נוסף
                      <Icons.ArrowRight size={16} className="rotate-180" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Courses Section (The Core - Dynamic) --- */}
      <section id="courses" className="py-24 bg-gradient-to-br from-blue-900 to-indigo-900 text-white relative overflow-hidden min-h-[600px]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-ploni font-black mb-4 uppercase tracking-tight">הסדנאות שלנו</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              הצטרפו לנבחרת המובילה של בוגרי ה-NLP בישראל.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icons.Loader2 size={64} className="text-blue-300 animate-spin mb-4" />
              <p className="text-xl text-blue-100">טוען סדנאות...</p>
            </div>
          ) : error ? (
             <div className="text-center py-20 bg-red-900/20 rounded-xl border border-red-500/30">
               <p className="text-xl text-red-200">{error}</p>
             </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
               <p className="text-xl text-gray-300">כרגע אין סדנאות פתוחות להרשמה.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => {
                const occupied = course.occupiedSeats || 0;
                const max = course.maxSeats || 20;
                const percentage = Math.min((occupied / max) * 100, 100);
                const remaining = max - occupied;
                const isLowStock = remaining <= 5;
                const isFull = remaining <= 0;

                return (
                  <div key={`${course.id}-${index}`} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden flex flex-col hover:bg-white/15 transition-all duration-300 shadow-xl">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {isFull ? 'אזלו הכרטיסים' : 'נפתחה ההרשמה'}
                        </div>
                        <span className="text-blue-200 font-mono text-sm">{course.date}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                      <p className="text-blue-100 text-sm mb-6">{course.subtitle}</p>
                      
                      <div className="space-y-3 text-sm text-gray-200">
                        <div className="flex items-center gap-2">
                          <Icons.MapPin size={16} className="text-blue-400" />
                          <span>{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.Clock size={16} className="text-blue-400" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.CreditCard size={16} className="text-blue-400" />
                          <span>{course.price ? course.price.toLocaleString() : '—'} ₪</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-black/20 border-t border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-300">סטטוס הרשמה:</span>
                        <span className={`font-bold ${isLowStock || isFull ? 'text-red-300 animate-pulse' : 'text-blue-300'}`}>
                          {isFull ? 'הסדנה מלאה' : isLowStock ? `נותרו ${remaining} מקומות!` : 'ההרשמה בעיצומה'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${percentage > 80 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <button 
                        onClick={() => handleRegister(course)}
                        disabled={isFull}
                        className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group ${isFull ? 'bg-gray-500 cursor-not-allowed opacity-50 text-white' : 'bg-white text-blue-800 hover:bg-blue-50'}`}
                      >
                        {isFull ? 'ההרשמה סגורה' : 'הרשמה מהירה'}
                        {!isFull && <Icons.CheckCircle size={18} className="group-hover:text-blue-600 transition-colors" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- Family Economics Section --- */}
      <section id="family-economics" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-right">
              <div className="w-12 h-1 bg-blue-600 mb-6 mr-0 ml-auto"></div>
              <h2 className="text-3xl md:text-4xl font-ploni font-black text-gray-900 mb-6 uppercase tracking-tight">ליווי אישי וכלכלת המשפחה</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                הדרך לחופש כלכלי מתחילה בבית. ליווי אישי המשלב כלים מעולם ה-NLP יחד עם אסטרטגיות לניהול תקציב משפחתי, בניית חוסן כלכלי וצמיחה משותפת מתוך הבנה עמוקה של הצרכים שלכם.
              </p>
              <a 
                href="#contact" 
                className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
              >
                תיאום פגישת ייעוץ
              </a>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-6 group-hover:rotate-3 transition-transform opacity-10"></div>
                <div className="relative w-64 h-64 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner border border-blue-100">
                  <Icons.Home size={120} strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Business Coaching Section --- */}
      <section id="business-coaching" className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="md:w-1/2 text-right">
              <div className="w-12 h-1 bg-indigo-600 mb-6 mr-0 ml-auto"></div>
              <h2 className="text-3xl md:text-4xl font-ploni font-black text-gray-900 mb-6 uppercase tracking-tight">ייעוץ וליווי לעסקים</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                העסק שלך הוא השתקפות שלך. ליווי עסקי ממוקד תוצאות הכולל אסטרטגיה, ניהול זמן, שיפור ביצועי מכירות ובניית צוותים מנצחים, הכל תחת מעטפת מקצועית של NLP Master המעניקה לך יתרון תחרותי משמעותי.
              </p>
              <a 
                href="#contact" 
                className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
              >
                לצמיחה עסקית
              </a>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-3xl -rotate-6 group-hover:-rotate-3 transition-transform opacity-10"></div>
                <div className="relative w-64 h-64 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl border border-indigo-50">
                  <Icons.Briefcase size={120} strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Investment House Section --- */}
      <section id="investment-house" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-right">
              <div className="inline-block px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-4 tracking-wider uppercase">
                יפתח בעתיד
              </div>
              <h2 className="text-3xl md:text-4xl font-ploni font-black text-gray-900 mb-6 uppercase tracking-tight">בית ההשקעות שלנו</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                אנחנו מאמינים בהשקעה באנשים ובקהילה שלנו. בית ההשקעות שלנו יציע הזדמנויות השקעה ייחודיות ומניבות, עם דגש על תמיכה וצמיחה של בוגרי התוכניות שלנו.
                <br /><br />
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">בעדיפות להשקעה במשתתפי התוכנית.</span>
              </p>
              <div className="flex items-center gap-4">
                <button className="bg-gray-100 text-gray-400 px-10 py-4 rounded-full font-bold cursor-not-allowed border border-gray-200">
                  בקרוב...
                </button>
                <span className="text-sm text-gray-400 italic">הצטרפו לקהילה כדי להתעדכן ראשונים</span>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gray-400 rounded-3xl rotate-3 group-hover:rotate-1 transition-transform opacity-10"></div>
                <div className="relative w-64 h-64 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 shadow-inner border border-gray-100">
                  <Icons.Building size={120} strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer id="contact" className="bg-blue-950 text-blue-100 py-12 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-right">
              <h3 className="text-2xl font-ploni font-black text-white mb-2 uppercase tracking-tight">יוסי כהן</h3>
              <p className="text-blue-400">מאסטר ב-NLP וליווי עסקי</p>
            </div>
            
            <div className="flex gap-8 mb-6 md:mb-0">
              <a href="#" className="hover:text-white transition-colors">פייסבוק</a>
              <a href="#" className="hover:text-white transition-colors">אינסטגרם</a>
              <a href="#" className="hover:text-white transition-colors">לינקדאין</a>
            </div>

            <div className="text-center md:text-left text-sm text-blue-500">
              <p>© כל הזכויות שמורות 2024</p>
              <p>הוד השרון, ישראל</p>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Modals --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        course={selectedCourse} 
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={handleCloseServiceModal}
        service={selectedService}
      />
      
      {/* --- Public ChatBot --- */}
      <ChatBot courses={courses} />

    </div>
  );
};

export default PublicHome;

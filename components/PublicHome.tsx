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
}

const PublicHome: React.FC<PublicHomeProps> = ({ onLoginSuccess, onLoginError }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

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
        
        // Filter active courses immediately (isActive === true)
        const activeCourses = Array.isArray(data) 
          ? data.filter((c: Course) => c.isActive === true) 
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
                src="https://i.ibb.co/XxnjDfzS/Untitled-presentation-1.png" 
                alt="Yossi Cohen Logo" 
                className="w-12 h-12 object-contain rounded-full shadow-sm bg-white"
              />
              <div className="hidden md:block">
                <span className={`block font-bold text-lg leading-tight transition-colors ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                  יוסי כהן
                </span>
                <span className={`block text-xs font-medium tracking-wide transition-colors ${scrolled ? 'text-teal-600' : 'text-white/90'}`}>
                  NLP MASTER
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className={`hidden md:flex items-center gap-8 font-medium transition-colors ${scrolled ? 'text-gray-600' : 'text-white'}`}>
              <a href="#about" className={`hover:text-teal-500 transition-colors`}>אודות</a>
              <a href="#services" className={`hover:text-teal-500 transition-colors`}>שירותים</a>
              <a href="#courses" className={`hover:text-teal-500 transition-colors`}>קורסים</a>
              <a href="#contact" className={`hover:text-teal-500 transition-colors`}>צור קשר</a>
              
              <div className="h-6 w-px bg-current opacity-30 mx-2"></div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowLogin(!showLogin)}
                  className="flex items-center gap-2 hover:text-teal-500 transition-colors focus:outline-none"
                >
                  <Icons.Users size={18} />
                  <span>כניסת חברים</span>
                </button>
                
                {/* Google Login Dropdown */}
                {showLogin && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-4 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[240px] z-50 animate-fadeIn">
                     <p className="text-xs text-center text-gray-500 mb-3">התחברות לאזור האישי</p>
                     <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={onLoginSuccess}
                            onError={onLoginError}
                            type="standard"
                            theme="filled_blue"
                            shape="circle"
                            text="signin_with"
                            locale="he"
                        />
                     </div>
                  </div>
                )}
              </div>

              <button 
                onClick={scrollToCourses}
                className={`${scrolled ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-white text-teal-800 hover:bg-teal-50'} px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg text-sm font-bold`}
              >
                הרשמה
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <div className={`md:hidden ${scrolled ? 'text-gray-600' : 'text-white'}`}>
              <button onClick={() => setShowLogin(!showLogin)}>
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
                 </div>
              </div>
            )}
        </div>
      </nav>

      {/* --- Hero Section (Deep Approach) --- */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-900 via-emerald-800 to-green-900"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' }}
      >
        {/* Abstract animated overlay */}
        <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-0 animate-fadeIn">
          <h1 className="text-6xl md:text-8xl font-thin text-white mb-8 drop-shadow-md tracking-[0.2em] md:tracking-[0.25em]">
            יוסי כהן
          </h1>
          <p className="text-xl md:text-2xl text-white font-light tracking-[0.4em] md:tracking-[0.6em] mb-12 opacity-95">
            ליווי הנחייה ייעוץ והדרכה
          </p>
          
          <button 
            onClick={scrollToCourses}
            className="group relative inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-10 py-4 rounded-full text-lg font-light hover:bg-white hover:text-teal-800 transition-all duration-300 shadow-xl overflow-hidden tracking-wider"
          >
            <span className="relative z-10">לפרטים והרשמה</span>
            <Icons.ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform rotate-180" />
          </button>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full blur-2xl opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200 rounded-full blur-2xl opacity-60"></div>
              <img 
                src="https://picsum.photos/600/800?man" 
                alt="Yossi Cohen" 
                className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto z-10 border-4 border-white object-cover"
              />
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2 text-right">
              <div className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                הסיפור שלי
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                צמיחה מתוך <span className="text-teal-600 relative">כאב
                  <svg className="absolute w-full h-2 -bottom-1 left-0 text-green-300 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h2>
              
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  נעים מאוד, אני יוסי כהן. יליד 1980, תושב הוד השרון.
                </p>
                <p>
                  בשנת 2000, במהלך שירותי הצבאי, חיי השתנו ברגע אחד. נפצעתי אנושות וחוויתי מוות קליני.
                  הדרך חזרה לחיים לא הייתה פשוטה. עברתי שיקום ארוך, פיזי ונפשי, שבמהלכו גיליתי כוחות שלא ידעתי שקיימים בי.
                </p>
                <p>
                  שם, בנקודת השפל הנמוכה ביותר, נולדה הפילוסופיה שמנחה אותי היום: 
                  <strong className="text-teal-700 mx-1">הכאב הוא לא הסוף, הוא נקודת הזינוק.</strong>
                </p>
                <p>
                  היום, אני מקדיש את חיי כדי ללמד אנשים אחרים כיצד להפוך משברים להזדמנויות,
                  באמצעות כלי ה-NLP, תובנות מעולם העסקים, וניסיון חיים שאין לו תחליף.
                </p>
              </div>

              <div className="mt-8 flex gap-4">
                <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <span className="text-3xl font-bold text-teal-600">20+</span>
                  <span className="text-sm text-gray-500">שנות ניסיון</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <span className="text-3xl font-bold text-green-500">1000+</span>
                  <span className="text-sm text-gray-500">בוגרים ותלמידים</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Services Grid --- */}
      <section id="services" className="py-24 bg-gradient-to-b from-white to-green-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">תחומי התמחות</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-teal-500 to-green-400 mx-auto rounded-full"></div>
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
                     <div className="w-20 h-20 rounded-full border-2 border-green-400 flex items-center justify-center text-green-500 mb-6 group-hover:bg-green-50 transition-colors">
                        <SelectedIcon size={40} strokeWidth={1.5} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-800 mb-4">{service.title}</h3>
                     <p className="text-gray-600 leading-relaxed text-sm mb-4">
                       {service.description}
                     </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 w-full text-center border-t border-green-100 group-hover:bg-green-100 transition-colors">
                    <span className="text-green-600 font-medium text-sm flex items-center justify-center gap-1">
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
      <section id="courses" className="py-24 bg-gradient-to-br from-teal-900 to-green-900 text-white relative overflow-hidden min-h-[600px]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">קורסי המאסטר</h2>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto">
              הצטרפו לנבחרת המובילה של בוגרי ה-NLP בישראל.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icons.Loader2 size={64} className="text-teal-300 animate-spin mb-4" />
              <p className="text-xl text-teal-100">טוען קורסים...</p>
            </div>
          ) : error ? (
             <div className="text-center py-20 bg-red-900/20 rounded-xl border border-red-500/30">
               <p className="text-xl text-red-200">{error}</p>
             </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
               <p className="text-xl text-gray-300">כרגע אין קורסים פתוחים להרשמה.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => {
                const occupied = course.occupiedSeats || 0;
                const max = course.maxSeats || 20;
                const percentage = Math.min((occupied / max) * 100, 100);
                const remaining = max - occupied;
                const isLowStock = remaining <= 5;
                const isFull = remaining <= 0;

                return (
                  <div key={course.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden flex flex-col hover:bg-white/15 transition-all duration-300 shadow-xl">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isFull ? 'bg-red-500' : 'bg-green-500'}`}>
                          {isFull ? 'אזלו הכרטיסים' : 'נפתחה ההרשמה'}
                        </div>
                        <span className="text-teal-200 font-mono text-sm">{course.date}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                      <p className="text-teal-100 text-sm mb-6">{course.subtitle}</p>
                      
                      <div className="space-y-3 text-sm text-gray-200">
                        <div className="flex items-center gap-2">
                          <Icons.MapPin size={16} className="text-green-400" />
                          <span>{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.Clock size={16} className="text-green-400" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.CreditCard size={16} className="text-green-400" />
                          <span>{course.price ? course.price.toLocaleString() : '—'} ₪</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-black/20 border-t border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-300">סטטוס הרשמה:</span>
                        <span className={`font-bold ${isLowStock || isFull ? 'text-red-300 animate-pulse' : 'text-green-300'}`}>
                          {isFull ? 'הקורס מלא' : isLowStock ? `נותרו ${remaining} מקומות!` : 'ההרשמה בעיצומה'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${percentage > 80 ? 'bg-orange-500' : 'bg-green-500'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <button 
                        onClick={() => handleRegister(course)}
                        disabled={isFull}
                        className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group ${isFull ? 'bg-gray-500 cursor-not-allowed opacity-50 text-white' : 'bg-white text-teal-800 hover:bg-teal-50'}`}
                      >
                        {isFull ? 'ההרשמה סגורה' : 'הרשמה מהירה'}
                        {!isFull && <Icons.CheckCircle size={18} className="group-hover:text-green-600 transition-colors" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer id="contact" className="bg-teal-950 text-teal-100 py-12 border-t border-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-right">
              <h3 className="text-2xl font-bold text-white mb-2">יוסי כהן</h3>
              <p className="text-teal-400">מאסטר ב-NLP וליווי עסקי</p>
            </div>
            
            <div className="flex gap-8 mb-6 md:mb-0">
              <a href="#" className="hover:text-white transition-colors">פייסבוק</a>
              <a href="#" className="hover:text-white transition-colors">אינסטגרם</a>
              <a href="#" className="hover:text-white transition-colors">לינקדאין</a>
            </div>

            <div className="text-center md:text-left text-sm text-teal-500">
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
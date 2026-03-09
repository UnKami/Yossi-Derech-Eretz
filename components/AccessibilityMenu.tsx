import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isReadableFont, setIsReadableFont] = useState(false);
  const [isHighlightLinks, setIsHighlightLinks] = useState(false);
  const [isLargeCursor, setIsLargeCursor] = useState(false);
  const [isStopAnimations, setIsStopAnimations] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    
    // Font Size
    html.style.fontSize = `${fontSize}%`;
    
    // High Contrast
    if (isHighContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    
    // Grayscale
    if (isGrayscale) {
      html.classList.add('grayscale-mode');
    } else {
      html.classList.remove('grayscale-mode');
    }
    
    // Readable Font
    if (isReadableFont) {
      html.classList.add('readable-font');
    } else {
      html.classList.remove('readable-font');
    }
    
    // Highlight Links
    if (isHighlightLinks) {
      html.classList.add('highlight-links');
    } else {
      html.classList.remove('highlight-links');
    }
    
    // Large Cursor
    if (isLargeCursor) {
      html.classList.add('large-cursor');
    } else {
      html.classList.remove('large-cursor');
    }

    // Stop Animations
    if (isStopAnimations) {
      html.classList.add('stop-animations');
    } else {
      html.classList.remove('stop-animations');
    }
  }, [fontSize, isHighContrast, isGrayscale, isReadableFont, isHighlightLinks, isLargeCursor, isStopAnimations]);

  const reset = () => {
    setFontSize(100);
    setIsHighContrast(false);
    setIsGrayscale(false);
    setIsReadableFont(false);
    setIsHighlightLinks(false);
    setIsLargeCursor(false);
    setIsStopAnimations(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] font-assistant" dir="rtl">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-110 group"
        aria-label="תפריט נגישות"
      >
        <Icons.Accessibility size={32} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Icons.Accessibility size={20} />
              <h3 className="font-bold text-lg">תפריט נגישות</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full" aria-label="סגור תפריט">
              <Icons.X size={20} />
            </button>
          </div>
          
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Font Size */}
            <div className="flex flex-col gap-2 border-b pb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Icons.Type size={16} />
                <span className="text-sm font-bold">גודל טקסט</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFontSize(prev => Math.min(prev + 10, 150))}
                  className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-bold"
                >
                  הגדל +
                </button>
                <button 
                  onClick={() => setFontSize(prev => Math.max(prev - 10, 80))}
                  className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-bold"
                >
                  הקטן -
                </button>
              </div>
            </div>

            {/* Toggles */}
            <AccessibilityOption 
              label="ניגודיות גבוהה" 
              active={isHighContrast} 
              onClick={() => setIsHighContrast(!isHighContrast)} 
              icon={<Icons.Contrast size={18} />}
            />
            <AccessibilityOption 
              label="גווני אפור" 
              active={isGrayscale} 
              onClick={() => setIsGrayscale(!isGrayscale)} 
              icon={<Icons.Sun size={18} />}
            />
            <AccessibilityOption 
              label="גופן קריא" 
              active={isReadableFont} 
              onClick={() => setIsReadableFont(!isReadableFont)} 
              icon={<Icons.Type size={18} />}
            />
            <AccessibilityOption 
              label="הדגשת קישורים" 
              active={isHighlightLinks} 
              onClick={() => setIsHighlightLinks(!isHighlightLinks)} 
              icon={<Icons.Globe size={18} />}
            />
            <AccessibilityOption 
              label="סמן גדול" 
              active={isLargeCursor} 
              onClick={() => setIsLargeCursor(!isLargeCursor)} 
              icon={<Icons.MousePointer2 size={18} />}
            />
            <AccessibilityOption 
              label="עצור אנימציות" 
              active={isStopAnimations} 
              onClick={() => setIsStopAnimations(!isStopAnimations)} 
              icon={<Icons.Minimize2 size={18} />}
            />

            <button 
              onClick={reset}
              className="w-full py-3 mt-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <Icons.RefreshCw size={18} />
              איפוס הגדרות
            </button>
          </div>
          
          <div className="p-3 bg-gray-50 text-center text-[10px] text-gray-400">
            מוגש באהבה לנגישות מלאה
          </div>
        </div>
      )}
    </div>
  );
};

const AccessibilityOption = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
      active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className={`w-4 h-4 rounded-full border-2 ${active ? 'bg-white border-white' : 'border-gray-300'}`} />
  </button>
);

export default AccessibilityMenu;

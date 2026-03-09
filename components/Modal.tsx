import React, { useState } from 'react';
import { Course, RegistrationFormData } from '../types';
import { Icons } from './Icons';
import { API_URL } from '../constants';
import PayPalPayment from './PayPalPayment';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, course }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: Payment, 3: Success
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    phone: '',
    email: ''
  });
  
  // Clean state for UI loading/processing managed by PayPal component or backend sync
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle Close & Reset
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setFormData({ name: '', phone: '', email: '' });
      setIsProcessing(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setStep(2);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (!course) return;
    setIsProcessing(true);

    try {
      const params = new URLSearchParams();
      // 'action' tells the script to use Registration logic (Registrations tab)
      params.append('action', 'register'); 
      params.append('fullName', formData.name);
      params.append('phone', formData.phone);
      params.append('email', formData.email);
      params.append('courseId', course.id);
      params.append('courseName', course.title);
      // Optional: Send transaction details if script supports it, though not strictly requested
      params.append('transactionId', paymentDetails.id);

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      setStep(3);
    } catch (error) {
      console.error("Backend Sync Error:", error);
      // Payment succeeded even if backend sync failed (rare edge case), proceed to success
      setStep(3); 
    } finally {
      setIsProcessing(false);
      // Auto close after success
      setTimeout(handleClose, 5000);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment failed:", error);
    alert("אירעה שגיאה בתהליך התשלום. אנא נסה שנית או צור קשר.");
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-blue-700 to-blue-600 p-6 text-white shrink-0">
          <button 
            onClick={handleClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <Icons.X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-1">
            {step === 3 ? 'אישור הרשמה' : 'הרשמה לקורס'}
          </h2>
          <p className="text-blue-50 opacity-90 text-sm truncate">{course.title}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* STEP 1: Details Form */}
          {step === 1 && (
            <form onSubmit={goToPayment} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="ישראל ישראלי"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="050-0000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">דוא"ל</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="example@email.com"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  המשך לתשלום
                  <Icons.CreditCard size={18} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Order Summary Card */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-blue-800 font-bold mb-3 text-sm">סיכום הזמנה</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">{course.title}</span>
                  <span className="font-bold text-gray-800">{course.price.toLocaleString()} ₪</span>
                </div>
                <div className="h-px bg-blue-200/50 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-800">סה"כ לתשלום</span>
                  <span className="font-bold text-blue-800 text-lg">{course.price.toLocaleString()} ₪</span>
                </div>
              </div>

              {/* PayPal Component Integration */}
              <div className="min-h-[150px]">
                {isProcessing ? (
                   <div className="flex flex-col items-center justify-center py-8">
                     <Icons.Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                     <span className="text-sm text-blue-600 font-medium">מעבד תשלום...</span>
                   </div>
                ) : (
                    <PayPalPayment 
                        course={course}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                    />
                )}
              </div>

              {/* Back Button */}
              <button
                onClick={() => setStep(1)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 font-medium py-2 transition-colors text-sm disabled:opacity-50"
              >
                <Icons.ArrowRight size={16} />
                חזרה לעריכת פרטים
              </button>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center py-6 animate-fadeIn">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center shadow-xl text-white">
                  <Icons.CheckCircle size={40} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-2">התשלום עבר בהצלחה!</h3>
              <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                תודה שנרשמת לקורס <strong>{course.title}</strong>.
                <br />
                קבלה ופרטים נוספים נשלחו לכתובת המייל שלך.
              </p>
              
              <button 
                onClick={handleClose}
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                סגור חלונית
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Modal;
import React from 'react';
import { ServiceItem } from '../types';
import { Icons } from './Icons';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, service }) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-sm" dir="rtl" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white p-6 pb-2 shrink-0 flex justify-between items-start">
          <div className="pr-2">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">{service.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <Icons.X size={28} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 pt-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {service.details.map((section, index) => (
              <div key={index}>
                {section.title && (
                  <h3 className="text-xl font-bold text-gray-800 mb-3 text-right">
                    {section.title}
                  </h3>
                )}
                <p className="text-gray-600 leading-relaxed text-right">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer decoration */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-400 w-full shrink-0"></div>
      </div>
    </div>
  );
};

export default ServiceModal;
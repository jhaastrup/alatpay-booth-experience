
import React, { useState } from 'react';
import { Visitor } from '../types';

interface SignupFormProps {
  onSubmit: (data: Omit<Visitor, 'id' | 'visitorNumber' | 'isWinner' | 'timestamp'>) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (!formData.phone.match(/^\+?[\d\s-]{10,}$/)) newErrors.phone = 'Valid phone number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate slight delay for effect
      setTimeout(() => {
        onSubmit(formData);
        setIsSubmitting(false);
      }, 800);
    }
  };

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#be0b27]">Check Your Luck 🎁</h2>
        <p className="text-sm text-gray-500 italic">Every odd visitor wins a prize!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name *</label>
          <input
            type="text"
            placeholder="John Doe"
            required
            className={`w-full p-4 bg-white text-gray-900 border-2 rounded-xl focus:ring-2 focus:ring-[#be0b27] outline-none transition-all placeholder:text-gray-300 ${errors.name ? 'border-red-400' : 'border-gray-100'}`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address *</label>
          <input
            type="email"
            placeholder="john@example.com"
            required
            className={`w-full p-4 bg-white text-gray-900 border-2 rounded-xl focus:ring-2 focus:ring-[#be0b27] outline-none transition-all placeholder:text-gray-300 ${errors.email ? 'border-red-400' : 'border-gray-100'}`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number *</label>
          <input
            type="tel"
            placeholder="0801 234 5678"
            required
            className={`w-full p-4 bg-white text-gray-900 border-2 rounded-xl focus:ring-2 focus:ring-[#be0b27] outline-none transition-all placeholder:text-gray-300 ${errors.phone ? 'border-red-400' : 'border-gray-100'}`}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          {errors.phone && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.phone}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Organization (Optional)</label>
          <input
            type="text"
            placeholder="Your Company Name"
            className="w-full p-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[#be0b27] outline-none transition-all placeholder:text-gray-300"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 mt-4 bg-gradient-to-r from-[#be0b27] to-[#92091d] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Check My Luck 🎁
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;

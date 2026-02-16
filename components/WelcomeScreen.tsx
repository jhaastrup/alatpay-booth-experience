
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="glass rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="w-20 h-20 bg-gradient-to-tr from-[#be0b27] to-[#92091d] rounded-2xl flex items-center justify-center shadow-lg floating">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-[#be0b27] leading-tight">
          Welcome to the <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#be0b27] to-[#92091d]">
            ALATPay Booth Experience
          </span>
        </h1>
        <p className="text-gray-600 text-sm px-4">
          Win amazing gifts, join our developer community, and discover the future of payments.
        </p>
      </div>

      <button
        onClick={onStart}
        className="group relative w-full py-4 bg-[#be0b27] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          Start Your Journey
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
      </button>

      <div className="flex gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        <span>Connect</span>
        <span>•</span>
        <span>Build</span>
        <span>•</span>
        <span>Scale</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;

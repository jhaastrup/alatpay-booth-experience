import React, { useEffect, useState } from 'react';
import { Visitor } from '../types';
import { LINKS } from '../constants';
import Confetti from './Confetti';
import { getPersonalizedMessage } from '../services/geminiService';

interface ResultScreenProps {
  visitor: Visitor;
  onReset: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ visitor, onReset }) => {
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMessage = async () => {
      try {
        const msg = await getPersonalizedMessage(visitor.name, visitor.isWinner, visitor.organization);
        if (isMounted) {
          setAiMessage(msg);
          setIsLoadingAi(false);
        }
      } catch (error) {
        if (isMounted) setIsLoadingAi(false);
      }
    };
    fetchMessage();
    return () => { isMounted = false; };
  }, [visitor]);

  return (
    <div className="space-y-6 animate-in zoom-in fade-in duration-300">
      {visitor.isWinner && <Confetti />}

      <div className={`glass rounded-3xl p-8 shadow-2xl text-center space-y-6 overflow-hidden relative ${visitor.isWinner ? 'border-4 border-[#be0b27]' : ''}`}>
        {visitor.isWinner && (
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-[#be0b27] to-red-400 animate-pulse"></div>
        )}
        
        <div className="space-y-2">
          {visitor.isWinner ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-150">
              <div className="text-6xl mb-4 floating">🎉</div>
              <h2 className="text-3xl font-extrabold text-[#be0b27]">YAY! WINNER!</h2>
              <div className="bg-red-50 inline-block px-4 py-1 rounded-full text-[#be0b27] font-bold text-xs uppercase tracking-widest mb-4">
                Visitor #{visitor.visitorNumber}
              </div>
              <p className="text-gray-700 font-medium px-4">
                Congratulations <span className="text-[#be0b27] font-bold">{visitor.name}</span>!
              </p>
              <div className="bg-[#be0b27]/5 p-4 rounded-xl border border-[#be0b27]/10 mt-4">
                <p className="text-xs text-[#be0b27] font-bold uppercase mb-1">Redemption Key</p>
                <p className="text-2xl font-mono font-black text-[#be0b27] tracking-tighter">
                  ALAT-{visitor.visitorNumber}-{visitor.id.split('-')[0].toUpperCase()}
                </p>
                <p className="text-[10px] text-gray-500 mt-2 font-medium">Show screen to booth staff</p>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-150">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-extrabold text-[#be0b27]">THANK YOU!</h2>
              <div className="bg-gray-100 inline-block px-4 py-1 rounded-full text-gray-600 font-bold text-xs uppercase tracking-widest mb-4">
                Visitor #{visitor.visitorNumber}
              </div>
              <p className="text-gray-700 font-medium px-4">
                Thanks for stopping by, <span className="font-bold">{visitor.name}</span>.
              </p>
            </div>
          )}
        </div>

        {/* AI Insight Box - Loads asynchronously */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left relative group min-h-[100px] flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Growth Insight</span>
          </div>
          {isLoadingAi ? (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 italic font-medium leading-relaxed animate-in fade-in duration-700">
              "{aiMessage}"
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <a
          href={LINKS.ONBOARDING}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between w-full p-4 bg-[#be0b27] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-sm">Start Accepting Payments</span>
            <span className="text-[10px] opacity-70 font-normal">ALATPay Business Signup</span>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </a>

        <a
          href={LINKS.COMMUNITY}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between w-full p-4 bg-white border-2 border-[#be0b27]/10 text-[#be0b27] rounded-2xl font-bold shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-sm">Developer Community</span>
            <span className="text-[10px] text-gray-400 font-normal">Connect with makers</span>
          </div>
          <div className="w-8 h-8 bg-[#be0b27]/5 rounded-full flex items-center justify-center group-hover:bg-[#be0b27]/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </a>

        <button
          onClick={onReset}
          className="w-full py-2 text-gray-400 text-xs font-bold hover:text-red-600 transition-colors"
        >
          Finish & Logout
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
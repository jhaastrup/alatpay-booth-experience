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

      <div className={`glass rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6 overflow-hidden relative transition-all duration-500 ${visitor.isWinner ? 'border-4 border-[#be0b27]' : 'border border-gray-100'}`}>
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
                <p className="text-xs text-[#be0b27] font-bold uppercase mb-1 tracking-widest">Redemption Code</p>
                <p className="text-2xl font-mono font-black text-[#be0b27] tracking-tighter">
                  ALAT-{visitor.visitorNumber}-{visitor.id.split('-')[0].toUpperCase()}
                </p>
                <p className="text-[10px] text-gray-500 mt-2 font-medium">Please present this screen to booth staff</p>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-150">
              <div className="text-6xl mb-4 grayscale opacity-60">✨</div>
              <h2 className="text-3xl font-extrabold text-gray-800">THANK YOU!</h2>
              <div className="bg-gray-100 inline-block px-4 py-1 rounded-full text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">
                Visitor #{visitor.visitorNumber}
              </div>
              <div className="space-y-3">
                <p className="text-gray-700 font-medium px-4">
                  Thanks for visiting ALATPay, <span className="font-bold">{visitor.name}</span>.
                </p>
                <p className="text-sm text-[#be0b27] font-black animate-pulse bg-red-50 inline-block px-4 py-1 rounded-full uppercase tracking-widest">
                  Better luck next time! 🍀
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-5 leading-relaxed max-w-[260px] mx-auto font-medium">
                You might not have won a physical gift today, but you can still win with ALATPay's business solutions.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left relative group min-h-[100px] flex flex-col justify-center transition-colors hover:bg-white hover:border-[#be0b27]/10">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${visitor.isWinner ? 'bg-red-400' : 'bg-gray-400'}`}></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {visitor.isWinner ? 'Winner Bonus Insight' : 'Tech Growth Tip'}
            </span>
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
          className="group flex items-center justify-between w-full p-5 bg-[#be0b27] text-white rounded-[1.5rem] font-bold shadow-lg shadow-red-900/10 hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-sm uppercase tracking-wide">Grow Your Business</span>
            <span className="text-[10px] opacity-70 font-normal">Sign up for ALATPay for Business</span>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-[#be0b27] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </a>

        <a
          href={LINKS.COMMUNITY}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between w-full p-5 bg-white border-2 border-[#be0b27]/10 text-[#be0b27] rounded-[1.5rem] font-bold shadow-sm hover:shadow-md hover:border-[#be0b27]/30 transition-all"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-sm uppercase tracking-wide">Join Our Developer Tribe</span>
            <span className="text-[10px] text-gray-400 font-normal">Build the future of payments</span>
          </div>
          <div className="w-10 h-10 bg-[#be0b27]/5 rounded-xl flex items-center justify-center group-hover:bg-[#be0b27] group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </a>

        <button
          onClick={onReset}
          className="w-full py-4 text-gray-400 text-xs font-black uppercase tracking-[0.3em] hover:text-[#be0b27] transition-colors"
        >
          Finish & Return
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;

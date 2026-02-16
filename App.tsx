import React, { useState, useEffect } from 'react';
import { AppView, Visitor } from './types';
import { STORAGE_KEYS, WIN_PROBABILITY } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import SignupForm from './components/SignupForm';
import ResultScreen from './components/ResultScreen';
import AdminDashboard from './components/AdminDashboard';
import { submitLeadToCentralHub } from './services/submissionService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.WELCOME);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    const storedVisitors = localStorage.getItem(STORAGE_KEYS.VISITORS);
    if (storedVisitors) {
      setVisitors(JSON.parse(storedVisitors));
    }

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView(AppView.ADMIN);
      } else if (view === AppView.ADMIN) {
        setView(AppView.WELCOME);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAddVisitor = async (visitorData: Omit<Visitor, 'id' | 'visitorNumber' | 'isWinner' | 'timestamp'>) => {
    const isWinner = Math.random() < WIN_PROBABILITY;
    const baseNumber = Math.floor(Math.random() * 899) + 100;
    
    let visitorNumber: number;
    if (isWinner) {
      visitorNumber = baseNumber % 2 === 0 ? baseNumber + 1 : baseNumber;
    } else {
      visitorNumber = baseNumber % 2 !== 0 ? baseNumber + 1 : baseNumber;
    }

    const newVisitor: Visitor = {
      ...visitorData,
      id: crypto.randomUUID(),
      visitorNumber,
      isWinner,
      timestamp: new Date().toISOString()
    };

    const updatedVisitors = [...visitors, newVisitor];
    setVisitors(updatedVisitors);
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(updatedVisitors));
    setCurrentVisitor(newVisitor);
    setView(AppView.RESULT);

    submitLeadToCentralHub(newVisitor).catch(err => console.error("Background submission failed", err));
  };

  const resetCounter = () => {
    if (window.confirm("Reset LOCAL device cache? This will NOT delete records from the Google Sheet.")) {
      setVisitors([]);
      localStorage.removeItem(STORAGE_KEYS.VISITORS);
    }
  };

  const isAdmin = view === AppView.ADMIN;

  return (
    <div className={`min-h-screen relative flex flex-col items-center ${isAdmin ? 'justify-start pt-8 pb-20' : 'justify-center p-4'}`}>
      <div className="fixed top-0 -left-20 w-72 h-72 bg-red-400 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
      <div className="fixed bottom-0 -right-20 w-72 h-72 bg-red-600 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

      <main className={`w-full z-10 transition-all duration-500 ${isAdmin ? 'max-w-[1600px] px-6 md:px-12' : 'max-w-md'}`}>
        {view === AppView.WELCOME && (
          <WelcomeScreen onStart={() => setView(AppView.FORM)} />
        )}
        
        {view === AppView.FORM && (
          <SignupForm onSubmit={handleAddVisitor} />
        )}
        
        {view === AppView.RESULT && currentVisitor && (
          <ResultScreen visitor={currentVisitor} onReset={() => setView(AppView.WELCOME)} />
        )}

        {view === AppView.ADMIN && (
          <AdminDashboard visitors={visitors} onReset={resetCounter} />
        )}
      </main>

      {!isAdmin && (
        <footer className="fixed bottom-4 text-xs text-red-900/40 font-medium">
          Powered by ALATPay
        </footer>
      )}
    </div>
  );
};

export default App;

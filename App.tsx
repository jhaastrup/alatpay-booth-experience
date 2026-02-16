
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

  // Persistence logic (Local backup for the device being used)
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
    // 1. Determine if this user should win based on probability (currently 65%)
    const isWinner = Math.random() < WIN_PROBABILITY;

    // 2. Generate a random base number between 100 and 999
    // We use a random number to simulate the visitor sequence on their own device
    let baseNumber = Math.floor(Math.random() * 899) + 100;

    // 3. Force the number to be ODD if they win, and EVEN if they lose
    // "Every odd visitor wins" is the rule. 
    // We ensure 65% of people get an ODD number so they win.
    let visitorNumber: number;
    if (isWinner) {
      // Force Odd: if even, add 1. If odd, keep it.
      visitorNumber = baseNumber % 2 === 0 ? baseNumber + 1 : baseNumber;
    } else {
      // Force Even: if odd, add 1. If even, keep it.
      visitorNumber = baseNumber % 2 !== 0 ? baseNumber + 1 : baseNumber;
    }

    const newVisitor: Visitor = {
      ...visitorData,
      id: crypto.randomUUID(),
      visitorNumber,
      isWinner,
      timestamp: new Date().toISOString()
    };

    // Save locally to the visitor's device (Browser storage)
    const updatedVisitors = [...visitors, newVisitor];
    setVisitors(updatedVisitors);
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(updatedVisitors));
    
    // Submit to the central Google Sheet (Central Hub)
    // This allows multiple devices to contribute to one single sheet
    await submitLeadToCentralHub(newVisitor);

    setCurrentVisitor(newVisitor);
    setView(AppView.RESULT);
  };

  const resetCounter = () => {
    if (window.confirm("Are you sure you want to reset local data? This does not affect the central spreadsheet.")) {
      setVisitors([]);
      localStorage.removeItem(STORAGE_KEYS.VISITORS);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <div className="fixed top-0 -left-20 w-72 h-72 bg-red-400 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
      <div className="fixed bottom-0 -right-20 w-72 h-72 bg-red-600 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

      <main className="w-full max-w-md z-10 transition-all duration-500">
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

      <footer className="fixed bottom-4 text-xs text-red-900/40 font-medium">
        Powered by ALATPay
      </footer>
    </div>
  );
};

export default App;

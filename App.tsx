
import React, { useState, useEffect } from 'react';
import { AppView, Visitor } from './types';
import { STORAGE_KEYS } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import SignupForm from './components/SignupForm';
import ResultScreen from './components/ResultScreen';
import AdminDashboard from './components/AdminDashboard';
import { submitLeadToCentralHub } from './services/submissionService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.WELCOME);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null);

  // Persistence logic (Local backup)
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
    // Note: Since users are on their own devices, the "visitorNumber" 
    // here is relative to their device. For a true global counter, 
    // the backend/Google Script should assign the number.
    // For this UI, we'll generate a random-ish lucky factor.
    
    const isWinner = Math.random() > 0.7; // 30% chance for individuals on their own devices

    const newVisitor: Visitor = {
      ...visitorData,
      id: crypto.randomUUID(),
      visitorNumber: Math.floor(Math.random() * 900) + 100, // Random number for effect
      isWinner,
      timestamp: new Date().toISOString()
    };

    // 1. Save locally as backup
    const updatedVisitors = [...visitors, newVisitor];
    setVisitors(updatedVisitors);
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(updatedVisitors));
    
    // 2. Submit to Central Hub (Google Sheets / API)
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

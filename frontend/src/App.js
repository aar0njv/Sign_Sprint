import React, { useState } from 'react';
import SignRoom from './components/SignRoom';
import Dashboard from './components/Dashboard';

function App() {
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'room'
    const [targetLetter, setTargetLetter] = useState(null);

    const handleSelectTarget = (letter) => {
        setTargetLetter(letter);
        setCurrentView('room');
    };

    const handleBackToDashboard = () => {
        setTargetLetter(null);
        setCurrentView('dashboard');
    };

    return (
        <div className="App flex flex-col min-h-screen bg-gray-900 font-sans">
            {currentView === 'dashboard' ? (
                <Dashboard onSelectTarget={handleSelectTarget} />
            ) : (
                <React.Fragment>
                    {/* Global Back Button Override positioned above SignRoom */}
                    <button
                        onClick={handleBackToDashboard}
                        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full border border-gray-600 shadow-lg transition-all hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Dashboard
                    </button>

                    <SignRoom
                        targetLetter={targetLetter}
                        userId="test-user-123" // Hardcoded test user for now
                        onComplete={handleBackToDashboard} // Optional: we could return automatically or let them practice more
                    />
                </React.Fragment>
            )}
        </div>
    );
}

export default App;

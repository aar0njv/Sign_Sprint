import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Phase1Lessons from './components/Phase1Lessons';
import SignRoom from './components/SignRoom';

function App() {
    const [currentView, setCurrentView] = useState('home'); // 'home' | 'phase1' | 'room'
    const [targetLetter, setTargetLetter] = useState(null);

    // All alphabet letters for Phase 1
    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    // Mock progress state (A and B are completed for demo)
    const [progress, setProgress] = useState(
        alphabet.reduce((acc, letter) => {
            acc[letter] = letter === 'A' || letter === 'B';
            return acc;
        }, {})
    );

    const handleSelectPhase1 = () => setCurrentView('phase1');

    const handleSelectTarget = (letter) => {
        setTargetLetter(letter);
        setCurrentView('room');
    };

    const handleBackToHome = () => {
        setTargetLetter(null);
        setCurrentView('home');
    };

    const handleBackToPhase1 = () => {
        setTargetLetter(null);
        setCurrentView('phase1');
    };

    const handleNextLesson = () => {
        // Mark current as completed
        setProgress(prev => ({ ...prev, [targetLetter]: true }));

        // Find next letter
        const currentIndex = alphabet.indexOf(targetLetter);
        if (currentIndex >= 0 && currentIndex < alphabet.length - 1) {
            setTargetLetter(alphabet[currentIndex + 1]);
        } else {
            // If end of alphabet, go back to phase1
            handleBackToPhase1();
        }
    };

    return (
        <div className="App flex flex-col min-h-screen bg-[#121212] font-sans selection:bg-[#1DB954] selection:text-black">
            {/* Top Navigation Bar */}
            <nav className="bg-black py-4 px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-black font-black text-xl leading-none">
                        S
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight cursor-pointer hover:text-[#1DB954] transition-colors" onClick={handleBackToHome}>
                        SignSprint
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <span className="text-[#b3b3b3] font-semibold text-sm hover:text-white cursor-pointer transition-colors" onClick={handleBackToHome}>Home</span>
                    <div className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center text-[#b3b3b3]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                {currentView === 'home' && (
                    <Dashboard onSelectPhase1={handleSelectPhase1} progress={progress} alphabet={alphabet} />
                )}

                {currentView === 'phase1' && (
                    <Phase1Lessons
                        alphabet={alphabet}
                        progress={progress}
                        onSelectTarget={handleSelectTarget}
                        onBack={handleBackToHome}
                    />
                )}

                {currentView === 'room' && (
                    <SignRoom
                        targetLetter={targetLetter}
                        userId="test-user-123"
                        alphabet={alphabet}
                        progress={progress}
                        onSelectTarget={handleSelectTarget}
                        onNext={handleNextLesson}
                        onClose={handleBackToPhase1}
                    />
                )}
            </main>
        </div>
    );
}

export default App;

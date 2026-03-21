import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Phase1Lessons from './components/Phase1Lessons';
import SignRoom from './components/SignRoom';
import Login from './components/Login';
import { supabase } from './supabaseClient';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem('signSprint_currentView') || 'home';
    });

    const [targetLetter, setTargetLetter] = useState(() => {
        return localStorage.getItem('signSprint_targetLetter') || null;
    });

    // Prevents the flash of the login screen while Supabase checks the session
    const [isLoading, setIsLoading] = useState(true);

    // Save navigation state to prevent losing your spot on refresh
    useEffect(() => {
        localStorage.setItem('signSprint_currentView', currentView);
    }, [currentView]);

    useEffect(() => {
        if (targetLetter) {
            localStorage.setItem('signSprint_targetLetter', targetLetter);
        } else {
            localStorage.removeItem('signSprint_targetLetter');
        }
    }, [targetLetter]);

    // All alphabet letters for Phase 1
    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    // Initial empty progress state
    const [progress, setProgress] = useState(
        alphabet.reduce((acc, letter) => {
            acc[letter] = false;
            return acc;
        }, {})
    );

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
            if (session?.user) fetchUserProgress(session.user.id);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
            if (session?.user) fetchUserProgress(session.user.id);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProgress = async (userId) => {
        const { data, error } = await supabase
            .from('user_progress')
            .select('letter')
            .eq('user_id', userId)
            .eq('completed', true);

        if (error) {
            console.error('Error fetching progress:', error);
            return;
        }

        if (data) {
            setProgress(prev => {
                const newProgress = { ...prev };
                data.forEach(item => {
                    newProgress[item.letter] = true;
                });
                return newProgress;
            });
        }
    };

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

    const handleSkipLesson = () => {
        // Do NOT mark as completed, just find next letter
        const currentIndex = alphabet.indexOf(targetLetter);
        if (currentIndex >= 0 && currentIndex < alphabet.length - 1) {
            setTargetLetter(alphabet[currentIndex + 1]);
        } else {
            handleBackToPhase1();
        }
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setUser(null);
        setCurrentView('home');
        setTargetLetter(null);
        setProgress(alphabet.reduce((acc, letter) => { acc[letter] = false; return acc; }, {}));

        // Clear saved view position on logout too
        localStorage.removeItem('signSprint_currentView');
        localStorage.removeItem('signSprint_targetLetter');
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#121212]">
                <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="App flex flex-col min-h-screen bg-[#121212] font-sans selection:bg-[#1DB954] selection:text-black">
                {/* Minimal Top Navigation Bar for Login */}
                <nav className="bg-black py-4 px-6 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-black font-black text-xl leading-none">
                            S
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight cursor-default">
                            SignSprint
                        </span>
                    </div>
                </nav>
                <Login onLogin={handleLogin} />
            </div>
        );
    }

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
                    <button onClick={handleLogout} className="text-[#b3b3b3] font-semibold text-sm hover:text-white cursor-pointer transition-colors">
                        Log out
                    </button>
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
                        user={user}
                        alphabet={alphabet}
                        progress={progress}
                        onSelectTarget={handleSelectTarget}
                        onNext={handleNextLesson}
                        onSkip={handleSkipLesson}
                        onClose={handleBackToPhase1}
                    />
                )}
            </main>
        </div>
    );
}

export default App;

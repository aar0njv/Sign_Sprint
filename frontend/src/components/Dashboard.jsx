import React from 'react';

const Dashboard = ({ onSelectPhase1, progress, alphabet }) => {
    const completedPhase1Count = Object.values(progress).filter(Boolean).length;
    const phase1Percentage = Math.round((completedPhase1Count / alphabet.length) * 100);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full">
            <h1 className="text-3xl font-bold mb-8 text-white tracking-tight">Your Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Phase 1 Card */}
                <div
                    onClick={onSelectPhase1}
                    className="spotify-card p-6 border-l-4 border-[#1DB954] cursor-pointer group flex flex-col justify-between min-h-[250px]"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-3xl font-bold text-white group-hover:text-[#1DB954] transition-colors">Phase 1</h2>
                            <div className="w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                                <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">The Alphabet (A-Z)</h3>
                        <p className="text-subdued line-clamp-2">Master the foundational letters of sign language. Learn to sign all 26 letters accurately.</p>
                    </div>

                    <div className="mt-8">
                        <div className="flex justify-between text-sm font-semibold mb-2">
                            <span className="text-subdued">Progress</span>
                            <span className="text-white">{phase1Percentage}%</span>
                        </div>
                        <div className="w-full bg-[#3E3E3E] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#1DB954] h-1.5 rounded-full" style={{ width: `${phase1Percentage}%` }}></div>
                        </div>
                        <div className="text-xs text-subdued mt-2">{completedPhase1Count} of {alphabet.length} lessons completed</div>
                    </div>
                </div>

                {/* Phase 2 Card (Locked/Later) */}
                <div className="spotify-card p-6 border-l-4 border-[#333] opacity-60 cursor-not-allowed flex flex-col justify-between min-h-[250px]">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-3xl font-bold text-white">Phase 2</h2>
                            <svg className="w-6 h-6 text-subdued" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Words & Phrases</h3>
                        <p className="text-subdued">Coming later. Combine letters to form words and learn common conversational phrases.</p>
                    </div>

                    <div className="mt-8">
                        <div className="inline-block px-3 py-1 border border-[#3E3E3E] text-[#b3b3b3] text-xs font-bold uppercase tracking-widest rounded-full">
                            Locked
                        </div>
                    </div>
                </div>

            </div>

            {/* Greeting / Recently played style section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Jump Back In</h2>
                <div className="flex items-center justify-center p-12 spotify-card border border-[#282828] text-center">
                    <div>
                        <div className="bg-[#282828] w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-subdued" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p className="text-white font-bold mb-2">Ready to practice?</p>
                        <p className="text-subdued text-sm mb-6">Select Phase 1 to choose a letter and start signing.</p>
                        <button onClick={onSelectPhase1} className="spotify-btn-primary px-8 py-3 uppercase tracking-widest text-sm">
                            Go to Phase 1
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

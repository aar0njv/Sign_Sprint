import React from 'react';

const Phase1Lessons = ({ alphabet, progress, onSelectTarget, onBack }) => {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full bg-gradient-to-b from-[#1E3264]/40 to-[#121212]">

            <div className="mb-8 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Phase 1: The Alphabet</h1>
            </div>

            <p className="text-subdued text-lg mb-10 max-w-2xl">
                Select a letter below to enter the Learning Lab. Show the correct hand sign to the camera to complete the lesson and progress to the next one.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {alphabet.map((letter) => {
                    const isCompleted = progress[letter];

                    return (
                        <div
                            key={letter}
                            onClick={() => onSelectTarget(letter)}
                            className="spotify-card p-4 flex flex-col items-center justify-center aspect-square cursor-pointer group relative overflow-hidden"
                        >
                            <span className={`text-5xl font-bold mb-2 ${isCompleted ? 'text-[#1DB954]' : 'text-white'}`}>
                                {letter}
                            </span>

                            {isCompleted ? (
                                <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider">Completed</span>
                            ) : (
                                <span className="text-xs font-semibold text-subdued uppercase tracking-wider">Lesson</span>
                            )}

                            {/* Hover Play Button */}
                            <div className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default Phase1Lessons;

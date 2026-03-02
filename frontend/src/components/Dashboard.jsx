import React, { useState, useEffect } from 'react';

const Dashboard = ({ onSelectTarget }) => {
    const defaultSigns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    // We'll mock the progress for now since there's no login
    const [progress, setProgress] = useState(
        defaultSigns.reduce((acc, sign) => {
            acc[sign] = false; // true if completed
            return acc;
        }, {})
    );

    const completedCount = Object.values(progress).filter(Boolean).length;
    const progressPercentage = (completedCount / defaultSigns.length) * 100;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2">
                    SignSprint Dashboard
                </h1>
                <p className="text-gray-400 text-lg">Learn Sign Language with AI-Powered Feedback</p>
            </header>

            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800 rounded-2xl p-6 mb-8 shadow-xl border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">{completedCount} of {defaultSigns.length} Signs Mastered</span>
                        <span className="font-bold text-green-400">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {defaultSigns.map((sign) => {
                        const isCompleted = progress[sign];
                        return (
                            <div
                                key={sign}
                                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 group ${isCompleted
                                        ? 'bg-gray-800 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                        : 'bg-gray-800 border-gray-700 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                                    }`}
                                onClick={() => onSelectTarget(sign)}
                            >
                                <span className={`text-5xl font-extrabold mb-4 group-hover:text-white transition-colors duration-300 ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                                    {sign}
                                </span>

                                {isCompleted ? (
                                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Mastered
                                    </div>
                                ) : (
                                    <div className="px-5 py-2 bg-blue-500 text-white text-sm font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-blue-500/30">
                                        Practice
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

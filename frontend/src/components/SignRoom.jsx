import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { supabase } from '../supabaseClient';

const SignRoom = ({
    user,
    targetLetter = 'A',
    alphabet,
    progress,
    onSelectTarget,
    onNext,
    onSkip,
    onClose
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    const [predictedLetter, setPredictedLetter] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [matchCount, setMatchCount] = useState(0);

    useEffect(() => {
        // Reset state on new letter
        setIsSuccess(false);
        setPredictedLetter(null);
        setMatchCount(0);

        wsRef.current = new WebSocket('ws://localhost:8000/ws');

        let localMatchStartTime = null;

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.Predicted_Letter) {
                setPredictedLetter(data.Predicted_Letter);

                // Track if the prediction has been continuously accurate for 5 seconds
                if (data.Predicted_Letter === targetLetter) {
                    if (!localMatchStartTime) {
                        localMatchStartTime = Date.now();
                    } else if (Date.now() - localMatchStartTime >= 5000) {
                        setIsSuccess(true);
                    }
                } else {
                    localMatchStartTime = null;
                }
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [targetLetter]);

    const triggerLevelComplete = async () => {
        if (!user) {
            console.warn('No user found, cannot save progress');
            return;
        }
        try {
            // Check if progress already exists to avoid duplicates
            const { data: existing } = await supabase
                .from('user_progress')
                .select('id')
                .eq('user_id', user.id)
                .eq('letter', targetLetter)
                .maybeSingle();

            if (!existing) {
                const { error } = await supabase
                    .from('user_progress')
                    .insert({
                        user_id: user.id,
                        letter: targetLetter,
                        completed: true
                    });

                if (error) {
                    console.error('Error inserting progress:', error);
                } else {
                    console.log('Progress successfully saved!');
                }
            } else {
                console.log('Progress already exists in database');
            }
        } catch (error) {
            console.error('Failed to save progress', error);
        }
    };

    useEffect(() => {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
            if (!canvasRef.current || !canvasRef.current.getContext) return; // Safely exit if unmounted
            const canvasCtx = canvasRef.current.getContext('2d');
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;

            canvasCtx.clearRect(0, 0, w, h);
            canvasCtx.drawImage(results.image, 0, 0, w, h);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];

                // Draw skeleton (Spotify green styling)
                canvasCtx.lineWidth = 4;
                canvasCtx.strokeStyle = 'rgba(29, 185, 84, 0.6)'; // #1DB954 with opacity

                for (let landmark of landmarks) {
                    const x = landmark.x * w;
                    const y = landmark.y * h;

                    canvasCtx.beginPath();
                    canvasCtx.arc(x, y, 3, 0, 2 * Math.PI); // Reduced from 6 to 3
                    canvasCtx.fillStyle = '#1DB954';
                    canvasCtx.fill();

                    canvasCtx.beginPath();
                    canvasCtx.arc(x, y, 1.5, 0, 2 * Math.PI); // Reduced from 3 to 1.5
                    canvasCtx.fillStyle = '#ffffff';
                    canvasCtx.fill();
                }

                // Send 63 coords to ML
                const coordinates = [];
                for (let lm of landmarks) {
                    coordinates.push(lm.x, lm.y, lm.z);
                }

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ coordinates }));
                }
            }
        });

        let camera;
        if (videoRef.current) {
            camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (!videoRef.current) return;
                    await hands.send({ image: videoRef.current });
                },
                width: 640,
                height: 480
            });
            camera.start();
        }

        return () => {
            if (camera) camera.stop();
            hands.close();
        };
    }, []);

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#121212] overflow-hidden">

            {/* Left Sidebar (Status & AI Sees) */}
            <div className="w-full md:w-72 bg-black border-r border-[#282828] flex flex-col z-20 shrink-0">
                <div className="p-6 border-b border-[#282828] flex items-center justify-between">
                    <button onClick={onClose} className="text-subdued hover:text-white transition-colors p-2 -ml-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h2 className="text-white font-bold ml-2 flex-1">Learning Lab</h2>
                </div>

                <div className="p-8 flex-1 flex flex-col items-center justify-center">
                    <p className="text-subdued uppercase tracking-widest font-bold mb-4 text-xs">Target Letter</p>
                    <div className="w-32 h-32 rounded-lg bg-[#282828] flex items-center justify-center mb-10 shadow-lg">
                        <span className="text-7xl font-black text-white">{targetLetter}</span>
                    </div>

                    <p className="text-subdued uppercase tracking-widest font-bold mb-4 text-xs">AI Sees</p>
                    <div className="relative">
                        <div className={`w-32 h-32 rounded-lg flex items-center justify-center transition-colors duration-300 border-4 ${isSuccess ? 'bg-[#1DB954]/20 border-[#1DB954]' :
                            predictedLetter === targetLetter ? 'bg-[#1DB954]/10 border-[#1DB954]/50' :
                                'bg-black border-[#333]'
                            }`}>
                            <span className={`text-6xl font-black ${isSuccess ? 'text-[#1DB954]' : 'text-white'}`}>
                                {predictedLetter || '?'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Buttons Container in Sidebar */}
                <div className="p-6 border-t border-[#282828] min-h-[120px] flex flex-col items-center justify-center bg-black gap-3">
                    <div className="text-center text-subdued text-xs px-2 mb-1">
                        {isSuccess ? "Great job! Click Proceed to save your progress." : "Hold the correct sign steadily for 5 seconds to unlock Proceed, or skip it."}
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onSkip}
                            className="flex-1 py-3 text-sm font-bold text-white border border-[#3E3E3E] rounded-full hover:border-[#F44336] hover:bg-[#282828] transition-colors"
                        >
                            Skip to Next
                        </button>
                        <button
                            onClick={async () => {
                                await triggerLevelComplete();
                                onNext();
                            }}
                            disabled={!isSuccess}
                            className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${isSuccess
                                ? 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-[0_0_15px_rgba(29,185,84,0.3)]'
                                : 'bg-[#282828] text-[#555] border border-[#333] cursor-not-allowed'
                                }`}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </div>

            {/* Video View */}
            <div className="flex-1 bg-gradient-to-br from-[#1E1E1E] to-[#121212] p-6 lg:p-12 flex items-center justify-center order-1 md:order-2">
                <div className={`
                    w-full max-w-4xl rounded-xl overflow-hidden relative shadow-2xl transition-all duration-500
                    ${isSuccess ? 'ring-8 ring-[#1DB954] shadow-[0_0_50px_rgba(29,185,84,0.4)]' :
                        (predictedLetter && predictedLetter !== targetLetter) ? 'ring-4 ring-[#E91429] shadow-[0_0_30px_rgba(233,20,41,0.2)]' :
                            'ring-1 ring-[#333]'}
                `}>
                    <video ref={videoRef} className="hidden" playsInline></video>
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto max-h-[70vh] object-cover transform scale-x-[-1] bg-black block"
                    ></canvas>

                    {/* Success Overlay Banner */}
                    <div className={`
                        absolute top-0 left-0 right-0 p-4 bg-[#1DB954] text-black font-bold text-center text-xl tracking-tight transition-transform duration-500
                        ${isSuccess ? 'translate-y-0' : '-translate-y-full'}
                    `}>
                        Lesson Completed Successfully!
                    </div>
                </div>
            </div>



        </div>
    );
};

export default SignRoom;

import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const SignRoom = ({
    userId = 'test-user-123',
    targetLetter = 'A',
    alphabet,
    progress,
    onSelectTarget,
    onNext,
    onClose
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    const [predictedLetter, setPredictedLetter] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // We'll require a brief sustain logic (e.g. 5 consecutive frames matching) to reduce flicker,
    // rather than exactly 2 seconds, to feel snappier like a quick verification
    const [matchCount, setMatchCount] = useState(0);

    useEffect(() => {
        // Reset state on new letter
        setIsSuccess(false);
        setPredictedLetter(null);
        setMatchCount(0);

        wsRef.current = new WebSocket('ws://localhost:8000/ws');
        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.Predicted_Letter) {
                setPredictedLetter(data.Predicted_Letter);
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [targetLetter]);

    useEffect(() => {
        if (isSuccess) return; // Stop checking if already solved

        if (predictedLetter === targetLetter) {
            setMatchCount(prev => {
                const newCount = prev + 1;
                // If matched for roughly 5 consecutive frames (very fast but avoids 1-frame glitches)
                if (newCount > 5) {
                    setIsSuccess(true);
                    triggerLevelComplete();
                }
                return newCount;
            });
        } else {
            setMatchCount(0);
        }
    }, [predictedLetter, targetLetter, isSuccess]);

    const triggerLevelComplete = async () => {
        try {
            await fetch('http://localhost:3001/level-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    level_id: `level_${targetLetter}`
                })
            });
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

                {/* Conditional Next Button Container in Sidebar */}
                <div className="p-6 border-t border-[#282828] h-32 flex flex-col items-center justify-center bg-black gap-2">
                    {isSuccess ? (
                        <button
                            onClick={onNext}
                            className="spotify-btn-primary w-full py-4 text-lg animate-pulse shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                        >
                            Next Lesson
                        </button>
                    ) : (
                        <>
                            <div className="text-center text-subdued text-sm px-2 mb-2">
                                Show the correct sign to unlock, or skip to the next lesson.
                            </div>
                            <button
                                onClick={onNext}
                                className="w-full py-3 text-sm font-bold text-white border border-[#3E3E3E] rounded-full hover:border-[#F44336] hover:bg-[#282828] transition-colors"
                            >
                                Skip to Next
                            </button>
                        </>
                    )}
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

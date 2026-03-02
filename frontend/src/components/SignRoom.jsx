import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const SignRoom = ({ userId = 'test-user-123', targetLetter = 'A' }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    const [predictedLetter, setPredictedLetter] = useState(null);
    const [matchStartTime, setMatchStartTime] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // 1. Initialize WebSocket Connection to FastAPI ML Service
    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:8000/ws');

        wsRef.current.onopen = () => console.log('Connected to ML Service via WebSocket');

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.Predicted_Letter) {
                setPredictedLetter(data.Predicted_Letter);
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // 2. Success Condition (Sustained Match for 2 Seconds)
    useEffect(() => {
        if (predictedLetter === targetLetter) {
            if (!matchStartTime) {
                setMatchStartTime(Date.now());
            } else {
                const duration = Date.now() - matchStartTime;
                if (duration >= 2000 && !isSuccess) {
                    setIsSuccess(true);
                    triggerLevelComplete();
                }
            }
        } else {
            // Reset timer if prediction changes
            setMatchStartTime(null);
        }
    }, [predictedLetter, targetLetter, matchStartTime, isSuccess]);

    // 3. Node.js Backend Integration
    const triggerLevelComplete = async () => {
        try {
            const response = await fetch('http://localhost:3001/level-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    level_id: `level_${targetLetter}`
                })
            });
            const result = await response.json();
            console.log('Update Success:', result);
        } catch (error) {
            console.error('Failed to update progress to Node backend:', error);
        }
    };

    // 4. MediaPipe Camera & Pose Extraction
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
            if (!canvasRef.current) return;
            const canvasCtx = canvasRef.current.getContext('2d');
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];

                // Draw dots on screen for UX
                for (let landmark of landmarks) {
                    canvasCtx.beginPath();
                    canvasCtx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
                    canvasCtx.fillStyle = '#00FF00'; // Green dots for styling
                    canvasCtx.fill();
                }

                // Extract exactly 63 coordinates into a flat list
                const coordinates = [];
                for (let lm of landmarks) {
                    coordinates.push(lm.x, lm.y, lm.z);
                }

                // Emit to FastAPI ML service
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ coordinates }));
                }
            }
        });

        let camera;
        if (videoRef.current) {
            camera = new Camera(videoRef.current, {
                onFrame: async () => {
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

    // 5. UI/UX: Video Feed, Overlay
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-2">Learning Lab</h1>
            <h2 className="text-xl text-gray-300 mb-6">Target Sign: <span className="font-bold text-blue-400 text-2xl">{targetLetter}</span></h2>

            <div className={`relative rounded-xl overflow-hidden border-8 transition-colors duration-300 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
                {/* Green/Red Overlay for instant visual feedback */}
                <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-300 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <video
                    ref={videoRef}
                    style={{ display: 'none' }}
                    playsInline
                ></video>
                <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    className="transform scale-x-[-1] object-cover" // Mirrored for intuitive feedback
                ></canvas>
            </div>

            <div className="mt-8 text-center">
                <h3 className="text-lg text-gray-400">Model Prediction:</h3>
                <div className="text-4xl font-extrabold text-white my-2">
                    {predictedLetter || '--'}
                </div>
                {isSuccess && (
                    <div className="text-green-400 font-bold text-xl mt-4 animate-bounce">
                        🎉 Level Completed! Progress Saved! 🎉
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignRoom;

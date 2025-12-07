import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const AttentivenessTracker = ({ sessionId, isActive = true }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState("Initializing...");
    const [lastScore, setLastScore] = useState(null);
    const [isAttentive, setIsAttentive] = useState(true);

    // 1. Setup Camera
    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                // We ask for a low resolution to save bandwidth/processing power
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 320, height: 240 } 
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setStatus("Tracking Active");
            } catch (err) {
                console.error("Camera Error:", err);
                setStatus("Camera Error");
            }
        };

        if (isActive) startCamera();

        // Cleanup: Stop camera when component unmounts
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [isActive]);

    // 2. Analysis Loop (Every 5 seconds)
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(async () => {
            await captureAndAnalyze();
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isActive, sessionId]);

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Draw current video frame to hidden canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas content to Blob (JPEG Image)
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            // Prepare Form Data for Python API
            const formData = new FormData();
            formData.append('file', blob, 'capture.jpg');

            try {
                // A. Send to Python AI Service
                // Note: Ensure your Python API is running on localhost:8000
                // If this fails, ensure CORS is enabled on the Python side
                const pyResponse = await axios.post('http://127.0.0.1:8000/analyze', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const result = pyResponse.data;
                
                // Update local state for UI
                setLastScore(result.score);
                setIsAttentive(result.is_attentive);

                // B. Send Result to C# Backend (to save in SQL DB)
                const token = sessionStorage.getItem('token');
                if (token) {
                    await axios.post('https://localhost:7145/api/Monitoring/record-attention', {
                        score: result.score,
                        isAttentive: result.is_attentive,
                        sessionId: sessionId || "General"
                    }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }

                // C. Optional: Visual warning if distracted
                if (!result.is_attentive) {
                    console.warn("User appears distracted.");
                }

            } catch (error) {
                console.error("AI Analysis Error (Is Python API running?):", error);
                setStatus("AI Service Offline");
            }
        }, 'image/jpeg', 0.8); // 0.8 quality
    };

    if (!isActive) return null;

    return (
        <div className="card shadow-sm border p-3 mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-eye me-2 text-primary"></i>AI Proctor
                </h6>
                <span className={`badge ${status === "Tracking Active" ? "bg-success" : "bg-warning text-dark"}`}>
                    {status}
                </span>
            </div>
            
            {/* Video Container */}
            <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                
                {/* Live Video Feed (Mirrored) */}
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    style={{ width: '100%', transform: 'scaleX(-1)', display: 'block' }} 
                />
                
                {/* Hidden Canvas for processing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {/* Live Score Overlay */}
                {lastScore !== null && (
                    <div 
                        className={`position-absolute bottom-0 start-0 w-100 p-2 text-center small fw-bold text-white`}
                        style={{ 
                            backgroundColor: isAttentive ? 'rgba(25, 135, 84, 0.8)' : 'rgba(220, 53, 69, 0.8)' 
                        }}
                    >
                        {isAttentive ? (
                            <span><i className="bi bi-check-circle me-1"></i> Focused ({Math.round(lastScore * 100)}%)</span>
                        ) : (
                            <span><i className="bi bi-exclamation-triangle me-1"></i> Distracted ({Math.round(lastScore * 100)}%)</span>
                        )}
                    </div>
                )}
            </div>
            <div className="text-muted small mt-2 text-center" style={{fontSize: '0.75rem'}}>
                Your focus is being monitored for attendance.
            </div>
        </div>
    );
};

export default AttentivenessTracker;
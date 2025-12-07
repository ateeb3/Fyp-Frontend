import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const StudentSessionReport = () => {
    const { sessionId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyReport = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const sid = sessionId || "session-123"; 
                const response = await axios.get(`https://localhost:7145/api/Monitoring/my-summary/${sid}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyReport();
    }, [sessionId]);

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;
    
    if (!data) return (
        <div className="container mt-5 text-center">
            <div className="alert alert-info border-0 shadow-sm rounded-4">No participation data found for this session.</div>
        </div>
    );

    const isGoodPerformance = data.focusPercentage > 70;

    return (
        <div style={{backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="container" style={{ maxWidth: '550px' }}>
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className={`card-header p-4 text-center text-white border-0`} 
                         style={{background: isGoodPerformance ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                        <h4 className="mb-1 fw-bold">Session Summary</h4>
                        <p className="mb-0 opacity-75 small text-uppercase fw-bold">{data.studentName}</p>
                    </div>
                    
                    <div className="card-body p-5 text-center bg-white">
                        <h6 className="text-secondary text-uppercase small fw-bold mb-4" style={{letterSpacing:'1px'}}>Your Focus Score</h6>
                        
                        <div className="position-relative d-inline-flex justify-content-center align-items-center mb-5">
                            <svg width="160" height="160" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                <circle 
                                    cx="80" cy="80" r="70" fill="none" 
                                    stroke={isGoodPerformance ? "#10b981" : "#f59e0b"} 
                                    strokeWidth="12" 
                                    strokeDasharray="440" 
                                    strokeDashoffset={440 - (440 * data.focusPercentage) / 100}
                                    transform="rotate(-90 80 80)"
                                    style={{transition: 'stroke-dashoffset 1.5s ease-out', strokeLinecap: 'round'}}
                                />
                            </svg>
                            <div className="position-absolute text-center">
                                <div className="display-4 fw-bold text-dark" style={{lineHeight:'1'}}>{data.focusPercentage}</div>
                                <span className="small text-muted fw-bold">% FOCUS</span>
                            </div>
                        </div>

                        <div className="row g-0 rounded-3 overflow-hidden border">
                            <div className="col-6 border-end p-3 bg-light">
                                <h3 className="mb-0 fw-bold text-dark">{data.averageScore}%</h3>
                                <small className="text-muted fw-bold text-uppercase" style={{fontSize:'0.65rem'}}>Avg. Attention</small>
                            </div>
                            <div className="col-6 p-3 bg-light">
                                <h3 className={`mb-0 fw-bold ${isGoodPerformance ? 'text-success' : 'text-warning'}`}>
                                    {isGoodPerformance ? "High" : "Avg"}
                                </h3>
                                <small className="text-muted fw-bold text-uppercase" style={{fontSize:'0.65rem'}}>Engagement Level</small>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card-footer bg-white p-4 text-center border-0">
                        <p className="text-muted small mb-0">
                            {isGoodPerformance 
                                ? "✨ Excellent work! You maintained high focus throughout the session." 
                                : "💡 Tip: Try to minimize background distractions for better focus next time."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSessionReport;
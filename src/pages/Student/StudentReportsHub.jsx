import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentReportsHub = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const response = await axios.get('https://localhost:7145/api/Meetings/my-history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMeetings(response.data);
            } catch (error) {
                console.error("Error loading history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div style={{backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 0'}}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="mb-5 text-center">
                    <h2 className="fw-bold text-dark mb-1" style={{color: '#1e293b'}}>Performance History</h2>
                    <p className="text-muted">Review your engagement and focus scores from past sessions.</p>
                </div>

                {meetings.length === 0 ? (
                    <div className="text-center p-5 bg-white rounded-4 shadow-sm border-0">
                        <h5 className="text-muted mb-0">No attendance history found.</h5>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {meetings.map((m) => (
                            <div key={m.meetingLink} className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{transition: 'transform 0.2s'}}>
                                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-2">
                                                {m.course}
                                            </span>
                                            <small className="text-muted fw-bold text-uppercase" style={{fontSize:'0.7rem'}}>
                                                {new Date(m.date).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <h5 className="fw-bold mb-0 text-dark">{m.title}</h5>
                                    </div>
                                    <button 
                                        className="btn btn-outline-dark rounded-pill px-4 fw-bold"
                                        onClick={() => navigate(`/student/reports/${m.meetingLink}`)}
                                        style={{borderWidth: '2px'}}
                                    >
                                        View Score
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentReportsHub;
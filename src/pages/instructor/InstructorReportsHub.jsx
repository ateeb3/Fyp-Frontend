import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InstructorReportsHub = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const response = await axios.get('https://localhost:7145/api/Meetings/history', {
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
        <div className="container py-5" style={{ maxWidth: '1000px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="mb-5">
                <h2 className="fw-bold text-dark mb-1" style={{color: '#1e293b'}}>
                    <i className="bi bi-bar-chart-steps text-primary me-2"></i>Session Reports
                </h2>
                <p className="text-muted">Select a past session to view student attentiveness analytics.</p>
            </div>

            {meetings.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                    <h5 className="text-muted">No session history found.</h5>
                </div>
            ) : (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light text-secondary small text-uppercase">
                                <tr>
                                    <th className="ps-4 py-3 border-0">Date</th>
                                    <th className="border-0">Course</th>
                                    <th className="border-0">Session Title</th>
                                    <th className="border-0">Status</th>
                                    <th className="text-end pe-4 border-0">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meetings.map((m) => (
                                    <tr key={m.meetingLink} style={{borderBottom: '1px solid #f8fafc'}}>
                                        <td className="ps-4 fw-bold text-dark">
                                            {new Date(m.date).toLocaleDateString()}
                                            <div className="small text-muted">{new Date(m.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-secondary border">{m.course}</span>
                                        </td>
                                        <td className="fw-bold text-primary">{m.title}</td>
                                        <td>
                                            {m.isActive ? (
                                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Live Now</span>
                                            ) : (
                                                <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">Ended</span>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                                                onClick={() => navigate(`/instructor/reports/${m.meetingLink}`)}
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorReportsHub;
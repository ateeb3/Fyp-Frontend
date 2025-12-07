import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const InstructorSessionReport = () => {
    const { sessionId } = useParams(); 
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            const token = sessionStorage.getItem('token');
            try {
                // If sessionId is undefined (testing), use a fallback or handle error
                const sid = sessionId || "session-123"; 
                const response = await axios.get(`https://localhost:7145/api/Monitoring/session-summary/${sid}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setReportData(response.data);
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [sessionId]);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    const classAverage = reportData.length > 0 
        ? Math.round(reportData.reduce((acc, curr) => acc + curr.focusPercentage, 0) / reportData.length) 
        : 0;

    return (
        <div className="container py-5" style={{ maxWidth: '1000px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0" style={{color: '#1e293b'}}>
                        <i className="bi bi-bar-chart-line-fill me-2 text-primary"></i>Session Report
                    </h2>
                    <p className="text-muted small mb-0">Analytics for Session ID: {sessionId}</p>
                </div>
                
                <div className="d-flex align-items-center bg-white p-3 rounded-4 shadow-sm">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary"><i className="bi bi-lightning-charge-fill"></i></div>
                    <div>
                        <div className="small text-muted fw-bold text-uppercase">Class Focus</div>
                        <div className="h4 fw-bold text-dark mb-0">{classAverage}%</div>
                    </div>
                </div>
            </div>

            {reportData.length === 0 ? (
                <div className="alert alert-warning text-center border-0 shadow-sm rounded-4">No attention data recorded for this session.</div>
            ) : (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light text-secondary text-uppercase small">
                                <tr>
                                    <th className="ps-4 py-3 border-0">Student Name</th>
                                    <th className="border-0">Avg. Attention Score</th>
                                    <th className="border-0">Focus Consistency</th>
                                    <th className="text-end pe-4 border-0">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((student) => (
                                    <tr key={student.studentId} style={{borderBottom: '1px solid #f8fafc'}}>
                                        <td className="ps-4 fw-bold text-dark">{student.studentName}</td>
                                        <td style={{width: '35%'}}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="progress flex-grow-1" style={{height: '8px', borderRadius:'10px', backgroundColor: '#f1f5f9'}}>
                                                    <div 
                                                        className={`progress-bar rounded-pill ${student.averageScore > 70 ? 'bg-success' : student.averageScore > 40 ? 'bg-warning' : 'bg-danger'}`} 
                                                        style={{width: `${student.averageScore}%`}}
                                                    ></div>
                                                </div>
                                                <span className="small fw-bold text-muted" style={{width: '40px'}}>{student.averageScore}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${student.focusPercentage > 75 ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-dark border`}>
                                                {student.focusPercentage}% Focused Time
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            {student.focusPercentage < 50 ? (
                                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Distracted</span>
                                            ) : (
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Engaged</span>
                                            )}
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

export default InstructorSessionReport;
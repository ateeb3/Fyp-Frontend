import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSubmitTask from './StudentSubmitTask';

const StudentSubmittedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const token = sessionStorage.getItem('token');
            try {
                const res = await axios.get('https://localhost:7145/api/Tasks/my-tasks?status=submitted', { headers: { 'Authorization': `Bearer ${token}` } });
                setTasks(res.data.data || []);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div style={{backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 0'}}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="mb-5 text-center">
                    <h2 className="fw-bold mb-1" style={{color: '#1e293b'}}>Submission History</h2>
                    <p className="text-muted">Track your completed assignments and grades.</p>
                </div>

                {tasks.length === 0 ? (
                    <div className="text-center p-5 bg-white rounded-4 shadow-sm">
                        <p className="text-muted mb-0">No submitted tasks yet.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {tasks.map(t => (
                            <div key={t.taskId} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-header bg-white border-bottom p-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold text-dark mb-0">{t.title}</h5>
                                        <span className="badge bg-light text-secondary border">{t.courseName}</span>
                                    </div>
                                </div>
                                <div className="card-body p-4 bg-light bg-opacity-25">
                                    <StudentSubmitTask taskId={t.taskId} existingSubmission={t.mySubmission} dueDate={t.dueDate} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default StudentSubmittedTasks;
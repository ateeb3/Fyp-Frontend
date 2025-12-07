import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import AssignTask from './AssignTask'; 
import GradeSubmissionModal from './GradeSubmissionModal'; // 🔥 Import the new modal

const TeacherGradingDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Assign Task Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Grading Modal State
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const token = sessionStorage.getItem('token');

    const fetchTasks = async () => {
        try {
            const response = await axios.get('https://localhost:7145/api/Tasks/created-tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error("Error loading tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTasks();
    }, [token]);

    // Handle Opening the Grade Modal
    const handleOpenGrading = (submission) => {
        setSelectedSubmission(submission);
        setShowGradeModal(true);
    };

    const handleGradingSuccess = () => {
        fetchTasks(); // Reload data to show new grade
        // Modal closes automatically via the GradeSubmissionModal logic
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
            
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Assignments & Grading</h2>
                    <p className="text-muted mb-0">Manage tasks and grade student submissions</p>
                </div>
                <button 
                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                    onClick={() => setShowAssignModal(true)}
                >
                    <i className="bi bi-plus-lg me-2"></i>Assign New Task
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border">
                    <h5 className="text-muted">No assignments created yet.</h5>
                </div>
            ) : (
                <div className="d-flex flex-column gap-5">
                    {tasks.map((task) => (
                        <div key={task.taskId} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            {/* Task Header */}
                            <div className="card-header bg-white border-bottom p-4">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <span className="badge bg-light text-primary border mb-2">{task.courseName}</span>
                                        <h4 className="fw-bold mb-1">{task.title}</h4>
                                        <small className="text-muted">Due: {new Date(task.dueDate).toLocaleString()}</small>
                                    </div>
                                    <div className="text-end">
                                        <div className="h2 fw-bold mb-0 text-primary">{task.submissions.length}</div>
                                        <small className="text-muted">Submissions</small>
                                    </div>
                                </div>
                            </div>

                            {/* Submissions Table */}
                            <div className="card-body p-0">
                                {task.submissions.length === 0 ? (
                                    <div className="p-4 text-center text-muted fst-italic">No students have submitted yet.</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="ps-4">Student</th>
                                                    <th>Date</th>
                                                    <th>Submission</th>
                                                    <th>Grade</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {task.submissions.map(sub => (
                                                    <tr key={sub.submissionId}>
                                                        <td className="ps-4 fw-bold">{sub.studentName}</td>
                                                        <td className="small text-muted">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                                        <td>
                                                            {sub.submissionUrl ? (
                                                                <a href={`https://localhost:7145${sub.submissionUrl}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill">
                                                                    <i className="bi bi-download me-1"></i> File
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted small">Text</span>
                                                            )}
                                                            {sub.comments && (
                                                                <div className="small text-muted fst-italic mt-1" style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                                    "{sub.comments}"
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {sub.grade !== null ? (
                                                                <span className="badge bg-success bg-opacity-10 text-success border border-success">{sub.grade}%</span>
                                                            ) : (
                                                                <span className="badge bg-warning text-dark bg-opacity-25 border border-warning">Pending</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-dark rounded-pill px-3"
                                                                onClick={() => handleOpenGrading(sub)}
                                                            >
                                                                <i className="bi bi-pencil-square me-1"></i> Grade
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Assigning New Task */}
            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg" centered>
                <Modal.Body className="p-0">
                    <AssignTask /> 
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => {
                        setShowAssignModal(false);
                        fetchTasks(); 
                    }}>
                        Close & Refresh List
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 🔥 Modal for Grading */}
            <GradeSubmissionModal 
                show={showGradeModal}
                submission={selectedSubmission}
                onClose={() => setShowGradeModal(false)}
                onSuccess={handleGradingSuccess}
            />

        </div>
    );
};

export default TeacherGradingDashboard;
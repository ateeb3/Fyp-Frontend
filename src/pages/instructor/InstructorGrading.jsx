import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GradeSubmissionModal from './GradeSubmissionModal';
import EditTaskModal from './EditTaskModal';
// Ensure you have these imports if you use them, or remove the modal components if not yet created.
// import { Modal, Button } from 'react-bootstrap'; 

const InstructorGrading = () => {
    // ----------------------------------------
    // 1. STATE & LOGIC (Restored)
    // ----------------------------------------
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modals State
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [selectedTotalMarks, setSelectedTotalMarks] = useState(100);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

    const token = sessionStorage.getItem('token');

    // Fetch Tasks Function
    const fetchTasks = async (pageNum = 1) => {
        setLoading(true);
        try {
            // Note: Adjust the API URL if your backend paging is different
            const response = await axios.get(`https://localhost:7145/api/Tasks/created-tasks?page=${pageNum}&search=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Handle different backend response structures safely
            if (response.data && response.data.data) {
                setTasks(response.data.data);
                setTotalPages(response.data.totalPages || 1);
                setPage(response.data.currentPage || 1);
            } else if (Array.isArray(response.data)) {
                // Fallback if backend returns just an array
                setTasks(response.data);
            }
        } catch (error) {
            console.error("Error loading tasks", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load & Updates
    useEffect(() => {
        if (token) fetchTasks(page);
    }, [token, page, searchQuery]);

    // Handlers
    const handleDeleteTask = async (taskId) => {
        if(!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await axios.delete(`https://localhost:7145/api/Tasks/delete/${taskId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchTasks(page);
        } catch (error) {
            alert(error.response?.data || "Failed to delete task.");
        }
    };

    const handleEditTask = (task) => {
        setSelectedTaskForEdit(task);
        setShowEditModal(true);
    };

    const handleOpenGrading = (submission, totalMarks) => {
        setSelectedSubmission(submission);
        setSelectedTotalMarks(totalMarks || 100);
        setShowGradeModal(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // ----------------------------------------
    // 2. RENDER (The New Theme)
    // ----------------------------------------
    
    // Prevent rendering while loading specific data to avoid "undefined" errors
    if (loading && tasks.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: '1100px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1" style={{color: '#1e293b'}}>Gradebook</h2>
                    <p className="text-muted mb-0">Review assignments and track student performance.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border-0 p-1">
                    <span className="input-group-text bg-white border-0 ps-3"><i className="bi bi-search text-muted"></i></span>
                    <input 
                        type="text" 
                        className="form-control border-0 shadow-none" 
                        placeholder="Search by task title..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>
            </div>

            <div className="d-flex flex-column gap-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-5 text-muted">No assignments found.</div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.taskId} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            {/* Task Header Strip */}
                            <div className="p-4 d-flex justify-content-between align-items-center" style={{background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid #f1f5f9'}}>
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 rounded-pill" style={{fontWeight:'600'}}>{task.courseName}</span>
                                        <span className="small text-muted fw-bold">Max: {task.totalMarks} Pts</span>
                                    </div>
                                    <h4 className="fw-bold mb-0 text-dark">{task.title}</h4>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light rounded-circle shadow-sm text-muted" onClick={() => handleEditTask(task)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-light rounded-circle shadow-sm text-danger" onClick={() => handleDeleteTask(task.taskId)}><i className="bi bi-trash"></i></button>
                                </div>
                            </div>

                            {/* Submission List */}
                            <div className="card-body p-0">
                                {(!task.submissions || task.submissions.length === 0) ? (
                                    <div className="p-5 text-center text-muted bg-white">No submissions received yet.</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="bg-light text-secondary small text-uppercase">
                                                <tr>
                                                    <th className="ps-4 py-3 border-0">Student</th>
                                                    <th className="border-0">Date</th>
                                                    <th className="border-0">Status</th>
                                                    <th className="text-end pe-4 border-0">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {task.submissions.map(sub => (
                                                    <tr key={sub.submissionId} style={{borderBottom: '1px solid #f8fafc'}}>
                                                        <td className="ps-4 fw-bold text-dark py-3">{sub.studentName}</td>
                                                        <td className="text-muted small">
                                                            {new Date(sub.submittedAt).toLocaleDateString()}
                                                            {sub.isLate && <span className="badge bg-danger rounded-pill ms-2" style={{fontSize:'0.6rem'}}>LATE</span>}
                                                        </td>
                                                        <td>
                                                            {sub.grade !== null ? 
                                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">{sub.grade} / {task.totalMarks}</span> : 
                                                                <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3">Pending</span>
                                                            }
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => handleOpenGrading(sub, task.totalMarks)}>
                                                                {sub.grade !== null ? 'Update' : 'Grade'}
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
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
                    <button className="btn btn-light border rounded-pill px-4" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Previous</button>
                    <span className="fw-bold text-muted">Page {page} of {totalPages}</span>
                    <button className="btn btn-light border rounded-pill px-4" disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>Next</button>
                </div>
            )}
            
            <GradeSubmissionModal show={showGradeModal} submission={selectedSubmission} maxMarks={selectedTotalMarks} onClose={() => setShowGradeModal(false)} onSuccess={() => fetchTasks(page)} />
            <EditTaskModal show={showEditModal} handleClose={() => setShowEditModal(false)} task={selectedTaskForEdit} onUpdate={() => fetchTasks(page)} />
        </div>
    );
};

export default InstructorGrading;
import React, { useState } from 'react';
import axios from 'axios';

const StudentSubmitTask = ({ taskId, existingSubmission, dueDate }) => {
    const [submissionText, setSubmissionText] = useState(existingSubmission?.comments || '');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const isExpired = dueDate ? new Date(dueDate) < new Date() : false;

    // VIEW MODE (Submitted)
    if (existingSubmission && !isEditing) {
        const { submittedAt, grade, feedback } = existingSubmission;
        const isGraded = grade !== null && grade !== undefined;

        return (
            <div className="bg-white border-0 shadow-sm rounded-4 p-4 mt-3 position-relative overflow-hidden">
                <div className="position-absolute top-0 start-0 h-100 bg-success" style={{ width: '5px' }}></div>
                
                <div className="d-flex justify-content-between align-items-start mb-3 ps-2">
                    <div>
                        <h6 className="fw-bold text-success mb-1">
                            <i className="bi bi-check-circle-fill me-2"></i>Submitted
                        </h6>
                        <small className="text-muted d-block">
                            Last updated: {new Date(submittedAt).toLocaleString()}
                        </small>
                    </div>
                    {isGraded ? (
                        <div className="text-end">
                            <span className="d-block h4 fw-bold text-dark mb-0">{grade}%</span>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Graded</span>
                        </div>
                    ) : (
                        <span className="badge bg-warning text-dark bg-opacity-10 border border-warning border-opacity-25">Pending Grade</span>
                    )}
                </div>

                {isGraded && feedback && (
                    <div className="mt-3 p-3 rounded-3 border ms-2" style={{backgroundColor: '#f8fafc'}}>
                        <small className="fw-bold text-uppercase text-secondary" style={{fontSize: '0.7rem'}}>Teacher Feedback</small>
                        <p className="mb-0 mt-1 text-dark fst-italic">"{feedback}"</p>
                    </div>
                )}
                
                <div className="mt-3 ms-2">
                    {existingSubmission.submissionUrl && (
                        <div className="mb-2">
                            <a href={`https://localhost:7145${existingSubmission.submissionUrl}`} target="_blank" rel="noreferrer" 
                               className="btn btn-sm btn-outline-secondary rounded-pill px-3 border">
                                <i className="bi bi-file-earmark-check me-2"></i>View Submitted File
                            </a>
                        </div>
                    )}
                    {existingSubmission.comments && (
                        <p className="small text-muted mb-0 border-start border-2 ps-2">"{existingSubmission.comments}"</p>
                    )}
                </div>

                <div className="d-flex justify-content-end mt-3">
                    {!isGraded && !isExpired ? (
                        <button className="btn btn-sm btn-light text-primary fw-bold rounded-pill px-3 shadow-sm border" onClick={() => setIsEditing(true)}>
                            <i className="bi bi-pencil-square me-2"></i> Resubmit
                        </button>
                    ) : (
                        <span className="small text-muted fst-italic bg-light px-2 py-1 rounded">
                            {isGraded ? "Graded (Locked)" : "Deadline Passed"}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // DEADLINE PASSED
    if (isExpired && !existingSubmission && !isEditing) {
        return (
            <div className="bg-light bg-opacity-50 rounded-4 p-4 mt-3 border border-danger border-opacity-25 text-center">
                <i className="bi bi-clock-history text-danger fs-1 opacity-25 mb-2 d-block"></i>
                <h6 className="fw-bold text-danger">Submission Closed</h6>
                <p className="small text-muted mb-0">The deadline for this assignment has passed.</p>
            </div>
        );
    }

    // EDIT/SUBMIT FORM
    const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Uploading...' });
        const token = sessionStorage.getItem('token'); 

        try {
            const formData = new FormData();
            formData.append('taskId', taskId);
            formData.append('comments', submissionText); 
            if (file) formData.append('file', file);

            await axios.post('https://localhost:7145/api/Tasks/submit', formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            setStatus({ type: 'success', message: 'Success! Refreshing...' });
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: error.response?.data || "Submission failed." });
        }
    };

    return (
        <div className="bg-white border rounded-4 p-4 mt-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0">
                    <i className="bi bi-cloud-arrow-up-fill me-2 text-primary"></i>
                    {existingSubmission ? "Update Submission" : "Submit Work"}
                </h6>
                {isEditing && <button type="button" className="btn-close" onClick={() => setIsEditing(false)}></button>}
            </div>
            
            {status.message && (
                <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small border-0 mb-3 rounded-3`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label small text-uppercase text-secondary fw-bold">Attach File</label>
                    <input type="file" className="form-control bg-light border-0" onChange={handleFileChange} />
                    {existingSubmission && !file && <div className="form-text small">Leave empty to keep current file.</div>}
                </div>
                
                <div className="mb-3">
                    <label className="form-label small text-uppercase text-secondary fw-bold">Comments</label>
                    <textarea rows="2" className="form-control bg-light border-0" placeholder="Add a note for your instructor..." value={submissionText} onChange={(e) => setSubmissionText(e.target.value)}></textarea>
                </div>

                <div className="text-end">
                    <button type="submit" disabled={status.type === 'loading'} 
                        className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm border-0"
                        style={{background: isHovered ? '#4338ca' : 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', transition: 'all 0.2s'}}
                        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                        {status.type === 'loading' ? 'Uploading...' : (existingSubmission ? 'Update Submission' : 'Submit Task')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentSubmitTask;
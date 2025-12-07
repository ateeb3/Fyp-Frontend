import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const GradeSubmissionModal = ({ show, submission, maxMarks, onClose, onSuccess }) => {
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (submission) {
            setGrade(submission.grade || '');
            setFeedback(submission.feedback || '');
            setError('');
        }
    }, [submission]);

    const quickFeedbacks = ["Excellent work!", "Good effort.", "Missing required sections.", "Late submission deduction.", "Great analysis."];

    const addFeedback = (text) => {
        setFeedback(prev => prev ? `${prev} ${text}` : text);
    };

    const handleGradeSubmit = async () => {
        if(parseFloat(grade) > maxMarks) {
            setError(`Grade cannot exceed ${maxMarks}.`);
            return;
        }
        if(parseFloat(grade) < 0) {
            setError("Grade cannot be negative.");
            return;
        }

        setIsSubmitting(true);
        setError('');
        const token = sessionStorage.getItem('token'); 

        try {
            const payload = {
                grade: parseFloat(grade),
                feedback: feedback
            };

            await axios.put(`https://localhost:7145/api/Tasks/grade/${submission.submissionId}`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error submitting grade:", error);
            setError('Failed to submit grade. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!submission) return null;

    return (
        <Modal show={show} onHide={onClose} centered size="lg" contentClassName="border-0 rounded-4 shadow-lg">
            <Modal.Header closeButton className="border-0 bg-light rounded-top-4">
                <Modal.Title className="fw-bold text-dark">
                    <i className="bi bi-mortarboard-fill text-primary me-2"></i>Grading
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {/* Student Info Card */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3" style={{backgroundColor: '#f1f5f9'}}>
                    <div>
                        <h5 className="fw-bold mb-0 text-dark">{submission.studentName}</h5>
                        <small className="text-muted">Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</small>
                    </div>
                    {submission.isLate && <span className="badge bg-danger rounded-pill px-3">LATE</span>}
                </div>

                {/* Submission Content */}
                <div className="mb-4">
                    <label className="text-secondary small fw-bold text-uppercase mb-2">Student Submission</label>
                    <div className="p-3 border rounded-3 bg-white">
                        {submission.comments ? (
                            <div className="mb-2">
                                <i className="bi bi-quote text-muted me-2"></i>
                                <span className="fst-italic text-dark">"{submission.comments}"</span>
                            </div>
                        ) : (
                            <div className="text-muted small mb-2">No text comments provided.</div>
                        )}

                        {submission.submissionUrl && (
                            <div className="mt-2 pt-2 border-top">
                                <a href={`https://localhost:7145${submission.submissionUrl}`} target="_blank" rel="noreferrer" 
                                   className="btn btn-sm btn-outline-primary rounded-pill fw-bold">
                                    <i className="bi bi-file-earmark-arrow-down me-2"></i>Download File
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {error && <Alert variant="danger" className="border-0 rounded-3">{error}</Alert>}

                <div className="row g-4">
                    <div className="col-md-4">
                        <Form.Group>
                            <Form.Label className="fw-bold text-secondary small text-uppercase">Grade</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max={maxMarks}
                                    className="form-control fs-4 fw-bold text-center text-primary border-primary bg-light"
                                    placeholder="0"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                />
                                <span className="input-group-text bg-white text-muted border-start-0">/ {maxMarks}</span>
                            </div>
                        </Form.Group>
                    </div>
                    <div className="col-md-8">
                        <Form.Group>
                            <Form.Label className="fw-bold text-secondary small text-uppercase">Feedback</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Write feedback..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="bg-light border-0"
                            />
                            {/* Quick Feedback Chips */}
                            <div className="mt-2 d-flex gap-2 flex-wrap">
                                {quickFeedbacks.map((qf, i) => (
                                    <span key={i} className="badge bg-white text-secondary border cursor-pointer hover-shadow" 
                                          style={{cursor:'pointer'}} onClick={() => addFeedback(qf)}>
                                        + {qf}
                                    </span>
                                ))}
                            </div>
                        </Form.Group>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="light" onClick={onClose} className="rounded-pill px-4 fw-bold text-muted">
                    Cancel
                </Button>
                <Button 
                    onClick={handleGradeSubmit} 
                    disabled={isSubmitting}
                    className="rounded-pill px-4 fw-bold text-white border-0"
                    style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}
                >
                    {isSubmitting ? 'Saving...' : 'Submit Grade'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GradeSubmissionModal;
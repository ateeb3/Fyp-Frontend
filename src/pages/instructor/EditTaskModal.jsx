import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const EditTaskModal = ({ show, handleClose, task, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        courseOfferingId: '',
        totalMarks: '100',
        allowLateSubmissions: false
    });

    const [timeState, setTimeState] = useState({
        hour: '11',
        minute: '59',
        ampm: 'PM'
    });

    const [attachment, setAttachment] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const token = sessionStorage.getItem("token");

    // Populate Form when Task Changes
    useEffect(() => {
        if (task) {
            // Convert UTC to Local Date object
            const localDate = new Date(task.dueDate);
            
            // Extract Date Part YYYY-MM-DD
            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');
            const datePart = `${year}-${month}-${day}`;

            // Extract Time Part for UI
            let hours = localDate.getHours();
            const minutes = String(localDate.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'

            setTimeState({
                hour: String(hours),
                minute: minutes,
                ampm: ampm
            });

            setFormData({
                title: task.title,
                description: task.description || '',
                dueDate: `${datePart}T${hours}:${minutes}`, // Intermediate state
                courseOfferingId: task.courseOfferingId || '', 
                totalMarks: task.totalMarks,
                allowLateSubmissions: task.allowLateSubmissions
            });
        }
    }, [task]);

    const handleDateChange = (e) => {
        const dateVal = e.target.value; 
        updateDateTime(dateVal, timeState.hour, timeState.minute, timeState.ampm);
    };

    const handleTimeUIChange = (field, value) => {
        const newTimeState = { ...timeState, [field]: value };
        setTimeState(newTimeState);
        
        const currentIso = formData.dueDate || new Date().toISOString();
        const datePart = currentIso.split('T')[0];
        
        updateDateTime(datePart, newTimeState.hour, newTimeState.minute, newTimeState.ampm);
    };

    const updateDateTime = (datePart, hour, minute, ampm) => {
        let hour24 = parseInt(hour);
        if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
        if (ampm === 'AM' && hour24 === 12) hour24 = 0;
        const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
        setFormData(prev => ({ ...prev, dueDate: `${datePart}T${timeString}` }));
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Updating task...' });

        try {
            const submissionData = new FormData();
            submissionData.append('title', formData.title);
            submissionData.append('description', formData.description);
            
            // Reconstruct Date Object for UTC conversion
            const datePart = formData.dueDate.split('T')[0];
            let hour24 = parseInt(timeState.hour);
            if (timeState.ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (timeState.ampm === 'AM' && hour24 === 12) hour24 = 0;
            
            const localDate = new Date(datePart);
            localDate.setHours(hour24, parseInt(timeState.minute));
            const utcDate = localDate.toISOString();

            submissionData.append('dueDate', utcDate);
            submissionData.append('totalMarks', formData.totalMarks);
            submissionData.append('allowLateSubmissions', formData.allowLateSubmissions);
            
            if (attachment) {
                submissionData.append('file', attachment);
            }

            await axios.put(`https://localhost:7145/api/Tasks/edit/${task.taskId}`, submissionData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setStatus({ type: 'success', message: 'Task updated successfully!' });
            onUpdate(); // Refresh parent
            setTimeout(() => {
                setStatus({ type: '', message: '' });
                handleClose();
            }, 1000);

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to update task.' });
        }
    };

    if (!task) return null;
    const dateValue = formData.dueDate ? formData.dueDate.split('T')[0] : '';

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered contentClassName="border-0 rounded-4 shadow-lg">
            <Modal.Header closeButton className="border-0 pb-0">
                <div>
                    <Modal.Title className="fw-bold text-dark">Edit Assignment</Modal.Title>
                    <p className="text-muted small mb-0">Update details for {task?.title}</p>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4">
                {status.message && (
                    <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 rounded-3`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-secondary small text-uppercase">Title</label>
                        <input type="text" name="title" className="form-control bg-light border-0" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold text-secondary small text-uppercase">Total Marks</label>
                            <input type="number" name="totalMarks" className="form-control bg-light border-0" value={formData.totalMarks} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label fw-bold text-secondary small text-uppercase">Description</label>
                        <textarea name="description" rows="3" className="form-control bg-light border-0" value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold text-secondary small text-uppercase">Update File (Optional)</label>
                        <input type="file" className="form-control bg-light border-0" onChange={handleFileChange} />
                        {task.attachmentUrl && <div className="form-text text-muted">Current file exists. Uploading new one replaces it.</div>}
                    </div>

                    {/* Time UI */}
                    <div className="mb-4 p-3 bg-light rounded border border-0">
                        <label className="form-label fw-bold text-primary mb-2">Deadline</label>
                        <div className="row g-2 align-items-end">
                            <div className="col-md-5">
                                <label className="small text-muted mb-1">Due Date</label>
                                <input type="date" className="form-control border-0 bg-white" value={dateValue} onChange={handleDateChange} required />
                            </div>
                            <div className="col-md-7">
                                <label className="small text-muted mb-1">Due Time</label>
                                <div className="input-group">
                                    <select className="form-select border-0 bg-white" value={timeState.hour} onChange={(e) => handleTimeUIChange('hour', e.target.value)}>
                                        {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <select className="form-select border-0 bg-white" value={timeState.minute} onChange={(e) => handleTimeUIChange('minute', e.target.value)}>
                                        {['00','05','10','15','20','25','30','35','40','45','50','55','59'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select className="form-select border-0 bg-white" value={timeState.ampm} onChange={(e) => handleTimeUIChange('ampm', e.target.value)}>
                                        <option value="AM">AM</option><option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-check form-switch mb-4">
                        <input className="form-check-input" type="checkbox" id="editLateSwitch" name="allowLateSubmissions" checked={formData.allowLateSubmissions} onChange={handleChange} />
                        <label className="form-check-label fw-bold text-muted" htmlFor="editLateSwitch">Allow Late Submissions</label>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="light" onClick={handleClose} className="rounded-pill px-4 text-muted fw-bold">Cancel</Button>
                        <Button type="submit" variant="primary" className="rounded-pill px-4 fw-bold" disabled={status.type === 'loading'} style={{background: '#1e293b', border: 'none'}}>
                            {status.type === 'loading' ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default EditTaskModal;
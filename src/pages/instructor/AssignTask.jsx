import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignTask = () => {
    const [courses, setCourses] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '', description: '', dueDate: '', 
        courseOfferingId: '', totalMarks: '100', allowLateSubmissions: false 
    });

    const [timeState, setTimeState] = useState({ hour: '11', minute: '59', ampm: 'PM' });
    const [attachment, setAttachment] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const token = sessionStorage.getItem("token");

    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) { setStatus({ type: 'error', message: 'Please log in.' }); return; }
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get('https://localhost:7145/Teacher/ViewCourses', { headers });
                setCourses(response.data);
            } catch (error) { console.error(error); }
        };
        fetchCourses();
    }, [token]);

    // Time Logic (Keep existing logic)
    useEffect(() => {
        if (!formData.dueDate) return;
        const datePart = formData.dueDate.split('T')[0];
        let hour24 = parseInt(timeState.hour);
        if (timeState.ampm === 'PM' && hour24 !== 12) hour24 += 12;
        if (timeState.ampm === 'AM' && hour24 === 12) hour24 = 0;
        const newIso = `${datePart}T${hour24.toString().padStart(2, '0')}:${timeState.minute.padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, dueDate: newIso }));
    }, [timeState.hour, timeState.minute, timeState.ampm]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleDateChange = (e) => {
        const dateVal = e.target.value; 
        let hour24 = parseInt(timeState.hour);
        if (timeState.ampm === 'PM' && hour24 !== 12) hour24 += 12;
        if (timeState.ampm === 'AM' && hour24 === 12) hour24 = 0;
        setFormData({ ...formData, dueDate: `${dateVal}T${hour24.toString().padStart(2, '0')}:${timeState.minute}` });
    };

    const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) setAttachment(e.target.files[0]); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.courseOfferingId || !formData.dueDate) {
            setStatus({ type: 'error', message: 'Please fill in required fields.' }); return;
        }
        setStatus({ type: 'loading', message: 'Assigning task...' });

        try {
            const submissionData = new FormData();
            Object.keys(formData).forEach(key => {
                if(key === 'dueDate') {
                    submissionData.append(key, new Date(formData[key]).toISOString());
                } else {
                    submissionData.append(key, formData[key]);
                }
            });
            if (attachment) submissionData.append('file', attachment);

            await axios.post('https://localhost:7145/api/Tasks/assign', submissionData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            setStatus({ type: 'success', message: 'Task assigned successfully!' });
            setFormData({ title: '', description: '', dueDate: '', courseOfferingId: '', totalMarks: '100', allowLateSubmissions: false });
            setAttachment(null);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to assign task.' });
        }
    };

    const dateValue = formData.dueDate ? formData.dueDate.split('T')[0] : '';

    return (
        <div className="container mt-4 mb-5">
            <div className="card shadow-lg border-0 rounded-4" style={{maxWidth: '750px', margin: '0 auto'}}>
                <div className="card-header bg-white border-bottom p-4">
                    <h4 className="mb-0 fw-bold" style={{color: '#1e293b'}}>
                        <i className="bi bi-plus-circle-fill text-primary me-2"></i>Create New Assignment
                    </h4>
                    <p className="text-muted small mb-0">Fill in the details below to assign work to your students.</p>
                </div>
                
                <div className="card-body p-4 p-md-5">
                    {status.message && (
                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 shadow-sm rounded-3 mb-4`}>
                            {status.type === 'loading' ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className={`bi ${status.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>}
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Course Selection */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary text-uppercase small" style={{letterSpacing:'0.5px'}}>Select Course</label>
                            <select name="courseOfferingId" className="form-select form-select-lg bg-light border-0" value={formData.courseOfferingId} onChange={handleChange} required>
                                <option value="">-- Choose a Course --</option>
                                {courses.map(course => (
                                    <option key={course.courseOfferingId} value={course.courseOfferingId}>
                                        {course.courseTitle} {course.semester ? `(${course.semester})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-8">
                                <label className="form-label fw-bold text-secondary text-uppercase small">Task Title</label>
                                <input type="text" name="title" required maxLength={200} value={formData.title} onChange={handleChange} 
                                    className="form-control bg-light border-0 py-2" placeholder="e.g. Midterm Project Proposal" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold text-secondary text-uppercase small">Total Marks</label>
                                <div className="input-group">
                                    <input type="number" name="totalMarks" required min="1" value={formData.totalMarks} onChange={handleChange} 
                                        className="form-control bg-light border-0 py-2" placeholder="100" />
                                    <span className="input-group-text bg-light border-0 text-muted">Pts</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary text-uppercase small">Description</label>
                            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} 
                                className="form-control bg-light border-0" placeholder="Enter detailed instructions here..." />
                        </div>

                        {/* Deadline Section - Styled as a distinct block */}
                        <div className="mb-4 p-4 rounded-4" style={{backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1'}}>
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-white p-2 rounded-circle shadow-sm me-2 text-primary"><i className="bi bi-calendar-event"></i></div>
                                <label className="form-label fw-bold text-dark mb-0">Submission Deadline</label>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="small text-muted mb-1 fw-bold">Due Date</label>
                                    <input type="date" className="form-control border-0 shadow-sm" value={dateValue} onChange={handleDateChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="small text-muted mb-1 fw-bold">Due Time</label>
                                    <div className="input-group shadow-sm">
                                        <select className="form-select border-0" value={timeState.hour} onChange={(e) => setTimeState({...timeState, hour: e.target.value})}>
                                            {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <select className="form-select border-0" value={timeState.minute} onChange={(e) => setTimeState({...timeState, minute: e.target.value})}>
                                            {['00', '15', '30', '45', '59'].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select className="form-select border-0" value={timeState.ampm} onChange={(e) => setTimeState({...timeState, ampm: e.target.value})}>
                                            <option value="AM">AM</option><option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-3 form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="allowLateSwitch" name="allowLateSubmissions" checked={formData.allowLateSubmissions} onChange={handleChange} />
                                <label className="form-check-label small text-muted" htmlFor="allowLateSwitch">Allow students to submit after this deadline (marked as Late)</label>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary text-uppercase small">Attachment (Optional)</label>
                            <input type="file" className="form-control bg-light border-0" onChange={handleFileChange} />
                        </div>

                        <button type="submit" disabled={status.type === 'loading'} 
                            className="btn w-100 py-3 fw-bold rounded-3 text-white shadow-sm"
                            style={{background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', border: 'none'}}>
                            {status.type === 'loading' ? 'Processing...' : 'Publish Assignment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignTask;
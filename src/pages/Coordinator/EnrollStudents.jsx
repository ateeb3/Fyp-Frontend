import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const EnrollStudents = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [offerings, setOfferings] = useState([]);
  const [formData, setFormData] = useState({ courseOfferingId: "", semester: 0 });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get("https://localhost:7145/Coordinator/ViewAllAssignedCoursesToTeachers", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setOfferings(res.data))
        .catch(err => console.error(err));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
        await axios.post("https://localhost:7145/Coordinator/EnrollStudents", { ...formData, studentId: null }, { headers: { Authorization: `Bearer ${token}` } });
        setMsg({ type: 'success', text: "Enrollment successful!" });
    } catch (err) { setMsg({ type: 'danger', text: "Enrollment failed." }); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "600px" }}>
        <div className="mb-4 text-center">
            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Enroll Students</h2>
            <p className="text-muted">Batch enroll students into a specific course offering.</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
                {msg.text && <Alert variant={msg.type} className="rounded-3 border-0 shadow-sm">{msg.text}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small text-uppercase">Course Offering</Form.Label>
                        <Form.Select 
                            value={formData.courseOfferingId} 
                            onChange={(e) => {
                                const off = offerings.find(o => o.courseOfferingId === e.target.value);
                                setFormData({ courseOfferingId: e.target.value, semester: off ? off.semester : 0 });
                            }} 
                            required 
                            className="bg-light border-0 py-2"
                        >
                            <option value="">Select Offering</option>
                            {offerings.map(o => <option key={o.courseOfferingId} value={o.courseOfferingId}>{o.courseId} (Sem {o.semester})</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-secondary small text-uppercase">Semester</Form.Label>
                        <Form.Control type="text" value={formData.semester || ""} disabled className="bg-light border-0 py-2"/>
                    </Form.Group>

                    <Button type="submit" disabled={loading} className="w-100 py-2 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                        {loading ? "Processing..." : "Run Enrollment"}
                    </Button>
                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default EnrollStudents;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const PromoteStudents = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [formData, setFormData] = useState({ currentSemester: "", promotionSemester: "" });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const semesterMap = { 1: "First", 2: "Second", 3: "Third", 4: "Fourth", 5: "Fifth", 6: "Sixth", 7: "Seventh", 8: "Eighth" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
        await axios.put("https://localhost:7145/Coordinator/PromoteStudents", {
            currentSemester: parseInt(formData.currentSemester),
            promotionSemester: parseInt(formData.promotionSemester)
        }, { headers: { Authorization: `Bearer ${token}` } });
        setMsg({ type: 'success', text: "Students promoted successfully!" });
    } catch (err) { setMsg({ type: 'danger', text: "Promotion failed." }); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "600px" }}>
        <div className="mb-4 text-center">
            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Promote Students</h2>
            <p className="text-muted">Move students to the next academic semester.</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
                {msg.text && <Alert variant={msg.type} className="rounded-3 border-0 shadow-sm">{msg.text}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small text-uppercase">From Semester</Form.Label>
                                <Form.Select value={formData.currentSemester} onChange={(e) => setFormData({...formData, currentSemester: e.target.value})} required className="bg-light border-0 py-2">
                                    <option value="">Select</option>
                                    {Object.entries(semesterMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small text-uppercase">To Semester</Form.Label>
                                <Form.Select value={formData.promotionSemester} onChange={(e) => setFormData({...formData, promotionSemester: e.target.value})} required className="bg-light border-0 py-2">
                                    <option value="">Select</option>
                                    {Object.entries(semesterMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button type="submit" disabled={loading} className="w-100 py-2 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                        {loading ? "Promoting..." : "Promote Batch"}
                    </Button>
                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default PromoteStudents;
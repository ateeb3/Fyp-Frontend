import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const AddInstructor = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const isEdit = state?.isEdit || false;
  const initialInstructor = state?.instructor || {};

  const [formData, setFormData] = useState({
    firstName: initialInstructor.firstName || "",
    lastName: initialInstructor.lastName || "",
    cnic: initialInstructor.cnic || "",
    dateOfBirth: initialInstructor.dateOfBirth ? new Date(initialInstructor.dateOfBirth).toISOString().split("T")[0] : "",
    qualification: initialInstructor.qualification?.toString() || "",
    personalNumber: initialInstructor.personalNumber || "",
    emergencyNumber: initialInstructor.emergencyNumber || "",
    email: initialInstructor.email || "",
    address: initialInstructor.address || "",
    city: initialInstructor.city || "",
    province: initialInstructor.province?.toString() || "",
    departmentId: initialInstructor.departmentId || "",
    userId: initialInstructor.userId || "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState({ departments: [], users: [], qualifications: [], provinces: [] });

  const qualificationMap = { 0: "None", 1: "Bachelors", 2: "Masters", 3: "PhD" };
  const provinceMap = { 0: "None", 1: "Punjab", 2: "Sindh", 3: "Balochistan", 4: "KPK", 5: "GilgitBaltistan" };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchDropdowns = async () => {
        try {
            const response = await axios.get("https://localhost:7145/Coordinator/GetTeacherDropdowns", { headers: { Authorization: `Bearer ${token}` } });
            setDropdownData({
                departments: response.data.departments || [],
                users: response.data.users || [],
                qualifications: Object.entries(qualificationMap).map(([k, v]) => ({ value: k, label: v })),
                provinces: Object.entries(provinceMap).map(([k, v]) => ({ value: k, label: v }))
            });
        } catch (err) { setError("Failed to load options."); }
    };
    fetchDropdowns();
  }, [token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = { ...formData, qualification: parseInt(formData.qualification), province: parseInt(formData.province) };
        if (isEdit) {
            await axios.put(`https://localhost:7145/Coordinator/EditTeacher/${initialInstructor.teacherId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        } else {
            await axios.post("https://localhost:7145/Coordinator/AddTeacher", payload, { headers: { Authorization: `Bearer ${token}` } });
        }
        navigate("/coordinator/view-instructors");
    } catch (err) { setError(err.response?.data?.message || "Operation failed."); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "800px" }}>
        <div className="mb-4 text-center">
            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{isEdit ? "Edit Instructor" : "Add Instructor"}</h2>
            <p className="text-muted">Manage faculty profile information.</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
                {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3 mb-3">
                        <Col md={6}><Form.Control placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                    </Row>
                    <Row className="g-3 mb-3">
                        <Col md={6}><Form.Control placeholder="CNIC" name="cnic" value={formData.cnic} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control placeholder="Phone" name="personalNumber" value={formData.personalNumber} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                    </Row>
                    <Row className="g-3 mb-3">
                        <Col md={6}><Form.Control type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                    </Row>
                    
                    <div className="mb-3 p-3 bg-light rounded-3">
                        <label className="fw-bold text-secondary small text-uppercase mb-2">Academic Info</label>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Select name="qualification" value={formData.qualification} onChange={handleChange} required className="border-0 bg-white">
                                    <option value="">Select Qualification</option>
                                    {dropdownData.qualifications.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Select name="departmentId" value={formData.departmentId} onChange={handleChange} required className="border-0 bg-white">
                                    <option value="">Select Department</option>
                                    {dropdownData.departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>
                    </div>

                    <div className="mb-4 p-3 bg-light rounded-3">
                        <label className="fw-bold text-secondary small text-uppercase mb-2">Address & User Account</label>
                        <Row className="g-3">
                            <Col md={6}><Form.Control placeholder="City" name="city" value={formData.city} onChange={handleChange} required className="border-0 bg-white"/></Col>
                            <Col md={6}>
                                <Form.Select name="province" value={formData.province} onChange={handleChange} className="border-0 bg-white">
                                    <option value="">Select Province</option>
                                    {dropdownData.provinces.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={12}><Form.Control placeholder="Full Address" name="address" value={formData.address} onChange={handleChange} required className="border-0 bg-white"/></Col>
                            <Col md={12}>
                                <Form.Select name="userId" value={formData.userId} onChange={handleChange} required className="border-0 bg-white">
                                    <option value="">Link User Account</option>
                                    {dropdownData.users.map(u => <option key={u.userId} value={u.userId}>{u.userName}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>
                    </div>

                    <Button type="submit" disabled={loading} className="w-100 py-2 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                        {loading ? "Saving..." : "Save Profile"}
                    </Button>
                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default AddInstructor;
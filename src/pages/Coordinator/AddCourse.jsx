import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const AddCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const course = location.state?.course;

  const creditMap = { 0: "None", 1: "One", 2: "Two", 3: "Three", 4: "Four" };

  const [formData, setFormData] = useState({
    courseId: course?.courseId || "",
    courseTitle: course?.courseTitle || "",
    creditHours: course?.creditHours?.toString() || "",
    departmentId: course?.departmentId || "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("https://localhost:7145/Coordinator/GetStudentDropdowns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(response.data.departments || []);
      } catch (err) { setError("Failed to fetch departments."); }
    };
    fetchDepartments();
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        courseTitle: formData.courseTitle,
        creditHours: parseInt(formData.creditHours) || 0,
        departmentId: formData.departmentId,
      };

      if (course) {
        await axios.put(`https://localhost:7145/Coordinator/EditCourse/${course.courseId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("https://localhost:7145/Coordinator/AddCourse", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate("/coordinator/view-courses");
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "700px" }}>
        <div className="mb-4 text-center">
            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{course ? "Edit Course" : "Add New Course"}</h2>
            <p className="text-muted">Enter course details below.</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
                {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-secondary small text-uppercase">Course Title</Form.Label>
                        <Form.Control type="text" name="courseTitle" value={formData.courseTitle} onChange={handleChange} required placeholder="e.g. Introduction to Programming" className="bg-light border-0 py-2" />
                    </Form.Group>

                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small text-uppercase">Credit Hours</Form.Label>
                                <Form.Select name="creditHours" value={formData.creditHours} onChange={handleChange} required className="bg-light border-0 py-2">
                                    <option value="">Select Credits</option>
                                    {Object.entries(creditMap).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small text-uppercase">Department</Form.Label>
                                <Form.Select name="departmentId" value={formData.departmentId} onChange={handleChange} required className="bg-light border-0 py-2">
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.departmentId} value={dept.departmentId}>{dept.departmentName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button type="submit" disabled={loading} className="w-100 py-2 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                        {loading ? "Saving..." : course ? "Update Course" : "Add Course"}
                    </Button>
                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default AddCourse;
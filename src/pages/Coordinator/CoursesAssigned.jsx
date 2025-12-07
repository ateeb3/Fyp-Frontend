import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const CoursesAssigned = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  const semesterMap = { 0: "None", 1: "First", 2: "Second", 3: "Third", 4: "Fourth", 5: "Fifth", 6: "Sixth", 7: "Seventh", 8: "Eighth" };

  const [formData, setFormData] = useState({
    semester: location.state?.semester?.toString() || "",
    courseId: location.state?.courseId || "",
    teacherId: location.state?.teacherId || "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
        try {
            const [cRes, tRes] = await Promise.all([
                axios.get("https://localhost:7145/Coordinator/ViewCourses", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("https://localhost:7145/Coordinator/ViewTeachers", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setCourses(cRes.data);
            setTeachers(tRes.data.map(t => ({ ...t, teacherName: `${t.firstName} ${t.lastName}` })));
        } catch { setError("Failed to fetch data."); }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await axios.post("https://localhost:7145/Coordinator/AssignCourseToTeacher", {
            semester: parseInt(formData.semester),
            courseId: formData.courseId,
            teacherId: formData.teacherId
        }, { headers: { Authorization: `Bearer ${token}` } });
        navigate("/coordinator/view-assigned-courses");
    } catch (err) { setError(err.response?.data?.message || "Assignment failed."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "600px" }}>
        <div className="mb-4 text-center">
            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Assign Course</h2>
            <p className="text-muted">Link a course to an instructor for a specific semester.</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
                {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small text-uppercase">Semester</Form.Label>
                        <Form.Select value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} required className="bg-light border-0 py-2">
                            <option value="">Select Semester</option>
                            {Object.entries(semesterMap).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small text-uppercase">Course</Form.Label>
                        <Form.Select value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} required className="bg-light border-0 py-2">
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseTitle}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-secondary small text-uppercase">Instructor</Form.Label>
                        <Form.Select value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})} required className="bg-light border-0 py-2">
                            <option value="">Select Instructor</option>
                            {teachers.map(t => <option key={t.teacherId} value={t.teacherId}>{t.teacherName}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Button type="submit" disabled={loading} className="w-100 py-2 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                        {loading ? "Assigning..." : "Assign Course"}
                    </Button>
                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default CoursesAssigned;
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Table, Button, Alert, Container, Spinner } from "react-bootstrap";
import axios from "axios";

const ViewCourses = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const creditMap = { 0: "None", 1: "One", 2: "Two", 3: "Three", 4: "Four" };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
      try {
        const [cRes, dRes] = await Promise.all([
            axios.get("https://localhost:7145/Coordinator/ViewCourses", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("https://localhost:7145/Coordinator/GetStudentDropdowns", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCourses(cRes.data || []);
        setDepartments(dRes.data.departments || []);
      } catch (err) { setError("Failed to fetch data."); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await axios.delete(`https://localhost:7145/Coordinator/DeleteCourse/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(courses.filter((c) => c.courseId !== id));
    } catch { alert("Failed to delete."); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "1100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Course Catalog</h2>
                <p className="text-muted mb-0">Manage university courses.</p>
            </div>
            <Link to="/coordinator/add-course">
                <Button className="rounded-pill px-4 fw-bold border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
                    + Add Course
                </Button>
            </Link>
        </div>

        {loading ? <div className="text-center p-5"><Spinner animation="border" variant="primary"/></div> : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Title</th>
                                <th className="border-0">Credits</th>
                                <th className="border-0">Department</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length > 0 ? courses.map((course) => (
                                <tr key={course.courseId} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td className="ps-4 fw-bold text-dark">{course.courseTitle}</td>
                                    <td><span className="badge bg-primary bg-opacity-10 text-primary rounded-pill border border-primary border-opacity-10 px-3">{creditMap[course.creditHours] || "Unknown"}</span></td>
                                    <td className="text-muted">{departments.find(d => d.departmentId === course.departmentId)?.departmentName || "N/A"}</td>
                                    <td className="text-end pe-4">
                                        {/* UPDATED EDIT BUTTON COLOR */}
                                        <Button variant="light" size="sm" className="rounded-pill border-0 me-2 fw-bold text-white" style={{backgroundColor: '#1e293b'}} onClick={() => navigate("/coordinator/add-course", { state: { course } })}>Edit</Button>
                                        
                                        {/* UPDATED DELETE BUTTON COLOR */}
                                        <Button variant="danger" size="sm" className="rounded-pill border-0 bg-opacity-10 text-danger fw-bold" style={{backgroundColor: '#fee2e2', color: '#dc2626'}} onClick={() => handleDelete(course.courseId)}>Delete</Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center py-5 text-muted">No courses found.</td></tr>}
                        </tbody>
                    </Table>
                </div>
            </div>
        )}
      </Container>
    </div>
  );
};

export default ViewCourses;
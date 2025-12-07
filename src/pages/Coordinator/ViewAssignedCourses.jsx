import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import axios from "axios";

const ViewAssignedCourses = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
        try {
            const [aRes, cRes, tRes] = await Promise.all([
                axios.get("https://localhost:7145/Coordinator/ViewAllAssignedCoursesToTeachers", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("https://localhost:7145/Coordinator/ViewCourses", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("https://localhost:7145/Coordinator/ViewTeachers", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            const mapped = aRes.data.map(assign => {
                const c = cRes.data.find(i => i.courseId === assign.courseId);
                const t = tRes.data.find(i => i.teacherId === assign.teacherId);
                return {
                    ...assign,
                    courseTitle: c?.courseTitle || "Unknown",
                    teacherName: t ? `${t.firstName} ${t.lastName}` : "Unknown"
                };
            });
            setAssignments(mapped);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
        await axios.delete(`https://localhost:7145/Coordinator/DeleteAssignedCourse/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setAssignments(assignments.filter(a => a.courseOfferingId !== id));
    } catch { alert("Failed to delete."); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "1100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Assigned Courses</h2>
                <p className="text-muted mb-0">Courses currently allocated to instructors.</p>
            </div>
            <Button onClick={() => navigate("/coordinator/courses-assigned")} className="rounded-pill px-4 fw-bold border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
                + Assign Course
            </Button>
        </div>

        {loading ? <div className="text-center p-5"><Spinner animation="border" variant="primary"/></div> : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Course Title</th>
                                <th className="border-0">Instructor</th>
                                <th className="border-0">Semester</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.length > 0 ? assignments.map((a) => (
                                <tr key={a.courseOfferingId} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td className="ps-4 fw-bold text-dark">{a.courseTitle}</td>
                                    <td className="text-primary">{a.teacherName}</td>
                                    <td><span className="badge bg-light text-dark border">{a.semester}</span></td>
                                    <td className="text-end pe-4">
                                        <Button variant="light" size="sm" className="rounded-pill border-0 me-2 fw-bold text-white" style={{backgroundColor: '#1e293b'}} onClick={() => navigate("/coordinator/courses-assigned", { state: a })}>Edit</Button>
                                        <Button variant="danger" size="sm" className="rounded-pill border-0 bg-opacity-10 text-danger fw-bold" style={{backgroundColor: '#fee2e2', color: '#dc2626'}} onClick={() => handleDelete(a.courseOfferingId)}>Remove</Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center py-5 text-muted">No assignments found.</td></tr>}
                        </tbody>
                    </Table>
                </div>
            </div>
        )}
      </Container>
    </div>
  );
};

export default ViewAssignedCourses;
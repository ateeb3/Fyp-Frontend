import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import axios from "axios";

const ViewEnrolledStudents = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
        try {
            const [eRes, sRes, oRes, cRes] = await Promise.all([
                axios.get("https://localhost:7145/Coordinator/ViewEnrolledStudents", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("https://localhost:7145/Coordinator/ViewStudents", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("https://localhost:7145/Coordinator/ViewAllAssignedCoursesToTeachers", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("https://localhost:7145/Coordinator/ViewCourses", { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const mapped = eRes.data.map(enrol => {
                const s = sRes.data.find(i => i.studentId === enrol.studentId);
                const off = oRes.data.find(i => i.courseOfferingId === enrol.courseOfferingId);
                const c = off ? cRes.data.find(i => i.courseId === off.courseId) : null;
                return {
                    ...enrol,
                    studentName: s ? `${s.firstName} ${s.lastName}` : "Unknown",
                    courseName: c?.courseTitle || "Unknown",
                    semester: enrol.semester
                };
            });
            setEnrollments(mapped);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this enrollment?")) return;
    try {
        await axios.delete(`https://localhost:7145/Coordinator/DeleteEnrolledStudent/${id}`, { headers: { Authorization: `Bearer ${token}` }, params: { enrollmentId: id } });
        setEnrollments(enrollments.filter(e => e.enrollmentId !== id));
    } catch { alert("Delete failed."); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "1100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Course Enrollments</h2>
                <p className="text-muted mb-0">List of students enrolled in active courses.</p>
            </div>
            <Button onClick={() => navigate("/coordinator/enroll-students")} className="rounded-pill px-4 fw-bold border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
                + New Enrollment
            </Button>
        </div>

        {loading ? <div className="text-center p-5"><Spinner animation="border" variant="primary"/></div> : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Student</th>
                                <th className="border-0">Course</th>
                                <th className="border-0">Semester</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.length > 0 ? enrollments.map((e) => (
                                <tr key={e.enrollmentId} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td className="ps-4 fw-bold text-dark">{e.studentName}</td>
                                    <td className="text-secondary">{e.courseName}</td>
                                    <td><span className="badge bg-light text-dark border">{e.semester}</span></td>
                                    <td className="text-end pe-4">
                                        <Button variant="light" size="sm" className="rounded-pill border-0 me-2 fw-bold text-white" style={{backgroundColor: '#1e293b'}} onClick={() => navigate("/coordinator/enroll-students", { state: e })}>Edit</Button>
                                        <Button variant="danger" size="sm" className="rounded-pill border-0 bg-opacity-10 text-danger fw-bold" style={{backgroundColor: '#fee2e2', color: '#dc2626'}} onClick={() => handleDelete(e.enrollmentId)}>Delete</Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center py-5 text-muted">No enrollments found.</td></tr>}
                        </tbody>
                    </Table>
                </div>
            </div>
        )}
      </Container>
    </div>
  );
};

export default ViewEnrolledStudents;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import axios from "axios";

const ViewStudents = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
        try {
            const [sRes, dRes] = await Promise.all([
                axios.get("https://localhost:7145/Coordinator/ViewStudents", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("https://localhost:7145/Coordinator/GetStudentDropdowns", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStudents(sRes.data || []);
            setDepartments(dRes.data.departments || []);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete student?")) return;
    try {
        await axios.delete(`https://localhost:7145/Coordinator/DeleteStudent/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setStudents(students.filter(s => s.studentId !== id));
    } catch { alert("Failed to delete."); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "1200px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Students</h2>
                <p className="text-muted mb-0">Directory of enrolled students.</p>
            </div>
            <Button onClick={() => navigate("/coordinator/add-student")} className="rounded-pill px-4 fw-bold border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
                + Add Student
            </Button>
        </div>

        {loading ? <div className="text-center p-5"><Spinner animation="border" variant="primary"/></div> : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Name</th>
                                <th className="border-0">Semester</th>
                                <th className="border-0">Department</th>
                                <th className="border-0">CNIC</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? students.map((s) => (
                                <tr key={s.studentId} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td className="ps-4 fw-bold text-dark">{s.firstName} {s.lastName}</td>
                                    <td><span className="badge bg-light text-dark border">{s.currentSemester}</span></td>
                                    <td className="text-muted">{departments.find(d => d.departmentId === s.departmentId)?.departmentName || "N/A"}</td>
                                    <td className="text-muted small">{s.cnic}</td>
                                    <td className="text-end pe-4">
                                        <Button variant="light" size="sm" className="rounded-pill border-0 me-2 fw-bold text-white" style={{backgroundColor: '#1e293b'}} onClick={() => navigate("/coordinator/add-student", { state: { student: s } })}>Edit</Button>
                                        <Button variant="danger" size="sm" className="rounded-pill border-0 bg-opacity-10 text-danger fw-bold" style={{backgroundColor: '#fee2e2', color: '#dc2626'}} onClick={() => handleDelete(s.studentId)}>Delete</Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5" className="text-center py-5 text-muted">No students found.</td></tr>}
                        </tbody>
                    </Table>
                </div>
            </div>
        )}
      </Container>
    </div>
  );
};

export default ViewStudents;
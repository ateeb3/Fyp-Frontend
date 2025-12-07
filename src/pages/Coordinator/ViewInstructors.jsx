import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const ViewInstructors = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get("https://localhost:7145/Coordinator/ViewTeachers", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => { setInstructors(res.data); setLoading(false); })
        .catch(err => { setError("Failed to fetch instructors."); setLoading(false); });
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this instructor?")) return;
    try {
        await axios.delete(`https://localhost:7145/Coordinator/DeleteTeacher/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setInstructors(instructors.filter(i => i.teacherId !== id));
    } catch { alert("Delete failed."); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "1100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Instructors</h2>
                <p className="text-muted mb-0">Manage faculty members.</p>
            </div>
            <Button onClick={() => navigate("/coordinator/add-instructor")} className="rounded-pill px-4 fw-bold border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
                + Add Instructor
            </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? <div className="text-center p-5"><Spinner animation="border" variant="primary"/></div> : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Name</th>
                                <th className="border-0">CNIC</th>
                                <th className="border-0">Email</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructors.length > 0 ? instructors.map((inst) => (
                                <tr key={inst.teacherId} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3 fw-bold" style={{width:'40px', height:'40px'}}>
                                                {inst.firstName?.[0]}{inst.lastName?.[0]}
                                            </div>
                                            <span className="fw-bold text-dark">{inst.firstName} {inst.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted">{inst.cnic}</td>
                                    <td className="text-primary">{inst.email}</td>
                                    <td className="text-end pe-4">
                                        <Button variant="light" size="sm" className="rounded-pill border-0 me-2 fw-bold text-white" style={{backgroundColor: '#1e293b'}} onClick={() => navigate("/coordinator/add-instructor", { state: { isEdit: true, instructor: inst } })}>Edit</Button>
                                        <Button variant="danger" size="sm" className="rounded-pill border-0 bg-opacity-10 text-danger fw-bold" style={{backgroundColor: '#fee2e2', color: '#dc2626'}} onClick={() => handleDelete(inst.teacherId)}>Delete</Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center py-5 text-muted">No instructors found.</td></tr>}
                        </tbody>
                    </Table>
                </div>
            </div>
        )}
      </Container>
    </div>
  );
};

export default ViewInstructors;
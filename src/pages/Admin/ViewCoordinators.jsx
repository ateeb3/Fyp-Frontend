import React, { useState, useEffect } from "react";
import { Table, Button, Alert, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ViewCoordinators = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchCoordinators = async () => {
      if (!token) { navigate("/login"); return; }
      setLoading(true);
      try {
        const response = await axios.get("https://localhost:7145/Admin/ViewAllCoordinators", { headers: { Authorization: `Bearer ${token}` } });
        setCoordinators(response.data.filter(c => c.coordinatorId));
      } catch (err) { setError("Failed to fetch coordinators."); } 
      finally { setLoading(false); }
    };
    fetchCoordinators();
  }, [navigate, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coordinator?")) return;
    try {
        await axios.delete(`https://localhost:7145/Admin/DeleteCoordinator/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setCoordinators(coordinators.filter(c => c.coordinatorId !== id));
    } catch { setError("Failed to delete."); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "1100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Coordinators</h2>
                <p className="text-muted mb-0">Manage department coordinators.</p>
            </div>
            <Button onClick={() => navigate("/admin/register-coordinator")} className="rounded-pill px-4 fw-bold border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                + Add Coordinator
            </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? <div className="text-center p-5"><Spinner animation="border" variant="success"/></div> : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Name</th>
                                <th className="border-0">CNIC</th>
                                <th className="border-0">Contact</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coordinators.length > 0 ? coordinators.map((coord) => (
                                <tr key={coord.coordinatorId} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center me-3 fw-bold" style={{width:'40px', height:'40px'}}>
                                                {coord.firstName?.[0]}{coord.lastName?.[0]}
                                            </div>
                                            <span className="fw-bold text-dark">{coord.firstName} {coord.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted">{coord.cnic || "N/A"}</td>
                                    <td className="text-muted">{coord.personalNumber || "N/A"}</td>
                                    <td className="text-end pe-4">
                                        <Button variant="light" size="sm" className="rounded-pill border-0 me-2 fw-bold text-white" style={{backgroundColor: '#1e293b'}} onClick={() => navigate("/admin/add-coordinator", { state: { coordinator: coord, isEdit: true } })}>Edit</Button>
                                        <Button variant="danger" size="sm" className="rounded-pill border-0 bg-opacity-10 text-danger fw-bold" style={{backgroundColor: '#fee2e2', color: '#dc2626'}} onClick={() => handleDelete(coord.coordinatorId)}>Delete</Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center py-5 text-muted">No coordinators found.</td></tr>}
                        </tbody>
                    </Table>
                </div>
            </div>
        )}
      </Container>
    </div>
  );
};

export default ViewCoordinators;
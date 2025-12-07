import React, { useState } from "react";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateDepartment = () => {
  const [departmentName, setDepartmentName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!departmentName) { setError("Department name is required"); return; }

    try {
      await axios.post(
        "https://localhost:7145/Admin/CreateDepartment",
        { departmentName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Department created successfully!");
      setError(null);
      navigate("/admin/view-departments");
    } catch (err) {
      setError("Error creating department. Please try again.");
      setSuccess(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <Container style={{ maxWidth: "500px" }}>
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <Card.Body className="p-5">
                <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width:'60px', height:'60px'}}>
                        <i className="bi bi-building-add fs-3"></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-1">Create Department</h3>
                    <p className="text-muted small">Add a new academic department.</p>
                </div>

                {error && <Alert variant="danger" className="rounded-3 border-0 small py-2">{error}</Alert>}
                {success && <Alert variant="success" className="rounded-3 border-0 small py-2">{success}</Alert>}

                <Form onSubmit={handleFormSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-secondary text-uppercase">Department Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="e.g. Computer Science" 
                            value={departmentName} 
                            onChange={(e) => setDepartmentName(e.target.value)} 
                            required 
                            className="bg-light border-0 py-2"
                        />
                    </Form.Group>

                    <Button type="submit" className="w-100 py-2 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                        Create Department
                    </Button>
                </Form>
            </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CreateDepartment;
import React, { useState } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterStudent = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const token = sessionStorage.getItem("token");

    if (!token) { navigate("/"); return; }

    try {
      await axios.post(
        "https://localhost:7145/Auth/RegisterStudent",
        { userName: username, email, password, isActive: true },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      alert("Student registered successfully!");
      navigate("/coordinator-dashboard");
    } catch (error) {
      setError(error.response?.data || "Registration failed.");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <Container style={{ maxWidth: "450px" }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-body p-5">
                <div className="text-center mb-4">
                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width:'60px', height:'60px'}}>
                        <i className="bi bi-person-fill fs-3"></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-1">Register Student</h3>
                    <p className="text-muted small">Create a system login for a new student.</p>
                </div>

                {error && <Alert variant="danger" className="rounded-3 border-0 small py-2">{error}</Alert>}
                
                <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary text-uppercase">Username</Form.Label>
                        <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-light border-0 py-2"/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary text-uppercase">Email</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-light border-0 py-2"/>
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-secondary text-uppercase">Password</Form.Label>
                        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-light border-0 py-2"/>
                    </Form.Group>
                    
                    <Button type="submit" className="w-100 py-2 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                        Create Account
                    </Button>
                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default RegisterStudent;
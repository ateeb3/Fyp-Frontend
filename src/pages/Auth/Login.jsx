import React, { useState } from "react";
import { Form, Button, Card, FloatingLabel, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post("https://localhost:7145/Auth/Login", {
        userName,
        password,
      });

      const { token, role } = response.data;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);

      // --- LOGIC: Check Pending Session ---
      const pendingSession = sessionStorage.getItem("joinRoomId");

      if (pendingSession) {
        navigate(`/classroom?role=${role === "Teacher" ? "instructor" : "student"}`);
      } else {
        // --- LOGIC: Dashboard Routing ---
        switch (role) {
          case "Admin":
            navigate("/admin");
            break;
          case "Coordinator":
            navigate("/coordinator-dashboard");
            break;
          case "Teacher":
            navigate("/instructor-dashboard");
            break;
          case "Student":
            navigate("/student-dashboard");
            break;
          default:
            setError("Invalid role assigned.");
        }
      }
    } catch (err) {
      console.error(err);
      // 🔥 GENERIC ERROR MESSAGE FOR SECURITY
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative Background Blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <Card style={styles.card}>
        <Card.Body className="p-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2" style={{ color: "#1A314A", letterSpacing: "-0.5px" }}>Class Pulse</h2>
            <div style={styles.separator}></div>
            <p className="text-muted small">Welcome back! Please login to your account.</p>
          </div>

          {error && (
            <Alert variant="danger" className="text-center border-0 bg-danger-subtle text-danger py-2 mb-4" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <FloatingLabel controlId="floatingInput" label="Username" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                style={styles.input}
                className="shadow-none"
              />
            </FloatingLabel>

            <FloatingLabel controlId="floatingPassword" label="Password" className="mb-4">
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                className="shadow-none"
              />
            </FloatingLabel>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-3 fw-bold"
              style={styles.button}
              disabled={isLoading}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              Don't have an account? <span style={{ color: "#1A314A", fontWeight: "700", cursor: "pointer" }}>Contact Admin</span>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    overflow: "hidden",
    zIndex: 1
  },
  blob1: {
    position: "absolute",
    top: "20%",
    left: "30%",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(0,0,0,0) 70%)",
    transform: "translate(-50%, -50%)",
    zIndex: -1,
  },
  blob2: {
    position: "absolute",
    bottom: "20%",
    right: "30%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(0,0,0,0) 70%)",
    transform: "translate(50%, 50%)",
    zIndex: -1,
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "24px",
    border: "none",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", 
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
  },
  separator: {
    width: "40px",
    height: "4px",
    backgroundColor: "#1A314A",
    borderRadius: "2px",
    margin: "15px auto"
  },
  input: {
    borderRadius: "12px",
    border: "1px solid transparent",
    backgroundColor: "#F3F4F6",
    fontSize: "0.95rem",
    paddingTop: "1.5rem",
    paddingBottom: "0.5rem"
  },
  button: {
    backgroundColor: "#1A314A",
    borderColor: "#1A314A",
    borderRadius: "12px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
};

export default Login;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Spinner, Row, Col } from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import "../../components/AdminSidebar/AdminSidebar.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [departments, setDepartments] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCoordinators, setLoadingCoordinators] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Helper for date display
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!token) { navigate("/"); return; }

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await axios.get("https://fyp-backend.runasp.net/Admin/ViewDepartments", { headers: { Authorization: `Bearer ${token}` } });
        setDepartments(response.data);
      } catch (err) { console.error(err); } 
      finally { setLoadingDepartments(false); }
    };

    const fetchCoordinators = async () => {
      setLoadingCoordinators(true);
      try {
        const response = await axios.get("https://fyp-backend.runasp.net/Admin/ViewAllCoordinators", { headers: { Authorization: `Bearer ${token}` } });
        setCoordinators(response.data);
      } catch (err) { console.error(err); } 
      finally { setLoadingCoordinators(false); }
    };

    fetchDepartments();
    fetchCoordinators();
  }, [navigate, token]);

  return (
    <div className="d-flex" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", position: 'relative', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Decorative Blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      {/* Main Content */}
      <div
        className="p-4 p-md-5 w-100"
        style={{
          marginLeft: isOpen ? "260px" : "80px",
          transition: "marginLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          position: "relative",
          zIndex: 2
        }}
      >
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
                <h1 className="fw-bold mb-1" style={{ color: "#1e293b", letterSpacing: '-0.5px' }}>
                    Admin Dashboard
                </h1>
                <p className="text-muted mb-0">Manage system departments and coordinators.</p>
            </div>
            <div className="d-none d-md-block">
                <span className="badge bg-white text-dark shadow-sm border px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                    <i className="bi bi-calendar4-week text-primary"></i>
                    {today}
                </span>
            </div>
        </div>

        <Row className="g-4">
          
          {/* Departments Card (Blue Theme) */}
          <Col md={6} lg={5}>
            <Card 
              className="h-100 border-0 shadow-sm rounded-4 overflow-hidden" 
              style={{ 
                  background: "rgba(255, 255, 255, 0.85)", // Glass effect transparency
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)"
              }}
            >
              <Card.Body className="p-4 d-flex flex-column">
                
                {/* Header with Gradient Icon */}
                <div className="d-flex align-items-center mb-4">
                    <div className="d-flex align-items-center justify-content-center me-3 shadow-sm" 
                         style={{
                             width:'64px', 
                             height:'64px', 
                             borderRadius: '16px', // Squircle shape
                             background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Gradient
                             color: 'white'
                         }}>
                        <i className="bi bi-building-fill fs-3"></i>
                    </div>
                    <div>
                        <h6 className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>Departments</h6>
                        <h2 className="fw-bold mb-0 text-dark">{loadingDepartments ? "-" : departments.length}</h2>
                    </div>
                </div>

                <h6 className="fw-bold mb-3" style={{color: '#64748b', fontSize: '0.9rem'}}>Recent Departments</h6>

                {/* Styled List Content */}
                {loadingDepartments ? (
                  <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
                ) : (
                  <div className="flex-grow-1 mb-4">
                      {departments.length === 0 ? (
                          <div className="p-3 text-center bg-light rounded-3 text-muted small">No departments found.</div>
                      ) : (
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                            {departments.slice(0, 3).map((d) => (
                              <li key={d.departmentId} 
                                  className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                                  style={{ backgroundColor: '#f1f5f9' }}
                              >
                                <div className="d-flex align-items-center">
                                    <span style={{width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '12px'}}></span>
                                    <span className="fw-semibold text-dark" style={{fontSize: '0.9rem'}}>{d.departmentName}</span>
                                </div>
                                <i className="bi bi-chevron-right text-muted" style={{fontSize: '0.75rem'}}></i>
                              </li>
                            ))}
                          </ul>
                      )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-100 py-2 fw-bold shadow-sm"
                  onClick={() => navigate("/admin/view-departments")}
                  style={{ 
                      backgroundColor: "#3b82f6", 
                      color: "white", 
                      border: "none", 
                      borderRadius: '12px',
                      transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)"; }}
                  onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
                >
                  View All Departments
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Coordinators Card (Green Theme) */}
          <Col md={6} lg={5}>
            <Card 
              className="h-100 border-0 shadow-sm rounded-4 overflow-hidden"
              style={{ 
                  background: "rgba(255, 255, 255, 0.85)", 
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)"
              }}
            >
              <Card.Body className="p-4 d-flex flex-column">
                
                {/* Header with Gradient Icon */}
                <div className="d-flex align-items-center mb-4">
                    <div className="d-flex align-items-center justify-content-center me-3 shadow-sm" 
                         style={{
                             width:'64px', 
                             height:'64px', 
                             borderRadius: '16px', 
                             background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Gradient
                             color: 'white'
                         }}>
                        <i className="bi bi-person-lines-fill fs-3"></i>
                    </div>
                    <div>
                        <h6 className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>Coordinators</h6>
                        <h2 className="fw-bold mb-0 text-dark">{loadingCoordinators ? "-" : coordinators.length}</h2>
                    </div>
                </div>

                <h6 className="fw-bold mb-3" style={{color: '#64748b', fontSize: '0.9rem'}}>Recent Registrations</h6>

                {/* Styled List Content */}
                {loadingCoordinators ? (
                  <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>
                ) : (
                  <div className="flex-grow-1 mb-4">
                      {coordinators.length === 0 ? (
                          <div className="p-3 text-center bg-light rounded-3 text-muted small">No coordinators found.</div>
                      ) : (
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                            {coordinators.slice(0, 3).map((c) => (
                              <li key={c.coordinatorId} 
                                  className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                                  style={{ backgroundColor: '#f0fdf4' }} // Very light green bg
                              >
                                <div className="d-flex align-items-center">
                                    {/* Initials Avatar */}
                                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3" 
                                         style={{width:'28px', height:'28px', background: '#d1fae5', color: '#047857', fontSize: '0.75rem', fontWeight:'bold'}}>
                                        {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                                    </div>
                                    <span className="fw-semibold text-dark" style={{fontSize: '0.9rem'}}>
                                        {c.firstName} {c.lastName}
                                    </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                      )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-100 py-2 fw-bold shadow-sm"
                  onClick={() => navigate("/admin/view-coordinator")}
                  style={{ 
                      backgroundColor: "#10b981", 
                      color: "white", 
                      border: "none", 
                      borderRadius: '12px',
                      transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)"; }}
                  onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
                >
                  View Coordinators
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

// CSS-in-JS for Background Blobs (Unchanged, but supports the Glassmorphism well)
const styles = {
    blob1: {
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)", // Increased opacity slightly for contrast
        zIndex: 0,
        pointerEvents: "none"
    },
    blob2: {
        position: "absolute",
        bottom: "10%",
        left: "20%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)", // Increased opacity slightly
        zIndex: 0,
        pointerEvents: "none"
    }
};

export default AdminDashboard;
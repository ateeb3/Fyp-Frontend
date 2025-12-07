import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Spinner, Row, Col } from "react-bootstrap";
import CoordinatorSidebar from "../../components/CoordinatorSidebar/CoordinatorSidebar";
import "../../components/CoordinatorSidebar/CoordinatorSidebar.css";

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [teachers, setTeachers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Fallback data for visual check if API fails
  useEffect(() => {
    if (!token) { navigate("/"); return; }

    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await axios.get("https://localhost:7145/Coordinator/ViewTeachers", { headers: { Authorization: `Bearer ${token}` } });
        setTeachers(response.data);
      } catch (err) { console.log(err); } 
      finally { setLoadingTeachers(false); }
    };

    const fetchMeetings = async () => {
      setLoadingMeetings(true);
      try {
        const response = await axios.get("https://localhost:7145/Coordinator/ViewMeetings", { headers: { Authorization: `Bearer ${token}` } });
        setMeetings(response.data);
      } catch (err) { console.log(err); } 
      finally { setLoadingMeetings(false); }
    };

    fetchTeachers();
    fetchMeetings();
  }, [navigate, token]);

  return (
    <div className="d-flex" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", position: 'relative', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <CoordinatorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Decorative Background Blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      {/* Main Content Area */}
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
                <h1 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                    Hello, <span style={{color: '#4f46e5'}}>Coordinator</span>
                </h1>
                <p className="text-muted mb-0">Overview of academic staff and scheduled sessions.</p>
            </div>
            <div className="d-none d-md-block">
                <span className="badge bg-white text-dark shadow-sm border px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </div>

        <Row className="g-4">
          {/* Instructors Card */}
          <Col md={6} lg={5}>
            <Card className="shadow-sm h-100 border-0 rounded-4 overflow-hidden" style={{backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)"}}>
              <Card.Body className="p-4 d-flex flex-column">
                
                {/* Card Header Section */}
                <div className="d-flex align-items-center mb-4">
                    <div style={styles.iconBoxBlue}>
                        <i className="bi bi-person-badge-fill text-white fs-3"></i>
                    </div>
                    <div className="ms-3">
                        <h4 className="fw-bold mb-0 text-dark">Instructors</h4>
                        <small className="text-muted">{teachers.length} Registered</small>
                    </div>
                </div>

                {/* List Content */}
                {loadingTeachers ? (
                  <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
                ) : (
                  <div className="flex-grow-1 mb-4">
                      {teachers.length === 0 ? (
                          <p className="text-muted small">No instructors found.</p>
                      ) : (
                          <ul className="list-unstyled">
                            {teachers.slice(0, 3).map((t) => (
                              <li key={t.teacherId} className="mb-3 d-flex align-items-center p-2 rounded bg-white shadow-sm border border-light">
                                <i className="bi bi-person-circle text-primary me-2 fs-5"></i>
                                <span className="fw-bold text-secondary">{t.firstName} {t.lastName}</span>
                              </li>
                            ))}
                          </ul>
                      )}
                  </div>
                )}

                {/* Buttons (Matching Instructor Theme) */}
                <Button
                  className="w-100 py-2 fw-bold mb-2 shadow-sm"
                  onClick={() => navigate("/coordinator/view-teachers")}
                  style={{ backgroundColor: "#1A314A", borderColor: "#1A314A", borderRadius: '10px' }}
                >
                  View Directory
                </Button>
                <Button
                  variant="light"
                  className="w-100 py-2 fw-bold text-muted"
                  onClick={() => navigate("/coordinator/register-instructor")}
                  style={{ borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
                >
                  Register New
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Meetings Card */}
          <Col md={6} lg={5}>
            <Card className="shadow-sm h-100 border-0 rounded-4 overflow-hidden" style={{backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)"}}>
              <Card.Body className="p-4 d-flex flex-column">
                
                {/* Card Header Section */}
                <div className="d-flex align-items-center mb-4">
                    <div style={styles.iconBoxGreen}>
                        <i className="bi bi-calendar-event-fill text-white fs-3"></i>
                    </div>
                    <div className="ms-3">
                        <h4 className="fw-bold mb-0 text-dark">Meetings</h4>
                        <small className="text-muted">{meetings.length} Scheduled</small>
                    </div>
                </div>

                {/* List Content */}
                {loadingMeetings ? (
                  <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>
                ) : (
                  <div className="flex-grow-1 mb-4">
                      {meetings.length === 0 ? (
                          <p className="text-muted small">No meetings scheduled.</p>
                      ) : (
                          <ul className="list-unstyled">
                            {meetings.slice(0, 3).map((m) => (
                              <li key={m.meetingId} className="mb-3 d-flex align-items-center p-2 rounded bg-white shadow-sm border border-light">
                                <i className="bi bi-camera-video-fill text-success me-2 fs-5"></i>
                                <span className="fw-bold text-secondary text-truncate">{m.topic}</span>
                              </li>
                            ))}
                          </ul>
                      )}
                  </div>
                )}

                {/* Buttons */}
                <Button
                  className="w-100 py-2 fw-bold mb-2 shadow-sm"
                  onClick={() => navigate("/coordinator/view-meetings")}
                  style={{ backgroundColor: "#1A314A", borderColor: "#1A314A", borderRadius: '10px' }}
                >
                  Manage Sessions
                </Button>
                <Button
                  variant="light"
                  className="w-100 py-2 fw-bold text-muted"
                  style={{ borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
                  disabled
                >
                  Schedule New
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

// Internal styles for the specific gradient boxes and blobs
const styles = {
    blob1: {
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
        pointerEvents: "none"
    },
    blob2: {
        position: "absolute",
        bottom: "10%",
        left: "20%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
        pointerEvents: "none"
    },
    iconBoxBlue: {
        width: '55px', 
        height: '55px', 
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconBoxGreen: {
        width: '55px', 
        height: '55px', 
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

export default CoordinatorDashboard;
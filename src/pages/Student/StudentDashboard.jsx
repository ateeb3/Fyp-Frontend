import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge } from "react-bootstrap";
import axios from "axios";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeMeetings, setActiveMeetings] = useState({}); 
  const [manualRoomId, setManualRoomId] = useState("");

  const fetchActiveMeetings = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
          const res = await axios.get("https://localhost:7145/api/meetings/active-meetings", {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          const meetingMap = {};
          res.data.forEach(m => {
              meetingMap[m.courseTitle] = { 
                  link: m.link, 
                  startTime: new Date(m.startTime),
                  isLive: m.isLive 
              };
          });
          setActiveMeetings(meetingMap);
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    axios.get("https://localhost:7145/Student/courses", { headers }).then((res) => setCourses(res.data.slice(0, 3)));
    axios.get("https://localhost:7145/Student/teachers", { headers }).then((res) => setTeachers(res.data.slice(0, 3)));

    fetchActiveMeetings();
    const interval = setInterval(fetchActiveMeetings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualJoin = async (e) => {
    e.preventDefault();
    if (manualRoomId.trim()) await processJoin(manualRoomId);
  };

  const processJoin = async (meetingLink) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `https://localhost:7145/api/meetings/join/${meetingLink}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      sessionStorage.setItem("joinRoomId", meetingLink);
      navigate(`/classroom?role=student`);
    } catch (err) {
      if (err.response && err.response.status === 400) {
          alert(err.response.data); 
          fetchActiveMeetings();
      } else {
          alert("Connection failed");
      }
    }
  };

  const formatTime = (date) => {
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Decorative Blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <Container className="py-5" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Header Section */}
        <div className="mb-5 text-center">
            <h2 className="fw-bold mb-2" style={{ color: "#1e293b" }}>Student Dashboard</h2>
            <p className="text-muted">Manage your courses, assignments, and live sessions.</p>
        </div>

        {/* Join Session Card */}
        <Card className="mb-5 border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: "600px", margin: "0 auto", background: 'rgba(255,255,255,0.9)' }}>
            <div className="p-4 bg-white">
                <div className="d-flex align-items-center justify-content-center mb-3 text-primary">
                    <i className="bi bi-camera-video-fill fs-4 me-2"></i>
                    <h5 className="fw-bold mb-0">Join Session Directly</h5>
                </div>
                <Form onSubmit={handleManualJoin}>
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                        <Form.Control 
                            placeholder="Enter Session ID..." 
                            value={manualRoomId} 
                            onChange={(e) => setManualRoomId(e.target.value)} 
                            className="border-0 bg-light px-4 py-3"
                            style={{fontSize: '1rem'}}
                        />
                        <Button variant="primary" type="submit" className="px-4 fw-bold" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', border: 'none'}}>
                            Join Now <i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                    </InputGroup>
                </Form>
            </div>
        </Card>

        {/* Courses Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark mb-0">Your Courses</h4>
            <Button variant="light" size="sm" onClick={fetchActiveMeetings} className="rounded-pill shadow-sm bg-white text-muted">
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </Button>
        </div>
      
        <Row className="g-4 mb-5">
            {courses.map((course) => {
                const meeting = activeMeetings[course.courseTitle];
                const isLive = meeting?.isLive;

                return (
                    <Col key={course.courseId} md={6} lg={4}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 transition-hover" style={isLive ? styles.liveCard : styles.normalCard}>
                            <Card.Body className="d-flex flex-column p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div style={{...styles.iconBox, background: isLive ? 'rgba(220, 38, 38, 0.1)' : 'rgba(59, 130, 246, 0.1)'}}>
                                        <i className={`bi ${isLive ? 'bi-broadcast text-danger' : 'bi-book text-primary'} fs-5`}></i>
                                    </div>
                                    {isLive && <Badge bg="danger" className="rounded-pill px-3 py-2 animate-pulse">LIVE NOW</Badge>}
                                    {meeting && !isLive && <Badge bg="info" className="rounded-pill px-3 py-2 text-white">UPCOMING</Badge>}
                                </div>
                                
                                <Card.Title className="fw-bold mb-1 text-dark">{course.courseTitle}</Card.Title>
                                <Card.Text className="text-muted small mb-4">{course.creditHours} Credit Hours</Card.Text>
                                
                                <div className="mt-auto">
                                    {isLive ? (
                                        <Button variant="danger" className="w-100 fw-bold rounded-3 shadow-sm py-2" onClick={() => processJoin(meeting.link)}>
                                            Join Live Class
                                        </Button>
                                    ) : meeting ? (
                                        <div className="text-center p-2 bg-light rounded-3 border border-light">
                                            <small className="d-block text-muted mb-1 text-uppercase" style={{fontSize: '0.7rem'}}>Scheduled</small>
                                            <div className="fw-bold text-dark">{formatTime(meeting.startTime)}</div>
                                        </div>
                                    ) : (
                                        <Button variant="light" className="w-100 text-muted rounded-3" disabled>No Active Session</Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Row>
      
        <div className="text-center mb-5">
            <Link to="/student/courses" className="btn btn-outline-primary rounded-pill px-4 fw-bold">View All Courses</Link>
        </div>

        {/* Teachers Section */}
        <h4 className="fw-bold text-dark mb-4">Your Instructors</h4>
        <Row className="g-4">
            {teachers.map((teacher) => (
                <Col key={teacher.teacherId} md={6} lg={4}>
                    <Card className="h-100 shadow-sm border-0 rounded-4" style={{backgroundColor: 'rgba(255,255,255,0.7)'}}>
                        <Card.Body className="d-flex align-items-center p-3">
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', border: '1px solid #e2e8f0'}}>
                                <i className="bi bi-person text-secondary fs-4"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">{teacher.firstName} {teacher.lastName}</h6>
                                <small className="text-muted">{teacher.email}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>

      </Container>
    </div>
  );
};

// Internal Styling
const styles = {
    dashboardContainer: {
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
    },
    blob1: {
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
    },
    blob2: {
        position: "absolute",
        bottom: "10%",
        left: "10%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
    },
    normalCard: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
    },
    liveCard: {
        backgroundColor: "#fff",
        border: "1px solid rgba(220, 38, 38, 0.3)", // Red border for live
        boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.15)", // Red glow
    },
    iconBox: {
        width: "45px",
        height: "45px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }
};

// Add this to your global CSS for the pulsing effect
/*
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}
*/

export default StudentDashboard;
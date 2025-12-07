import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Row, Col, Button, Modal, Form, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [instructorName, setInstructorName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State for logic
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [topic, setTopic] = useState(""); 

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!token) throw new Error("Please log in.");
        
        // Decode Token for Name
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setInstructorName(payload.given_name || payload.unique_name || "Instructor");
        } catch { setInstructorName("Instructor"); }

        const headers = { Authorization: `Bearer ${token}` };
        // Fetch only courses for the dashboard overview
        const coursesRes = await axios.get("https://localhost:7145/Teacher/ViewCourses", { headers });
        setCourses(coursesRes.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  // --- LOGIC HANDLERS (Unchanged functionality) ---
  const handleOpenSchedule = (courseTitle) => {
      setSelectedCourse(courseTitle);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduleDate(tomorrow.toISOString().split('T')[0]);
      setScheduleTime("10:00");
      setTopic("");
      setShowModal(true);
  };

  const handleStartNow = async (courseTitle) => {
      const instantTopic = prompt("Enter Meeting Topic (Optional):") || "General Session";
      await createMeeting(courseTitle, new Date(), instantTopic);
  };

  const handleConfirmSchedule = async () => {
      if (!scheduleDate || !scheduleTime) return alert("Pick date/time");
      const combined = new Date(`${scheduleDate}T${scheduleTime}`);
      await createMeeting(selectedCourse, combined, topic || "Scheduled Class");
      setShowModal(false);
  };

  const createMeeting = async (courseTitle, startTime, meetingTopic) => {
    try {
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 
      const meetingData = {
        Title: `Class: ${courseTitle}`,
        Description: "Session",
        Class: courseTitle, 
        Section: "A", 
        StartTime: startTime.toISOString(),
        EndTime: endTime.toISOString(),
        Topic: meetingTopic
      };

      const response = await axios.post(
        "https://localhost:7145/api/meetings/create", 
        meetingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (startTime <= new Date()) {
          const roomLink = response.data.meetingLink || response.data.MeetingLink;
          sessionStorage.setItem("joinRoomId", roomLink);
          navigate(`/classroom?role=instructor`);
      } else {
          alert("Scheduled Successfully!");
      }

    } catch (err) {
      console.error(err);
      alert("Error creating session.");
    }
  };

  // --- LOADING STATE ---
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: '#f8fafc'}}>
        <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div style={styles.dashboardContainer}>
      {/* Decorative Blobs (Matches Login Page) */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <Container fluid className="p-4" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
                <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                    Hello, <span style={{color: "#4f46e5"}}>{instructorName}</span>
                </h2>
                <p className="text-muted mb-0">Here is what's happening with your classes today.</p>
            </div>
            <div className="text-end">
                <Badge bg="primary" className="p-2 px-3 rounded-pill">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Badge>
            </div>
        </div>

        {/* Course Grid */}
        <h5 className="fw-bold mb-4" style={{color: "#64748b"}}>Your Active Courses</h5>
        
        {courses.length === 0 ? (
            <div className="text-center p-5 text-muted bg-white rounded-4 shadow-sm">
                <h5>No courses found.</h5>
            </div>
        ) : (
            <Row>
            {courses.map((course, index) => (
                <Col md={6} lg={4} xl={3} className="mb-4" key={course.courseId || index}>
                <Card className="h-100 border-0" style={styles.courseCard}>
                    <Card.Body className="d-flex flex-column p-4">
                        {/* Course Icon/Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div style={styles.iconBox}>
                                <i className="bi bi-journal-bookmark-fill text-white"></i>
                            </div>
                            <Badge bg="light" text="dark" className="border">Section A</Badge>
                        </div>

                        <Card.Title as="h5" className="fw-bold mb-1" style={{color: '#1e293b'}}>
                            {course.courseTitle}
                        </Card.Title>
                        <Card.Subtitle className="mb-4 text-muted small">
                            {course.courseCode || "CSE-101"}
                        </Card.Subtitle>

                        <div className="mt-auto d-grid gap-2">
                            <Button 
                                style={styles.btnPrimary} 
                                onClick={() => handleStartNow(course.courseTitle)}
                            >
                                <i className="bi bi-lightning-charge-fill me-2"></i> Start Now
                            </Button>
                            <Button 
                                variant="light" 
                                style={styles.btnSecondary}
                                onClick={() => handleOpenSchedule(course.courseTitle)}
                            >
                                <i className="bi bi-calendar-event me-2"></i> Schedule
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
                </Col>
            ))}
            </Row>
        )}

        {/* Schedule Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg rounded-4">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">Schedule Session</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <p className="text-muted small mb-4">Set up a future class for <span className="fw-bold text-dark">{selectedCourse}</span>.</p>
                
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Topic</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="e.g., Chapter 4 Review"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        style={styles.input}
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Date</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={scheduleDate} 
                                onChange={(e) => setScheduleDate(e.target.value)} 
                                style={styles.input}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Time</Form.Label>
                            <Form.Control 
                                type="time" 
                                value={scheduleTime} 
                                onChange={(e) => setScheduleTime(e.target.value)} 
                                style={styles.input}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pe-4 pb-4">
                <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
                <Button style={styles.btnPrimary} onClick={handleConfirmSchedule} className="rounded-pill px-4">Confirm Schedule</Button>
            </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

// Styles matching the Login Page Aesthetic
const styles = {
    dashboardContainer: {
        backgroundColor: "#f8fafc", // Very light slate
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
    courseCard: {
        borderRadius: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default"
    },
    iconBox: {
        width: "45px",
        height: "45px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)"
    },
    btnPrimary: {
        background: "#1e293b",
        border: "none",
        borderRadius: "10px",
        padding: "10px",
        fontWeight: "600",
        transition: "all 0.2s"
    },
    btnSecondary: {
        borderRadius: "10px",
        padding: "10px",
        color: "#64748b",
        fontWeight: "600",
        background: "#f1f5f9",
        border: "1px solid transparent"
    },
    input: {
        backgroundColor: "#f1f5f9",
        border: "none",
        borderRadius: "8px",
        padding: "10px 15px",
        color: "#1e293b"
    }
};

export default InstructorDashboard;
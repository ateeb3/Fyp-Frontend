import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";

const JoinSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      // 1. Store the room ID where Classroom.jsx expects it
      sessionStorage.setItem("joinRoomId", sessionId);
      
      // 2. Redirect to the actual Classroom component within the Student Layout
      // We use 'replace: true' so the user doesn't go back to this intermediate page
      navigate("/student/classroom", { replace: true });
    } else {
      // Fallback if ID is missing
      navigate("/student");
    }
  }, [sessionId, navigate]);

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <Spinner animation="border" variant="primary" role="status" />
      <h4 className="mt-3">Joining Class Session...</h4>
    </Container>
  );
};

export default JoinSession;
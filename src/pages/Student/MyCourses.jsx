import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Spinner } from "react-bootstrap";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      console.warn("No token found in session storage.");
      setLoading(false);
      return;
    }

    axios
      .get("https://localhost:7145/Student/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div style={{backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 0'}}>
      <Container style={{ maxWidth: '1000px' }}>
        <div className="mb-5 text-center">
            <h2 className="fw-bold mb-1" style={{color: '#1e293b'}}>My Enrolled Courses</h2>
            <p className="text-muted">View all academic courses you are currently taking.</p>
        </div>

        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-4 shadow-sm">
            <p className="text-muted mb-0">No courses found or you're not enrolled in any.</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                    <thead className="bg-light text-secondary small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3 border-0">#</th>
                            <th className="border-0">Course Title</th>
                            <th className="border-0 text-center">Credits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course, index) => (
                            <tr key={index} style={{borderBottom: '1px solid #f1f5f9'}}>
                                <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                <td className="fw-bold text-dark">{course.courseTitle}</td>
                                <td className="text-center">
                                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-3">
                                        {course.creditHours} Hrs
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default MyCourses;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Spinner } from "react-bootstrap";

const MyTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      console.warn("No token found.");
      setLoading(false);
      return;
    }

    axios
      .get("https://localhost:7145/Student/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTeachers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching teachers:", err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div style={{backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 0'}}>
      <Container style={{ maxWidth: '1000px' }}>
        <div className="mb-5 text-center">
            <h2 className="fw-bold mb-1" style={{color: '#1e293b'}}>Course Instructors</h2>
            <p className="text-muted">Contact information for your current teachers.</p>
        </div>

        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-4 shadow-sm">
            <p className="text-muted mb-0">No instructors found.</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                    <thead className="bg-light text-secondary small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3 border-0">Instructor</th>
                            <th className="border-0">Email Address</th>
                            <th className="border-0 text-end pe-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher, index) => (
                            <tr key={index} style={{borderBottom: '1px solid #f1f5f9'}}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary fw-bold" style={{width:'40px', height:'40px'}}>
                                            {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                                        </div>
                                        <span className="fw-bold text-dark">{teacher.firstName} {teacher.lastName}</span>
                                    </div>
                                </td>
                                <td className="text-muted">{teacher.email}</td>
                                <td className="text-end pe-4">
                                    <a href={`mailto:${teacher.email}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
                                        <i className="bi bi-envelope me-1"></i> Email
                                    </a>
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

export default MyTeachers;
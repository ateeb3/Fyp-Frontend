import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Alert, Button } from "react-bootstrap";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const token = sessionStorage.getItem("token");

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    const url = "https://localhost:7145/Teacher/ViewStudents";
    try {
      if (!token) throw new Error("User not authenticated. Please log in.");

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format: Expected an array of students.");
      }
      setStudents(response.data);
    } catch (err) {
      console.error(err);
      let errorMessage = err.response?.data?.message || "Something went wrong.";
      setError(errorMessage);
      
      if (retryCount < maxRetries && err.response?.status !== 401 && err.response?.status !== 404) {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          fetchStudents();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [retryCount, token]);

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  if (error) return (
    <Container fluid className="p-4">
      <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
        {error}
        {retryCount < maxRetries && <span> Retrying... ({retryCount + 1}/{maxRetries})</span>}
        <Button variant="link" onClick={() => { setRetryCount(0); fetchStudents(); }}>Retry Now</Button>
      </Alert>
    </Container>
  );

  return (
    <Container fluid className="p-4" style={{backgroundColor: '#f8fafc', minHeight: '100vh'}}>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{maxWidth: '1200px', margin: '0 auto'}}>
        <div className="card-header bg-white border-bottom p-4">
            <h4 className="fw-bold mb-0 text-dark" style={{color: '#1e293b'}}>Enrolled Students</h4>
            <p className="text-muted small mb-0">List of students currently enrolled in your courses.</p>
        </div>
        <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-secondary small text-uppercase">
                    <tr>
                        <th className="ps-4 py-3 border-0">#</th>
                        <th className="border-0">First Name</th>
                        <th className="border-0">Last Name</th>
                        <th className="border-0">Email</th>
                        <th className="border-0">Semester</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => (
                        <tr key={index} style={{borderBottom: '1px solid #f1f5f9'}}>
                            <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                            <td className="fw-bold text-dark">{student.firstName}</td>
                            <td>{student.lastName}</td>
                            <td className="text-primary">{student.email}</td>
                            <td><span className="badge bg-light text-dark border">{student.semester}</span></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {students.length === 0 && <div className="text-center p-5 text-muted">No students found.</div>}
        </div>
      </div>
    </Container>
  );
};

export default StudentList;
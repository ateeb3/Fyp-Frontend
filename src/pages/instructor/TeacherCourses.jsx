import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Alert, Button } from "react-bootstrap";

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const token = sessionStorage.getItem("token");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    const url = "https://localhost:7145/Teacher/ViewCourses";
    try {
      if (!token) throw new Error("User not authenticated.");

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(response.data)) throw new Error("Invalid data format.");
      setCourses(response.data);
    } catch (err) {
      console.error(err);
      let errorMessage = err.response?.data?.message || "Something went wrong.";
      setError(errorMessage);

      if (retryCount < maxRetries && err.response?.status !== 401 && err.response?.status !== 404) {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          fetchCourses();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token, retryCount]);

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  if (error) return (
    <Container fluid className="p-4">
      <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>
    </Container>
  );

  return (
    <Container fluid className="p-4" style={{backgroundColor: '#f8fafc', minHeight: '100vh'}}>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{maxWidth: '1200px', margin: '0 auto'}}>
        <div className="card-header bg-white border-bottom p-4">
            <h4 className="fw-bold mb-0 text-dark" style={{color: '#1e293b'}}>Your Courses</h4>
            <p className="text-muted small mb-0">Courses currently assigned to you.</p>
        </div>
        <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-secondary small text-uppercase">
                    <tr>
                        <th className="ps-4 py-3 border-0">#</th>
                        <th className="border-0">Course Name</th>
                        <th className="border-0">Credit Hours</th>
                        <th className="border-0">Code</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <tr key={course.courseId} style={{borderBottom: '1px solid #f1f5f9'}}>
                            <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                            <td className="fw-bold text-dark">{course.courseTitle}</td>
                            <td><span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10">{course.creditHours} Hrs</span></td>
                            <td className="text-muted">{course.courseCode || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {courses.length === 0 && <div className="text-center p-5 text-muted">No courses assigned.</div>}
        </div>
      </div>
    </Container>
  );
};

export default TeacherCourses;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const AddStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const student = location.state?.student; // Get student data for editing

  // Define mappings
  const qualificationMap = {
    0: "None",
    1: "Bachelors",
    2: "Masters",
    3: "PhD",
  };

  const provinceMap = {
    0: "None",
    1: "Punjab",
    2: "Sindh",
    3: "Balochistan",
    4: "KPK",
    5: "GilgitBaltistan",
  };

  const semesterMap = {
    0: "None",
    1: "First",
    2: "Second",
    3: "Third",
    4: "Fourth",
    5: "Fifth",
    6: "Sixth",
    7: "Seventh",
    8: "Eighth",
  };

  // Initialize formData
  const [formData, setFormData] = useState({
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    cnic: student?.cnic || "",
    dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
    enrollmentNumber: student?.enrollmentNumber || "",
    currentSemester: student?.currentSemester?.toString() || "",
    section: student?.section || "",
    batch: student?.batch?.toString() || "",
    qualification: student?.qualification?.toString() || "",
    enrollmentDate: student?.enrollmentDate ? student.enrollmentDate.split("T")[0] : "",
    personalNumber: student?.personalNumber || "",
    guardianNumber: student?.guardianNumber || "",
    email: student?.email || "",
    address: student?.address || "",
    city: student?.city || "",
    province: student?.province?.toString() || "",
    departmentId: student?.departmentId?.toString() || "",
    userId: student?.userId?.toString() || "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    departments: [],
    users: [],
    qualifications: [],
    provinces: [],
    semesters: [],
  });

  // Fetch dropdown data
  useEffect(() => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    const fetchDropdownData = async () => {
      try {
        const response = await axios.get("https://localhost:7145/Coordinator/GetStudentDropdowns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dropdowns = {
          departments: response.data?.departments || [],
          users: response.data?.users || [],
          qualifications: (response.data?.qualification || []).map((q) => ({
            value: typeof q === "number" ? q.toString() : Object.keys(qualificationMap).find((key) => qualificationMap[key] === q) || "0",
            label: typeof q === "number" ? qualificationMap[q] || "Unknown" : qualificationMap[Object.keys(qualificationMap).find((key) => qualificationMap[key] === q)] || q,
          })),
          provinces: (response.data?.province || []).map((p) => ({
            value: typeof p === "number" ? p.toString() : Object.keys(provinceMap).find((key) => provinceMap[key] === p) || "0",
            label: typeof p === "number" ? provinceMap[p] || "Unknown" : provinceMap[Object.keys(provinceMap).find((key) => provinceMap[key] === p)] || p,
          })),
          semesters: (response.data?.semester || response.data?.semesters || []).length > 0
            ? (response.data?.semester || response.data?.semesters).map((s) => ({
                value: typeof s === "number" ? s.toString() : Object.keys(semesterMap).find((key) => semesterMap[key].toLowerCase() === s.toLowerCase()) || "0",
                label: typeof s === "number" ? semesterMap[s] || "Unknown" : semesterMap[Object.keys(semesterMap).find((key) => semesterMap[key].toLowerCase() === s.toLowerCase())] || s,
              }))
            : Object.entries(semesterMap).map(([value, label]) => ({ value, label })),
        };
        setDropdownData(dropdowns);
      } catch (err) {
        setError("Failed to fetch dropdown data.");
        console.error("Dropdown fetch error:", err);
      }
    };

    fetchDropdownData();
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        cnic: formData.cnic,
        dateOfBirth: formData.dateOfBirth,
        enrollmentNumber: formData.enrollmentNumber,
        currentSemester: parseInt(formData.currentSemester) || 0,
        section: formData.section,
        batch: parseInt(formData.batch) || 0,
        qualification: parseInt(formData.qualification) || 0,
        enrollmentDate: formData.enrollmentDate,
        personalNumber: formData.personalNumber,
        guardianNumber: formData.guardianNumber,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        province: parseInt(formData.province) || 0,
        departmentId: formData.departmentId,
        userId: formData.userId,
      };

      let response;
      if (student) {
        // Update student
        response = await axios.put(`https://localhost:7145/Coordinator/EditStudent/${student.studentId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(response.data); 
      } else {
        // Add new student
        response = await axios.post("https://localhost:7145/Coordinator/AddStudent", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(response.data.message || "Student created and enrolled in semester courses successfully!");
      }
      navigate("/coordinator/view-students");
    } catch (err) {
      console.error("Submit error:", err);
      let errorMessage = err.response?.data?.message || err.message || (student ? "Failed to update student." : "Failed to add student.");
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const modelStateErrors = Object.values(err.response.data.errors).flat().join(", ");
        errorMessage = modelStateErrors || "Validation failed.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "900px" }}>
        
        {/* Header */}
        <div className="mb-4 text-center">
            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{student ? "Edit Student" : "Add Student"}</h2>
            <p className="text-muted">Register a new student into the academic system.</p>
        </div>

        {/* Form Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
                
                {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>}
                {successMessage && <Alert variant="success" className="rounded-3 border-0 shadow-sm">{successMessage}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    
                    {/* Section 1: Personal Info */}
                    <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">Personal Information</h6>
                    <Row className="g-3 mb-4">
                        <Col md={6}><Form.Control placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control placeholder="CNIC (XXXXX-XXXXXXX-X)" name="cnic" value={formData.cnic} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}>
                            <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="bg-light border-0 py-2 text-muted" title="Date of Birth"/>
                        </Col>
                    </Row>

                    {/* Section 2: Contact Info */}
                    <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2 mt-4">Contact Details</h6>
                    <Row className="g-3 mb-4">
                        <Col md={6}><Form.Control type="email" placeholder="Email Address" name="email" value={formData.email} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control placeholder="Personal Phone" name="personalNumber" value={formData.personalNumber} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control placeholder="Guardian Phone" name="guardianNumber" value={formData.guardianNumber} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}><Form.Control placeholder="City" name="city" value={formData.city} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                        <Col md={6}>
                            <Form.Select name="province" value={formData.province} onChange={handleChange} required className="bg-light border-0 py-2">
                                <option value="">Select Province</option>
                                {dropdownData.provinces.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={12}><Form.Control placeholder="Full Address" name="address" value={formData.address} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                    </Row>

                    {/* Section 3: Academic Info */}
                    <div className="p-4 bg-light bg-opacity-50 rounded-4 mb-4 border border-light">
                        <h6 className="fw-bold text-primary text-uppercase small mb-3">Academic Enrollment</h6>
                        <Row className="g-3">
                            <Col md={6}><Form.Control placeholder="Enrollment ID" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} required className="border-0 shadow-sm"/></Col>
                            <Col md={6}><Form.Control type="date" name="enrollmentDate" value={formData.enrollmentDate} onChange={handleChange} required className="border-0 shadow-sm text-muted" title="Enrollment Date"/></Col>
                            
                            <Col md={4}>
                                <Form.Select name="currentSemester" value={formData.currentSemester} onChange={handleChange} required className="border-0 shadow-sm">
                                    <option value="">Semester</option>
                                    {dropdownData.semesters.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={4}><Form.Control placeholder="Section" name="section" value={formData.section} onChange={handleChange} required className="border-0 shadow-sm"/></Col>
                            <Col md={4}><Form.Control type="number" placeholder="Batch" name="batch" value={formData.batch} onChange={handleChange} required className="border-0 shadow-sm"/></Col>
                            
                            <Col md={6}>
                                <Form.Select name="qualification" value={formData.qualification} onChange={handleChange} required className="border-0 shadow-sm">
                                    <option value="">Qualification</option>
                                    {dropdownData.qualifications.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Select name="departmentId" value={formData.departmentId} onChange={handleChange} required className="border-0 shadow-sm">
                                    <option value="">Department</option>
                                    {dropdownData.departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>
                        {student && <div className="text-muted small mt-2 fst-italic"><i className="bi bi-info-circle me-1"></i> Changing semester will update course enrollments automatically.</div>}
                    </div>

                    {/* Section 4: User Account Link */}
                    <div className="mb-4">
                        <label className="fw-bold text-secondary small text-uppercase mb-2">System User Account</label>
                        <Form.Select name="userId" value={formData.userId} onChange={handleChange} required className="bg-light border-0 py-2">
                            <option value="">Link a Registered User Account</option>
                            {dropdownData.users.map(u => <option key={u.userId} value={u.userId}>{u.userName}</option>)}
                        </Form.Select>
                    </div>

                    <div className="d-grid">
                        <Button type="submit" disabled={loading} className="py-3 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                            {loading ? "Processing..." : (student ? "Update Student Profile" : "Register Student")}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default AddStudent;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const AddCoordinator = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const isEdit = state?.isEdit || false;
  const initialCoordinator = state?.coordinator || {};

  const qualificationMap = {
    1: "Bachelors",
    2: "Masters",
    3: "PhD",
  };

  const provinceMap = {
    1: "Punjab",
    2: "Sindh",
    3: "Balochistan",
    4: "KPK",
    5: "GilgitBaltistan",
  };

  // ===================================
  // FORMAT FUNCTIONS
  // ===================================

  // CNIC format: 12345-1234567-1
  const formatCNIC = (value) => {
    value = value.replace(/\D/g, "");
    if (value.length > 5 && value.length <= 12)
      value = value.replace(/(\d{5})(\d{1,7})/, "$1-$2");
    else if (value.length > 12)
      value = value.replace(/(\d{5})(\d{7})(\d{1})/, "$1-$2-$3");
    return value.slice(0, 15);
  };

  // Phone format: 0300-1234567
  const formatPhone = (value) => {
    value = value.replace(/\D/g, "");
    if (value.length > 4)
      value = value.replace(/(\d{4})(\d{1,7})/, "$1-$2");
    return value.slice(0, 12);
  };

  // Auto field handlers
  const handleCNICChange = (e) => {
    setFormData({ ...formData, [e.target.name]: formatCNIC(e.target.value) });
  };

  const handlePhoneChange = (e) => {
    setFormData({ ...formData, [e.target.name]: formatPhone(e.target.value) });
  };

  // Normal handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===================================
  // FORM DATA STATE
  // ===================================

  const [formData, setFormData] = useState({
    firstName: initialCoordinator.firstName || "",
    lastName: initialCoordinator.lastName || "",
    cnic: initialCoordinator.cnic || "",
    fatherName: initialCoordinator.fatherName || "",
    fatherCnic: initialCoordinator.fatherCnic || "",
    dateOfBirth: initialCoordinator.dateOfBirth
      ? new Date(initialCoordinator.dateOfBirth).toISOString().split("T")[0]
      : "",
    qualification: initialCoordinator.qualification || "",
    province: initialCoordinator.province || "",
    city: initialCoordinator.city || "",
    personalNumber: initialCoordinator.personalNumber || "",
    fatherNumber: initialCoordinator.fatherNumber || "",
    emergencyNumber: initialCoordinator.emergencyNumber || "",
    universityName: initialCoordinator.universityName || "",
    departmentId: initialCoordinator.departmentId || "",
    userId: initialCoordinator.userId || "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    departments: [],
    users: [],
  });

  useEffect(() => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    const fetchDropdownData = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7145/Admin/GetCoordinatorDropdowns",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setDropdownData({
          departments: response.data.departments,
          users: response.data.users,
        });
      } catch (err) {
        setError("Failed to fetch dropdown data.");
      }
    };

    fetchDropdownData();
  }, [navigate, token]);

  // ===================================
  // SUBMIT HANDLER
  // ===================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        qualification: parseInt(formData.qualification),
        province: parseInt(formData.province),
      };

      if (isEdit) {
        await axios.put(
          `https://localhost:7145/Admin/EditCoordinator/${initialCoordinator.coordinatorId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "https://localhost:7145/Admin/AddCoordinator",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      navigate("/admin/view-coordinator");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data?.errors) ||
        "Failed to save coordinator."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // UI
  // ===================================

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container style={{ maxWidth: "900px" }}>
        
        {/* Header */}
        <div className="mb-4 text-center">
            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{isEdit ? "Edit Coordinator" : "Add Coordinator"}</h2>
            <p className="text-muted">Manage department coordinator profile details.</p>
        </div>

        {/* Main Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
                
                {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>}

                <Form onSubmit={handleSubmit}>

                  {/* Section 1: Personal Details */}
                  <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">Personal Information</h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}><Form.Control placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                    <Col md={6}><Form.Control placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                    <Col md={6}><Form.Control placeholder="CNIC (XXXXX-XXXXXXX-X)" name="cnic" value={formData.cnic} onChange={handleCNICChange} required className="bg-light border-0 py-2"/></Col>
                    <Col md={6}><Form.Control placeholder="Personal Phone" name="personalNumber" value={formData.personalNumber} onChange={handlePhoneChange} required className="bg-light border-0 py-2"/></Col>
                  </Row>

                  {/* Section 2: Family Info */}
                  <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2 mt-4">Guardian / Family Info</h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}><Form.Control placeholder="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required className="bg-light border-0 py-2"/></Col>
                    <Col md={6}><Form.Control placeholder="Father CNIC" name="fatherCnic" value={formData.fatherCnic} onChange={handleCNICChange} required className="bg-light border-0 py-2"/></Col>
                    <Col md={6}><Form.Control placeholder="Father Phone" name="fatherNumber" value={formData.fatherNumber} onChange={handlePhoneChange} required className="bg-light border-0 py-2"/></Col>
                    <Col md={6}><Form.Control placeholder="Emergency Phone" name="emergencyNumber" value={formData.emergencyNumber} onChange={handlePhoneChange} required className="bg-light border-0 py-2"/></Col>
                  </Row>

                  {/* Section 3: Academic & Location */}
                  <div className="p-4 bg-light bg-opacity-50 rounded-4 mb-4 border border-light">
                      <h6 className="fw-bold text-primary text-uppercase small mb-3">Academic & Location</h6>
                      <Row className="g-3">
                        <Col md={6}>
                            <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="border-0 shadow-sm text-muted"/>
                        </Col>
                        <Col md={6}>
                            <Form.Select name="qualification" value={formData.qualification} onChange={handleChange} required className="border-0 shadow-sm">
                                <option value="">Qualification</option>
                                {Object.entries(qualificationMap).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Select name="province" value={formData.province} onChange={handleChange} required className="border-0 shadow-sm">
                                <option value="">Province</option>
                                {Object.entries(provinceMap).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={6}><Form.Control placeholder="City" name="city" value={formData.city} onChange={handleChange} required className="border-0 shadow-sm"/></Col>
                        <Col md={12}><Form.Control placeholder="University Name" name="universityName" value={formData.universityName} onChange={handleChange} required className="border-0 shadow-sm"/></Col>
                        <Col md={12}>
                            <Form.Select name="departmentId" value={formData.departmentId} onChange={handleChange} required className="border-0 shadow-sm">
                                <option value="">Department</option>
                                {dropdownData.departments.map((dep) => <option key={dep.departmentId} value={dep.departmentId}>{dep.departmentName}</option>)}
                            </Form.Select>
                        </Col>
                      </Row>
                  </div>

                  {/* Section 4: User Account */}
                  <div className="mb-4">
                      <label className="fw-bold text-secondary small text-uppercase mb-2">System User Account</label>
                      <Form.Select name="userId" value={formData.userId} onChange={handleChange} required className="bg-light border-0 py-2">
                          <option value="">Link User Account</option>
                          {dropdownData.users.map((u) => <option key={u.userId} value={u.userId}>{u.userName}</option>)}
                      </Form.Select>
                  </div>

                  <div className="d-grid">
                      <Button type="submit" disabled={loading} className="py-3 fw-bold rounded-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                          {loading ? "Processing..." : (isEdit ? "Update Profile" : "Save Coordinator")}
                      </Button>
                  </div>

                </Form>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default AddCoordinator;
// ViewDepartments.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Container } from "react-bootstrap";


const ViewDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = sessionStorage.getItem("token");

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      setError("");
      try {
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await axios.get("https://localhost:7145/Admin/ViewDepartments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetch response:", response.data);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid data format: Expected an array of departments.");
        }

        response.data.forEach((dept, index) => {
          if (!dept.departmentId || !dept.departmentName) {
            console.warn(`Invalid department at index ${index}:`, dept);
          }
        });

        setDepartments(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || err.message || "Failed to load departments.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [token]);

  // Handle edit button click
  const handleEdit = (dept) => {
    console.log("Editing department:", dept);
    setEditId(dept.departmentId);
    setEditedName(dept.departmentName);
    setError("");
  };

  // Handle save edit
  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setError("Department name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving department:", { departmentId: id, departmentName: editedName });
      const response = await axios.put(
        `https://localhost:7145/Admin/EditDepartment/${id}`,
        { departmentId: id, departmentName: editedName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Edit response:", response.data);
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.departmentId === id ? { ...dept, departmentName: editedName } : dept
        )
      );
      setEditId(null);
      setEditedName("");
      setError("");
    } catch (err) {
      console.error("Edit error:", err);
      setError(
        err.response?.data?.message ||
        err.response?.status === 400
          ? "Invalid request. Please check the department details."
          : err.message ||
            "Failed to update department."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditId(null);
    setEditedName("");
    setError("");
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setIsDeleting(true);
      try {
        console.log("Deleting department ID:", id);
        const response = await axios.delete(`https://localhost:7145/Admin/DeleteDepartment/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Delete response:", response.data);
        setDepartments((prev) => {
          const updated = prev.filter((dept) => dept.departmentId !== id);
          console.log("Updated departments:", updated);
          return updated;
        });
        setError("");
      } catch (err) {
        console.error("Delete error:", err);
        setError(
          err.response?.data?.message ||
          err.response?.status === 400
            ? "Invalid request. Please check the department details."
            : err.message ||
              "Failed to delete department."
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <Container fluid className="p-3"><p>Loading departments...</p></Container>;

  return (
    <Container fluid className="p-4">
      <h2>Departments</h2>
      {error && <p className="text-danger">{error}</p>}

      {!loading && departments.length === 0 && !error && (
        <p>No departments found.</p>
      )}

      {departments.length > 0 && (
        <table className="table table-striped table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Department Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={dept.departmentId}>
                <td>{index + 1}</td>
                <td>
                  {editId === dept.departmentId ? (
                    <Form.Control
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    dept.departmentName
                  )}
                </td>
                <td>
                  {editId === dept.departmentId ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleSave(dept.departmentId)}
                        disabled={isSaving || !editedName.trim()}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="ms-2"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="light" size="sm" className="rounded-pill border-0 me-2 fw-bold text-white" style={{backgroundColor: '#1e293b'}}
                        onClick={() => handleEdit(dept)}
                        disabled={editId !== null}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger" size="sm" className="rounded-pill border-0 bg-opacity-10 text-danger fw-bold" style={{backgroundColor: '#fee2e2', color: '#dc2626'}}
                        onClick={() => handleDelete(dept.departmentId)}
                        disabled={isDeleting || editId !== null}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
  );
};

export default ViewDepartments;
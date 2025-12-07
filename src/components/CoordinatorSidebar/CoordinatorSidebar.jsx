import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./CoordinatorSidebar.css";

const CoordinatorSidebar = ({ isOpen, setIsOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState({
    instructors: false,
    students: false,
    courses: false,
    enrolled: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = (key) => {
    // If sidebar is closed, open it first
    if (!isOpen) {
      setIsOpen(true);
      // Reset others and open this one
      setDropdownOpen({
        instructors: false,
        students: false,
        courses: false,
        enrolled: false,
        [key]: true 
      });
      return;
    }

    // 🔥 LOGIC CHANGE: Close others automatically
    setDropdownOpen((prev) => ({
        instructors: false,
        students: false,
        courses: false,
        enrolled: false,
        [key]: !prev[key] // Toggle only the clicked one
    }));
  };

  // Helper for Dropdown Sections
  const renderDropdownSection = (label, key, iconClass, links) => (
    <li className="nav-item">
      <button
        className={`dropdown-toggle ${dropdownOpen[key] ? "show" : ""}`}
        onClick={() => toggleDropdown(key)}
        type="button"
      >
        <i className={`bi ${iconClass}`}></i>
        {isOpen && (
          <>
            <span className="flex-grow-1">{label}</span>
            {/* Added styling class for rotation animation */}
            <i className={`bi bi-chevron-down dropdown-chevron small opacity-50`}></i>
          </>
        )}
      </button>
      
      {/* Animation class added via CSS (dropdown-menu handles opacity/display) */}
      <ul className={`dropdown-menu ${dropdownOpen[key] && isOpen ? "show" : ""}`}>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="dropdown-item">
                {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );

  return (
    <div 
      className={`sidebar d-flex flex-column ${isOpen ? "open" : "closed"}`}
      style={{
        // Force background inline to ensure color is correct immediately
        background: "linear-gradient(180deg, #1A314A 0%, #0B1C2E 100%)",
      }}
    >
      
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
         {isOpen && <h5 className="m-0 fw-bold text-white" style={{letterSpacing:'1px'}}>CP <span style={{color:'#60a5fa'}}>Coordinator</span></h5>}
         <button className="btn btn-link text-white p-0 ms-auto toggle-btn" onClick={() => setIsOpen(!isOpen)} style={{width: 'auto'}}>
            <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"} fs-4`}></i>
         </button>
      </div>
      <div className="mx-3 mb-3 border-bottom border-secondary opacity-25"></div>

      <ul className="nav flex-column flex-grow-1 overflow-auto custom-scrollbar">
        {/* Dashboard Link */}
        <li className="nav-item">
          <Link
            to="/coordinator-dashboard"
            className={`nav-link ${location.pathname === '/coordinator-dashboard' ? 'active-link' : ''}`}
          >
            <i className="bi bi-grid-1x2-fill"></i>
            {isOpen && <span>Dashboard</span>}
          </Link>
        </li>

        {/* Sections with auto-close logic */}
        {renderDropdownSection("Instructors", "instructors", "bi-person-badge-fill", [
            { to: "/coordinator/view-instructors", label: "View All" },
            { to: "/coordinator/register-instructor", label: "Register New" },
            { to: "/coordinator/add-instructor", label: "Add Profile" },
        ])}

        {renderDropdownSection("Students", "students", "bi-people-fill", [
            { to: "/coordinator/view-students", label: "View All" },
            { to: "/coordinator/register-student", label: "Register New" },
            { to: "/coordinator/add-student", label: "Add Profile" },
            { to: "/coordinator/promote-students", label: "Promote" },
        ])}

        {renderDropdownSection("Courses", "courses", "bi-journal-bookmark-fill", [
            { to: "/coordinator/view-courses", label: "Course Catalog" },
            { to: "/coordinator/add-course", label: "Add Course" },
            { to: "/coordinator/courses-assigned", label: "Assign Instructor" },
            { to: "/coordinator/view-assigned-courses", label: "View Assignments" },
        ])}

        {renderDropdownSection("Enrollment", "enrolled", "bi-person-check-fill", [
            { to: "/coordinator/enroll-students", label: "Enroll Student" },
            { to: "/coordinator/view-enroll-students", label: "View Enrollments" },
        ])}

        <div className="my-2 mx-3 border-top border-secondary opacity-25"></div>

        <li className="nav-item">
          <Link to="/coordinator/change-password" className="nav-link">
            <i className="bi bi-shield-lock-fill"></i>
            {isOpen && <span>Security</span>}
          </Link>
        </li>
      </ul>

      <button className="logout-btn" onClick={() => { sessionStorage.clear(); navigate("/"); }}>
        <i className="bi bi-box-arrow-right fs-5"></i>
        {isOpen && <span>Sign Out</span>}
      </button>
    </div>
  );
};

export default CoordinatorSidebar;
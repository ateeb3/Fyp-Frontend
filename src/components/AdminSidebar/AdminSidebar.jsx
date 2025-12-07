import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./AdminSidebar.css";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper for Nav Items
  const NavItem = ({ to, icon, label }) => (
    <li className="nav-item">
      <Link 
        to={to} 
        className={`nav-link ${location.pathname === to ? 'active-link' : ''}`}
      >
        <i className={`bi ${icon}`}></i>
        {isOpen && <span>{label}</span>}
      </Link>
    </li>
  );

  return (
    <div 
      className={`sidebar d-flex flex-column ${isOpen ? "open" : "closed"}`}
      style={{
        // Inline fallback to ensure dark gradient works immediately
        background: "linear-gradient(180deg, #1A314A 0%, #0B1C2E 100%)",
      }}
    >
      
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
         {isOpen && <h5 className="m-0 fw-bold text-white" style={{letterSpacing:'1px'}}>CP <span style={{color:'#60a5fa'}}>Admin</span></h5>}
         <button className="btn btn-link text-white p-0 ms-auto toggle-btn" onClick={() => setIsOpen(!isOpen)} style={{width: 'auto'}}>
            <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"} fs-4`}></i>
         </button>
      </div>
      <div className="mx-3 mb-3 border-bottom border-secondary opacity-25"></div>

      {/* Navigation List */}
      <ul className="nav flex-column flex-grow-1 overflow-auto custom-scrollbar">
        
        {/* Dashboard */}
        <NavItem to="/admin" icon="bi-speedometer2" label="Dashboard" />

        <div className="my-2 mx-3 border-top border-secondary opacity-25"></div>
        <div className="px-3 py-2 small text-uppercase text-secondary fw-bold" style={{fontSize:'0.75rem', opacity: isOpen ? 0.7 : 0}}>
            {isOpen ? "Department Management" : "..."}
        </div>

        <NavItem to="/admin/create-department" icon="bi-building-add" label="Create Department" />
        <NavItem to="/admin/view-departments" icon="bi-building" label="View Departments" />

        <div className="my-2 mx-3 border-top border-secondary opacity-25"></div>
        <div className="px-3 py-2 small text-uppercase text-secondary fw-bold" style={{fontSize:'0.75rem', opacity: isOpen ? 0.7 : 0}}>
            {isOpen ? "Staff Management" : "..."}
        </div>

        <NavItem to="/admin/register-coordinator" icon="bi-person-plus-fill" label="Register Coordinator" />
        <NavItem to="/admin/add-coordinator" icon="bi-person-vcard" label="Add Coordinator Profile" />
        <NavItem to="/admin/view-coordinator" icon="bi-person-lines-fill" label="View Coordinators" />

        <div className="my-2 mx-3 border-top border-secondary opacity-25"></div>

        <NavItem to="/admin/change-password" icon="bi-shield-lock-fill" label="Security" />
      </ul>

      {/* Footer */}
      <button 
        className="logout-btn"
        onClick={() => {
          sessionStorage.clear();
          navigate("/");
        }}
      >
        <i className="bi bi-box-arrow-right fs-5"></i>
        {isOpen && <span>Sign Out</span>}
      </button>
    </div>
  );
};

export default AdminSidebar;
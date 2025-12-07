import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// You can reuse InstructorSidebar.css or create StudentSidebar.css with the same content
import "./StudentSidebar.css"; 

const StudentSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`sidebar d-flex flex-column text-white ${isOpen ? "open" : "closed"}`}
      style={{
        // FORCE BACKGROUND: Dark Navy Gradient
        background: "linear-gradient(180deg, #1A314A 0%, #0B1C2E 100%)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1050,
        transition: "width 0.3s ease",
        boxShadow: "4px 0 15px rgba(0,0,0,0.3)",
        overflowX: "hidden",
        whiteSpace: "nowrap"
      }}
    >
      
      {/* 1. Header / Toggle */}
      <div className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {isOpen && <h5 className="m-0 fw-bold" style={{letterSpacing: '1px', color: '#fff'}}>CP <span style={{color: '#60a5fa'}}>Student</span></h5>}
        <button className="btn btn-link text-white p-0 ms-auto" onClick={() => setIsOpen(!isOpen)}>
          <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"} fs-4 text-white`}></i>
        </button>
      </div>

      {/* 2. Main Nav */}
      <div className="flex-grow-1 overflow-auto custom-scrollbar">
        
        {/* Dashboard Button (Primary) */}
        <div className="px-3 mb-4 mt-3">
            <button 
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 text-white shadow-sm"
                onClick={() => navigate("/student-dashboard")}
                style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    border: "none",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: "600"
                }}
            >
                <i className="bi bi-speedometer2"></i>
                {isOpen && <span>Dashboard</span>}
            </button>
        </div>

        <ul className="nav flex-column px-2">
          <NavItem to="/student/courses" icon="bi-book" label="My Courses" isOpen={isOpen} />
          <NavItem to="/student/tasks" icon="bi-list-check" label="Assignments" isOpen={isOpen} />
          <NavItem to="/student/submitted-tasks" icon="bi-clock-history" label="History" isOpen={isOpen} />
          
          <div className="my-3 mx-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
          
          <NavItem to="/student/teachers" icon="bi-people" label="Teachers" isOpen={isOpen} />
          <NavItem to="/student/reports" icon="bi-bar-chart" label="Analytics" isOpen={isOpen} />
        </ul>
      </div>

      {/* 3. Footer */}
      <div className="p-3 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <NavItem to="/student/change-password" icon="bi-key-fill" label="Security" isOpen={isOpen} />
        <button
          className="btn btn-link nav-link text-decoration-none w-100 mt-2"
          style={{ 
             color: '#ef4444', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '16px', 
             padding: '12px 20px',
             justifyContent: isOpen ? 'flex-start' : 'center'
          }}
          onClick={() => { sessionStorage.clear(); navigate("/"); }}
        >
          <i className="bi bi-box-arrow-right fs-5"></i>
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>

    </div>
  );
};

// Reuse the styled NavItem helper
const NavItem = ({ to, icon, label, isOpen }) => (
  <li className="nav-item mb-1">
    <NavLink 
        to={to} 
        className={({ isActive }) => 
            `nav-link d-flex align-items-center ${isActive ? 'active-link' : ''}`
        }
        style={({ isActive }) => ({
            color: isActive ? '#60a5fa' : '#cbd5e1',
            background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            padding: '12px 20px',
            borderRadius: '12px',
            gap: '16px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            justifyContent: isOpen ? 'flex-start' : 'center'
        })}
        end
    >
      <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}></i>
      {isOpen && <span style={{ fontWeight: '500' }}>{label}</span>}
    </NavLink>
  </li>
);

export default StudentSidebar;
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./InstructorSidebar.css"; 

const InstructorSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const startSession = async () => {
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const joinLink = `${window.location.origin}/join/${sessionId}`;
    const token = sessionStorage.getItem('token');

    try {
        await axios.post('https://localhost:7145/api/Meeting/start', 
            JSON.stringify(sessionId),
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        navigator.clipboard.writeText(joinLink);
        alert(`Session started!\nLink copied to clipboard.`);
        navigate(`/classroom?room=${sessionId}&role=instructor`);

    } catch (error) {
        console.error("Failed to start session:", error);
        alert("Error starting session.");
    }
  };

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
        boxShadow: "4px 0 15px rgba(0,0,0,0.3)", // Drop shadow to separate from white dashboard
        overflowX: "hidden",
        whiteSpace: "nowrap"
      }}
    >
      
      {/* 1. Header / Toggle */}
      <div className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {isOpen && <h5 className="m-0 fw-bold" style={{letterSpacing: '1px', color: '#fff'}}>CP <span className="text-primary" style={{color: '#60a5fa !important'}}>Instructor</span></h5>}
        <button className="btn btn-link text-white p-0 ms-auto" onClick={() => setIsOpen(!isOpen)}>
          <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"} fs-4 text-white`}></i>
        </button>
      </div>

      {/* 2. Main Nav */}
      <div className="flex-grow-1 overflow-auto custom-scrollbar">
        
        {/* Quick Action Button */}
        <div className="px-3 mb-4 mt-3">
            <button 
                className="btn w-100 d-flex align-items-center justify-content-center gap-2 text-white shadow-sm"
                onClick={startSession}
                style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    border: "none",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: "600"
                }}
            >
                <i className="bi bi-camera-video-fill"></i>
                {isOpen && <span>Instant Class</span>}
            </button>
        </div>

        <ul className="nav flex-column px-2">
          <NavItem to="/instructor-dashboard" icon="bi-grid-1x2-fill" label="Dashboard" isOpen={isOpen} />
          <NavItem to="/instructor/teacher-courses" icon="bi-journal-bookmark-fill" label="My Courses" isOpen={isOpen} />
          <NavItem to="/instructor/students" icon="bi-people-fill" label="Students" isOpen={isOpen} />
          
          <div className="my-3 mx-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
          
          <NavItem to="/instructor/assign-task" icon="bi-plus-circle-dotted" label="Assign Task" isOpen={isOpen} />
          <NavItem to="/instructor/grading" icon="bi-check-circle" label="Grading" isOpen={isOpen} />
          <NavItem to="/instructor/reports" icon="bi-bar-chart-line" label="Reports" isOpen={isOpen} />
        </ul>
      </div>

      {/* 3. Footer */}
      <div className="p-3 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <NavItem to="/instructor/change-password" icon="bi-shield-lock" label="Security" isOpen={isOpen} />
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

// Helper Component: Handles the Active State styling cleanly
const NavItem = ({ to, icon, label, isOpen }) => (
  <li className="nav-item mb-1">
    <NavLink 
        to={to} 
        className={({ isActive }) => 
            `nav-link d-flex align-items-center ${isActive ? 'active-link' : ''}`
        }
        style={({ isActive }) => ({
            color: isActive ? '#60a5fa' : '#cbd5e1', // Blue if active, Light Grey if not
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

export default InstructorSidebar;
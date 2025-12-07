import React, { useEffect, useRef, useState } from "react";
import "./Classroom.css";
import createRTCClient from "../../webrtc/rtcClient"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
// 🔥 Import the tracker
import AttentivenessTracker from "../../components/AttentivenessTracker";

export default function Classroom() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  
  const [remoteStreams, setRemoteStreams] = useState({}); 
  const [visiblePeers, setVisiblePeers] = useState([]);

  const [participants, setParticipants] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const [meetingInfo, setMeetingInfo] = useState({ topic: "Live Session", instructor: "", course: "" });

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [shareRequests, setShareRequests] = useState([]); 
  const [canShare, setCanShare] = useState(false); 
  const [globalShareAllowed, setGlobalShareAllowed] = useState(false);

  // --- REFS ---
  const rtc = useRef(null); 
  const myStreamRef = useRef(null); 
  const effectRan = useRef(false);
  const myVideoRef = useRef(null);
  
  const userRole = new URLSearchParams(window.location.search).get("role") || "student";
  
  const myUserId = useRef(
      userRole === "instructor" 
      ? "instructor" 
      : `student-${Math.floor(Math.random() * 10000)}`
  ).current;

  const token = sessionStorage.getItem("token");
  let myName = "Unknown User";
  if (token) {
      try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const f = payload.firstName || payload.given_name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "";
          const l = payload.lastName || payload.family_name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || "";
          if (f || l) { myName = `${f} ${l}`.trim(); } 
          else { myName = payload.name || payload.unique_name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "User"; }
      } catch (e) { console.error(e); }
  }

  const roomId = sessionStorage.getItem("joinRoomId") || "default-room";

  useEffect(() => {
      if(!token) return;
      const fetchInfo = async () => {
          try {
              const res = await axios.get(`https://localhost:7145/api/meetings/info/${roomId}`, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setMeetingInfo({
                  topic: res.data.topic || "General Discussion",
                  instructor: res.data.instructorName || "Instructor",
                  course: res.data.course || "Classroom"
              });
          } catch (e) {}
      };
      fetchInfo();
  }, [roomId, token]);

  useEffect(() => {
    if (effectRan.current === true) return;

    async function init() {
      try {
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch(e) {
            console.warn("Video failed, trying audio only...");
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        }
        
        myStreamRef.current = stream; 
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        setParticipants([{ id: myUserId, name: `${myName} (You)` }]);

        rtc.current = createRTCClient({
            url: "https://localhost:7145/hubs/signaling", 
            roomId: roomId,
            userId: myUserId,
            userName: myName 
        });

        if (rtc.current.setLocalStream) rtc.current.setLocalStream(stream);

        // --- EVENTS ---
        rtc.current.events.onScreenShareRequest = (reqId, reqName) => {
            if (userRole === "instructor") {
                setShareRequests(prev => {
                    if (prev.find(r => r.id === reqId)) return prev;
                    return [...prev, { id: reqId, name: reqName || `User ${reqId}` }];
                });
            }
        };
        rtc.current.events.onScreenShareResult = (isGranted) => {
            if (isGranted) {
                setCanShare(true);
                if(window.confirm("Permission granted! Start sharing screen now?")) startScreenShare();
            } else {
                alert("Host denied your screen share request.");
                setCanShare(false);
            }
        };
        rtc.current.events.onScreenShareAccessUpdate = (isAllowed) => {
            setCanShare(isAllowed);
            if(userRole === "instructor") setGlobalShareAllowed(isAllowed);
        };
        
        rtc.current.events.onPeerLeave = (peerId) => {
            setRemoteStreams((prev) => { const n = { ...prev }; delete n[peerId]; return n; });
            setVisiblePeers((prev) => prev.filter(id => id !== peerId));
            setParticipants((prev) => prev.filter(p => p.id !== peerId));
        };
        
        rtc.current.events.onPeerNameUpdate = (peerId, peerName) => {
             setParticipants((prev) => {
                const idx = prev.findIndex(p => p.id === peerId);
                if (idx !== -1) { const u = [...prev]; u[idx] = { ...u[idx], name: peerName }; return u; }
                return [...prev, { id: peerId, name: peerName }];
             });
        };
        rtc.current.events.onMeetingEnded = () => { alert("The host has ended the meeting."); handleLeave(true); };
        
        rtc.current.events.onRemoteStream = (peerId, remoteStream) => {
          setRemoteStreams((prev) => ({ ...prev, [peerId]: remoteStream }));
          
          setVisiblePeers((prev) => {
              if (prev.length < 3 && !prev.includes(peerId)) {
                  return [...prev, peerId];
              }
              return prev;
          });

          setParticipants((prev) => { 
              if (prev.some(p => p.id === peerId)) return prev; 
              return [...prev, { id: peerId, name: `User ${peerId}` }]; 
          });
        };

        await rtc.current.joinRoom(roomId);
      } catch (err) { console.error("Init Error:", err); }
    }

    init();
    effectRan.current = true;
    return () => { stopEverything(); };
  }, []); 

  // --- ACTIONS ---
  
  const handlePinUser = (peerId) => {
      if (peerId === myUserId) return;
      if (visiblePeers.includes(peerId)) return;

      setVisiblePeers(prev => {
          const newList = [...prev];
          if (newList.length >= 3) {
              newList.shift();
          }
          newList.push(peerId);
          return newList;
      });
  };

  const handleCopyCode = () => {
      navigator.clipboard.writeText(roomId);
      alert("Meeting Code copied!");
  };

  const handleShareClick = async () => {
      if (isScreenSharing) { stopScreenShare(); return; }
      if (userRole === "instructor") { await startScreenShare(); } 
      else {
          if (canShare) { await startScreenShare(); } else {
              if(window.confirm("Request permission from host?")) {
                  rtc.current.requestScreenShare(roomId);
                  alert("Request sent.");
              }
          }
      }
  };

  const startScreenShare = async () => {
      try {
          const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          const t = s.getVideoTracks()[0];
          t.onended = () => { stopScreenShare(); };
          if (rtc.current) rtc.current.replaceVideoTrack(t);
          if (myVideoRef.current) myVideoRef.current.srcObject = s;
          setIsScreenSharing(true);
      } catch (e) {}
  };

  const stopScreenShare = () => {
      if (myStreamRef.current) {
          const t = myStreamRef.current.getVideoTracks()[0];
          if (rtc.current) rtc.current.replaceVideoTrack(t);
          if (myVideoRef.current) myVideoRef.current.srcObject = myStreamRef.current;
      }
      setIsScreenSharing(false);
      if (userRole !== "instructor") setCanShare(false); 
  };

  const handlePermission = (id, allow) => {
      if (allow) rtc.current.allowScreenShare(id);
      else rtc.current.denyScreenShare(id);
      setShareRequests(prev => prev.filter(r => r.id !== id));
  };

  const toggleGlobalShare = async () => {
      const newState = !globalShareAllowed;
      setGlobalShareAllowed(newState);
      if (rtc.current) await rtc.current.toggleScreenShareAccess(roomId, newState);
  };

  const stopEverything = () => {
      if (myStreamRef.current) { myStreamRef.current.getTracks().forEach(t => t.stop()); myStreamRef.current = null; }
      if (rtc.current) { rtc.current.closeAll(); rtc.current = null; }
  };

  const toggleMic = () => { if (myStreamRef.current) { const t = myStreamRef.current.getAudioTracks()[0]; if(t) { t.enabled = !t.enabled; setMicOn(t.enabled); } } };
  const toggleCamera = () => { if (myStreamRef.current) { const t = myStreamRef.current.getVideoTracks()[0]; if(t) { t.enabled = !t.enabled; setCameraOn(t.enabled); } } };

  const handleLeave = async (force) => {
      if (userRole === "instructor" && !force) {
          if (!window.confirm("End meeting for everyone?")) return;
          try {
              if (rtc.current) await rtc.current.endMeeting(roomId);
              await axios.post(`https://localhost:7145/api/meetings/end/${roomId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
          } catch(e) {}
      } else if (userRole !== "instructor" && !force) {
          if (!window.confirm("Leave meeting?")) return;
      }
      stopEverything(); 
      setTimeout(() => { navigate(userRole === "instructor" ? "/instructor-dashboard" : "/student-dashboard"); }, 100);
  };

  const getInitials = (n) => {
      if(!n) return "U";
      const p = n.replace("(You)", "").trim().split(" ");
      return (p[0][0] + (p.length > 1 ? p[p.length-1][0] : "")).toUpperCase();
  };

  const getParticipantName = (id) => {
      const p = participants.find(part => part.id === id);
      return p ? p.name : `User ${id}`;
  };

  return (
    <div className="meeting-container">
      {/* LEFT SIDEBAR */}
      {showSidebar && (
        <div className="sidebar">
            <div className="sidebar-top">
                <div className="meeting-meta">
                    <span className="meta-course">{meetingInfo.course}</span>
                    <h2 className="meta-topic" title={meetingInfo.topic}>{meetingInfo.topic}</h2>
                    <span className="meta-instructor">By {meetingInfo.instructor}</span>
                </div>
                <div className="meeting-code-box" onClick={handleCopyCode} title="Copy Code">
                    <span className="code-label">CODE:</span>
                    <span className="code-value">{roomId}</span>
                    <span className="copy-icon">📋</span>
                </div>
            </div>

            <div className="sidebar-content">
                {/* TRACKER (STUDENTS ONLY) */}
                {userRole === "student" && (
                    <div className="mb-4">
                         <AttentivenessTracker sessionId={roomId} />
                    </div>
                )}

                {/* HOST CONTROLS */}
                {userRole === "instructor" && (
                    <div className="host-panel">
                        <div className="panel-header"><i className="bi bi-shield-lock-fill"></i> Host Controls</div>
                        <div className="form-check form-switch mb-2">
                            <input className="form-check-input" type="checkbox" checked={globalShareAllowed} onChange={toggleGlobalShare} />
                            <label className="form-check-label small fw-bold text-dark">Allow Screen Sharing</label>
                        </div>
                        {shareRequests.map(r => (
                            <div key={r.id} className="request-item">
                                <span className="request-name">{r.name} wants to share</span>
                                <div className="request-actions">
                                    <button className="btn-icon btn-accept" onClick={()=>handlePermission(r.id, true)}><i className="bi bi-check"></i></button>
                                    <button className="btn-icon btn-deny" onClick={()=>handlePermission(r.id, false)}><i className="bi bi-x"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PARTICIPANTS */}
                <div className="participants-section">
                    <div className="section-header">
                        <span>Participants ({participants.length})</span>
                    </div>
                    <div className="participants-list">
                        {participants.map((p) => (
                            <div 
                                key={p.id} 
                                className={`participant-row ${visiblePeers.includes(p.id) || p.id === myUserId ? 'active-row' : ''}`}
                                onClick={() => handlePinUser(p.id)}
                                title={p.id === myUserId ? "You" : "Click to view video"}
                                style={{cursor: p.id === myUserId ? 'default' : 'pointer'}}
                            >
                                <div className={`avatar ${p.id === myUserId ? 'avatar-me' : 'avatar-other'}`}>
                                    {getInitials(p.name)}
                                </div>
                                <div className="participant-details">
                                    <span className="p-name">{p.name}</span>
                                    <span className="p-role">
                                        {p.id === myUserId ? "You" : (visiblePeers.includes(p.id) ? "Viewing" : "Click to View")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MAIN VIDEO STAGE */}
      <div className="main-stage">
        {!showSidebar && (
            <div className="floating-header">
                <span className="float-topic">{meetingInfo.topic}</span>
            </div>
        )}

        <div className="video-grid-container">
            <div className={`video-grid count-${visiblePeers.length + 1}`}>
                
                {/* Local User */}
                <div className="video-card local-card">
                    <video ref={myVideoRef} autoPlay playsInline muted className={isScreenSharing ? "" : "mirror"} />
                    <div className="video-overlay">
                        <span className="user-label">{myName} (You)</span>
                        <div className="status-icons">{!micOn && <span className="icon-muted"><i className="bi bi-mic-mute-fill"></i></span>}</div>
                    </div>
                </div>

                {/* Remote Users */}
                {visiblePeers.map((peerId) => (
                    <div key={peerId} className="video-card">
                        <video 
                            autoPlay 
                            playsInline 
                            ref={(el) => { 
                                if (el && remoteStreams[peerId] && el.srcObject !== remoteStreams[peerId]) {
                                    el.srcObject = remoteStreams[peerId]; 
                                }
                            }} 
                        />
                        <div className="video-overlay">
                            <span className="user-label">{getParticipantName(peerId)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* CONTROLS DOCK */}
        <div className="controls-wrapper">
            <div className="controls-dock">
                <button className={`dock-btn ${showSidebar ? 'active' : ''}`} onClick={()=>setShowSidebar(!showSidebar)} title="Toggle Participants">
                    <i className="bi bi-people-fill"></i>
                </button>
                
                <div className="divider"></div>
                
                <button className={`dock-btn ${!micOn ? 'danger' : ''}`} onClick={toggleMic} title="Toggle Mic">
                    <i className={`bi ${micOn ? 'bi-mic-fill' : 'bi-mic-mute-fill'}`}></i>
                </button>
                
                <button className={`dock-btn ${!cameraOn ? 'danger' : ''}`} onClick={toggleCamera} title="Toggle Camera">
                    <i className={`bi ${cameraOn ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`}></i>
                </button>
                
                <button className={`dock-btn ${isScreenSharing ? 'success' : ''}`} onClick={handleShareClick} title="Share Screen">
                    <i className={`bi ${isScreenSharing ? 'bi-stop-circle-fill' : 'bi-display'}`}></i>
                </button>
                
                <div className="divider"></div>
                
                <button className="dock-btn danger-fill" onClick={()=>handleLeave(false)} title="Leave Meeting">
                    <i className="bi bi-telephone-x-fill"></i>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
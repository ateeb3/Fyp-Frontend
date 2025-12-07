import * as signalR from "@microsoft/signalr";

export default function createRTCClient({ url, roomId, userId, userName }) {
    let localStream = null;
    let hubConnection = null;
    const peers = {}; 
    
    const events = {
        onRemoteStream: (peerId, stream) => {},
        onPeerLeave: (peerId) => {},
        onMeetingEnded: () => {},
        onPeerNameUpdate: (peerId, name) => {},
        onScreenShareRequest: (requesterId, requesterName) => {}, 
        onScreenShareResult: (isGranted) => {},
        onScreenShareAccessUpdate: (isAllowed) => {} // NEW EVENT
    };

    const rtcConfig = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" }
        ]
    };

    async function startSignalR() {
        hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(url)
            .withAutomaticReconnect()
            .build();

        hubConnection.on("MeetingEnded", () => events.onMeetingEnded && events.onMeetingEnded());
        
        hubConnection.on("UserLeft", (connectionId) => {
            if (peers[connectionId]) { peers[connectionId].close(); delete peers[connectionId]; }
            if (events.onPeerLeave) events.onPeerLeave(connectionId);
        });

        hubConnection.on("UserJoined", async (targetConnectionId, targetUserId) => {
            console.log("User Joined:", targetUserId);
            createPeerConnection(targetConnectionId, true);
        });

        hubConnection.on("ReceiveSignal", async (senderConnectionId, signalData) => {
            const signal = JSON.parse(signalData);
            
            // Check for name and fire event immediately
            if (signal.senderName && events.onPeerNameUpdate) {
                events.onPeerNameUpdate(senderConnectionId, signal.senderName);
            }

            const peer = peers[senderConnectionId] || createPeerConnection(senderConnectionId, false);

            if (signal.type === "offer") {
                await peer.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                sendSignal(senderConnectionId, { type: "answer", sdp: peer.localDescription.sdp });
            } else if (signal.type === "answer") {
                await peer.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                try { await peer.addIceCandidate(new RTCIceCandidate(signal.candidate)); } catch (e) { console.error(e); }
            }
        });

        // --- Permission Handlers ---
        
        // 1. Host receives request
        hubConnection.on("ScreenShareRequested", (requesterId, requesterName) => {
            if (events.onScreenShareRequest) events.onScreenShareRequest(requesterId, requesterName);
        });

        // 2. Student receives result (Specific)
        hubConnection.on("ScreenSharePermissionResult", (isGranted) => {
            if (events.onScreenShareResult) events.onScreenShareResult(isGranted);
        });

        // 3. Student receives result (Global)
        hubConnection.on("ScreenShareAccessUpdated", (isAllowed) => {
            console.log("Global Screen Share Update:", isAllowed);
            if (events.onScreenShareAccessUpdate) events.onScreenShareAccessUpdate(isAllowed);
        });

        await hubConnection.start();
        console.log("SignalR Connected");
    }

    function createPeerConnection(targetConnectionId, isInitiator) {
        const pc = new RTCPeerConnection(rtcConfig);
        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }
        pc.onicecandidate = (event) => {
            if (event.candidate) sendSignal(targetConnectionId, { candidate: event.candidate });
        };
        pc.ontrack = (event) => {
            if (events.onRemoteStream) events.onRemoteStream(targetConnectionId, event.streams[0]);
        };
        peers[targetConnectionId] = pc;

        if (isInitiator) {
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                sendSignal(targetConnectionId, { type: "offer", sdp: offer.sdp });
            });
        }
        return pc;
    }

    function sendSignal(targetId, data) {
        if (hubConnection) {
            // Ensure userName has a fallback string so JSON.stringify doesn't drop it
            const safeName = userName || "Unknown User"; 
            const payload = JSON.stringify({ ...data, senderName: safeName });
            hubConnection.invoke("SendSignal", targetId, payload);
        }
    }

    return {
        events,
        setLocalStream: (stream) => { localStream = stream; },
        joinRoom: async (room) => {
            if (!hubConnection) await startSignalR();
            await hubConnection.invoke("JoinRoom", room, userId);
        },
        endMeeting: async (room) => {
            if (hubConnection) await hubConnection.invoke("EndMeeting", room);
        },
        
        // --- Permission Methods ---
        requestScreenShare: async (room) => {
            if (hubConnection) {
                const safeName = userName || "Unknown User";
                await hubConnection.invoke("RequestScreenShare", room, safeName);
            }
        },
        allowScreenShare: async (targetId) => {
            if (hubConnection) await hubConnection.invoke("AllowScreenShare", targetId);
        },
        denyScreenShare: async (targetId) => {
            if (hubConnection) await hubConnection.invoke("DenyScreenShare", targetId);
        },
        toggleScreenShareAccess: async (room, allowAll) => {
            if (hubConnection) {
                console.log("Toggling Global Share:", allowAll);
                await hubConnection.invoke("ToggleScreenShareAccess", room, allowAll);
            }
        },
        
        replaceVideoTrack: (newTrack) => {
            Object.values(peers).forEach((pc) => {
                const sender = pc.getSenders().find((s) => s.track.kind === "video");
                if (sender) {
                    sender.replaceTrack(newTrack);
                }
            });
        },

        closeAll: () => {
            Object.values(peers).forEach(pc => pc.close());
            if (hubConnection) hubConnection.stop();
        }
    };
}
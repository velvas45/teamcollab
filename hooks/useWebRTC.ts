import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useWebRTC = (roomId: string, token: string) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io("http://localhost:3001", {
      auth: {
        token,
        transports: ["websocket"],
      },
    });
    socket.current.emit("join-room", roomId);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
      });

    socket.current.on("user-joined", (peerId: string) => {
      console.log(`[SOCKET] User joined: ${peerId}`);
      createPeerConnection(peerId);
    });

    socket.current.on("offer", async ({ senderId, offer }) => {
      console.log(`[SOCKET] Offer diterima dari ${senderId}`);
      const peerConnection = createPeerConnection(senderId);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.current!.emit("answer", { roomId, senderId, answer });
    });

    socket.current.on("answer", async ({ senderId, answer }) => {
      console.log(`[SOCKET] Answer diterima dari ${senderId}`);
      const peerConnection = peerConnections.current.get(senderId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.current.on("ice-candidate", async ({ senderId, candidate }) => {
      console.log(`[SOCKET] ICE Candidate diterima dari ${senderId}`);
      const peerConnection = peerConnections.current.get(senderId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.current?.disconnect();
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
    };
  }, [roomId]);

  const createPeerConnection = (peerId: string) => {
    console.log(`[WEBRTC] Membuat PeerConnection untuk ${peerId}`);
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current.set(peerId, peerConnection);

    stream
      ?.getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.ontrack = (event) => {
      console.log(`[WEBRTC] Menerima stream dari ${peerId}`);
      setRemoteStreams((prev) => new Map(prev).set(peerId, event.streams[0]));
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WEBRTC] Mengirim ICE Candidate ke ${peerId}`);
        socket.current!.emit("ice-candidate", {
          roomId,
          senderId: socket.current!.id,
          candidate: event.candidate,
        });
      }
    };

    return peerConnection;
  };

  const callAllPeers = async () => {
    peerConnections.current.forEach(async (peerConnection, peerId) => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log(`[SOCKET] Mengirim offer ke ${peerId}`);
      socket.current!.emit("offer", { roomId, receiverId: peerId, offer });
    });
  };

  return { stream, remoteStreams, callAllPeers };
};

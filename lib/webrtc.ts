import Peer from "simple-peer";
import { getSocket } from "./socket";

type PeerConnection = {
  peer: Peer.Instance;
  username: string;
};

const peerConfig = {
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  },
};

let localStream: MediaStream | null = null;
const peers: Map<string, PeerConnection> = new Map();

export const initializeWebRTC = async () => {
  try {
    // Get user media (camera and microphone)
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const socket = getSocket();

    // Listen for call requests
    socket?.on("call-user", ({ from, signal }) => {
      console.log(
        "Received call from:",
        from,
        "with signal:",
        signal ? "present" : "missing"
      );

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: localStream!,
        ...peerConfig,
      });

      peer.on("signal", (data) => {
        console.log("Answering peer generated signal, sending to:", from);
        socket?.emit("call-accepted", {
          to: from,
          signal: data,
        });
      });

      peer.on("stream", (stream) => {
        console.log("Received remote stream in answer handler", stream.id);
        const remoteVideo = document.getElementById(
          "remoteVideo"
        ) as HTMLVideoElement;
        if (remoteVideo) {
          console.log("Setting remote stream to video element");
          remoteVideo.srcObject = stream;
        }
      });

      peer.on("connect", () => {
        console.log("Answer peer connection established!");
      });

      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
        if (err.toString().includes("ICE")) {
          console.warn("ICE connection failed - may be behind symmetric NAT");
        }
      });

      peer.on("iceStateChange", (state) => {
        console.log("ICE state:", state);
        if (state === "disconnected") {
          console.warn("ICE connection disconnected");
        }
      });

      // Apply the signal from the caller
      console.log("Applying signal to answering peer");

      peer.signal(signal);
      peers.set(from, { peer, username: from });
      console.log(peers);
    });

    // Listen for call accepted
    socket?.on("call-accepted", ({ from, signal }) => {
      console.log(
        "Call accepted by:",
        from,
        "with signal:",
        signal ? "present" : "missing"
      );
      const peerConnection = peers.get(from);
      if (peerConnection) {
        console.log("Applying answer signal to initiator peer");
        peerConnection.peer.signal(signal);
      } else {
        console.warn("Could not find peer for", from, "or signal is missing");
      }
    });

    // Listen for user disconnected
    socket?.on("user-disconnected", (username) => {
      const peerConnection = peers.get(username);
      if (peerConnection) {
        peerConnection.peer.destroy();
        peers.delete(username);
      }
    });

    return localStream;
  } catch (error) {
    console.error("Error initializing WebRTC:", error);
    throw error;
  }
};

export const callUser = (username: string) => {
  if (!localStream) {
    throw new Error("Local stream not initialized");
  }

  const socket = getSocket();

  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream: localStream,
    ...peerConfig,
  });

  peer.on("signal", (signal) => {
    console.log("signal on peer", signal);
    socket?.emit("call-user", {
      to: username,
      from: socket?.id,
      signal,
    });
  });

  peer.on("stream", (stream) => {
    console.log("Received remote stream in callUser", stream.id);
    // Store the remote stream so it can be accessed
    const remoteVideo = document.getElementById(
      "remoteVideo"
    ) as HTMLVideoElement;
    if (remoteVideo) {
      console.log("Setting remote stream to video element");
      remoteVideo.srcObject = stream;
    }
  });

  peer.on("error", (err) => {
    console.error("Peer connection error:", err);
    if (err.toString().includes("ICE")) {
      console.warn("ICE connection failed - may be behind symmetric NAT");
    }
  });

  peer.on("iceStateChange", (state) => {
    console.log("ICE state:", state);
    if (state === "disconnected") {
      console.warn("ICE connection disconnected");
    }
  });

  peers.set(username, { peer, username });

  return peer;
};

export const endCall = (username: string) => {
  const peerConnection = peers.get(username);
  if (peerConnection) {
    peerConnection.peer.destroy();
    peers.delete(username);
  }
};

export const stopLocalStream = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
    localStream = null;
  }

  // Destroy all peer connections
  peers.forEach((peerConnection) => {
    peerConnection.peer.destroy();
  });
  peers.clear();
};

export const getLocalStream = () => localStream;

export const getPeers = () => peers;

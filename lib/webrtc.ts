import Peer from "simple-peer";
import { getSocket } from "./socket";

type PeerConnection = {
  peer: Peer.Instance;
  username: string;
};

let localStream: MediaStream | null = null;
const peers: Map<string, PeerConnection> = new Map();

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

// export const initializeWebRTC = async (userName: string) => {
//   try {
//     // Get user media (camera and microphone)
//     localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     const socket = getSocket();

//     // Listen for call requests
//     socket?.on("call-user", ({ from, signal }) => {
//       const peer = new Peer({
//         initiator: false,
//         trickle: false,
//         stream: localStream!,
//         ...peerConfig,
//       });

//       peer.on("signal", (data) => {
//         socket?.emit("call-accepted", {
//           to: from,
//           signal: data,
//         });
//       });

//       peer.signal(signal);

//       peer.on("error", (err) => {
//         console.error("Peer connection error:", err);
//         if (err.toString().includes("ICE")) {
//           console.warn("ICE connection failed - may be behind symmetric NAT");
//         }
//       });

//       peer.on("iceStateChange", (state) => {
//         console.log("ICE state:", state);
//         if (state === "disconnected") {
//           console.warn("ICE connection disconnected");
//         }
//       });

//       peers.set(from, { peer, username: from });
//     });

//     // Listen for call accepted
//     socket?.on("call-accepted", ({ from, signal }) => {
//       const peerConnection = peers.get(from);
//       if (peerConnection) {
//         peerConnection.peer.signal(signal);
//       }
//     });

//     // Listen for user disconnected
//     socket?.on("user-disconnected", (username) => {
//       const peerConnection = peers.get(username);
//       if (peerConnection) {
//         peerConnection.peer.destroy();
//         peers.delete(username);
//       }
//     });

//     return localStream;
//   } catch (error) {
//     console.error("Error initializing WebRTC:", error);
//     throw error;
//   }
// };

// export const callUser = (username: string) => {
//   if (!localStream) {
//     throw new Error("Local stream not initialized");
//   }

//   const socket = getSocket();

//   const peer = new Peer({
//     initiator: true,
//     trickle: false,
//     stream: localStream,
//     ...peerConfig,
//   });

//   peer.on("signal", (signal) => {
//     socket?.emit("call-user", {
//       to: username,
//       from: socket?.id,
//       signal,
//     });
//   });

//   peer.on("error", (err) => {
//     console.error("Peer connection error:", err);
//     if (err.toString().includes("ICE")) {
//       console.warn("ICE connection failed - may be behind symmetric NAT");
//     }
//   });

//   peer.on("iceStateChange", (state) => {
//     console.log("ICE state:", state);
//     if (state === "disconnected") {
//       console.warn("ICE connection disconnected");
//     }
//   });

//   peers.set(username, { peer, username });

//   return peer;
// };

// export const endCall = (username: string) => {
//   const peerConnection = peers.get(username);
//   if (peerConnection) {
//     peerConnection.peer.destroy();
//     peers.delete(username);
//   }
// };

// export const stopLocalStream = () => {
//   if (localStream) {
//     localStream.getTracks().forEach((track) => {
//       track.stop();
//     });
//     localStream = null;
//   }

//   // Destroy all peer connections
//   peers.forEach((peerConnection) => {
//     peerConnection.peer.destroy();
//   });
//   peers.clear();
// };

// export const getLocalStream = () => localStream;

// export const getPeers = () => peers;

export const createPeer = (
  stream: MediaStream,
  initiator: boolean
): Peer.Instance => {
  console.log(stream, initiator);
  return new Peer({
    initiator,
    stream,
    trickle: false,
    ...peerConfig,
  });
};

export const getLocalStream = async (): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (error) {
    console.error("Error accessing media devices:", error);
    throw new Error("Could not access camera/microphone");
  }
};

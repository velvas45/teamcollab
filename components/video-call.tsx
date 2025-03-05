/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSocket } from "@/lib/socket";
import {
  initializeWebRTC,
  callUser,
  endCall,
  stopLocalStream,
} from "@/lib/webrtc";
import { OnlineUsersList } from "./list-user-online";

type CallState = {
  isInCall: boolean;
  isCalling: boolean;
  callerId?: string;
  callerName?: string;
  receiverId?: string;
  receiverName?: string;
};

export default function VideoCallPage() {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isCalling: false,
  });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!user) return;
    // Initialize local stream
    const initWebRTC = async () => {
      try {
        const stream = await initializeWebRTC();
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error initializing WebRTC:", error);
        toast.error("Error", {
          description: "Could not access camera/microphone",
        });
      }
    };

    initWebRTC();

    // Set up socket event listeners
    socket?.on("incoming-call", ({ from, fromName }) => {
      setCallState({
        isInCall: false,
        isCalling: true,
        callerId: from,
        callerName: fromName,
      });
    });

    socket?.on("call-accepted", ({ from, fromName }) => {
      setCallState((prev) => ({
        ...prev,
        isInCall: true,
        isCalling: false,
      }));
    });

    socket?.on("call-rejected", ({ from }) => {
      setCallState({
        isInCall: false,
        isCalling: false,
      });

      toast.error("Call Rejected", {
        description: "The user rejected your call",
      });
    });

    socket?.on("call-ended", () => {
      setCallState({
        isInCall: false,
        isCalling: false,
      });

      toast("Call Ended", {
        description: "The call has ended",
      });
    });

    // Handle peer stream
    socket?.on("peer-stream", ({ stream }) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    // Cleanup
    return () => {
      stopLocalStream();
      socket?.off("incoming-call");
      socket?.off("call-accepted");
      socket?.off("call-rejected");
      socket?.off("call-ended");
      socket?.off("peer-stream");
    };
  }, [user, socket, callState]); // Added dependencies

  const handleStartCall = (name: string, socketId: string) => {
    if (name === user?.name) return;

    setCallState({
      isInCall: false,
      isCalling: true,
      receiverId: socketId,
      receiverName: name,
    });

    // In a real app, this would initiate the WebRTC call
    socket?.emit("start-call", {
      to: socketId,
      from: user?.name,
      fromName: user?.name,
    });

    const peer = callUser(user?.name as string);

    peer.on("stream", (stream) => {
      console.log("peer on stream start call", stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });
  };

  const handleAcceptCall = () => {
    if (!callState.callerId) return;

    setCallState((prev) => ({
      ...prev,
      isInCall: true,
      isCalling: false,
    }));

    const peer = callUser(callState.callerId);

    socket?.emit("accept-call", {
      to: callState.callerId,
      from: user?.name,
      fromName: user?.name,
    });

    peer.on("stream", (stream) => {
      console.log("peer on stream", stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });
  };

  const handleRejectCall = () => {
    if (!callState.callerId) return;

    setCallState({
      isInCall: false,
      isCalling: false,
    });

    // In a real app, this would reject the WebRTC call
    socket?.emit("reject-call", {
      to: callState.callerId,
      from: user?.name,
    });
  };

  const handleEndCall = () => {
    const peerId = callState.callerId || callState.receiverId;
    if (!peerId) return;

    setCallState({
      isInCall: false,
      isCalling: false,
    });

    // In a real app, this would end the WebRTC call
    socket?.emit("end-call", {
      to: peerId,
      from: user?.name,
    });

    endCall(peerId);
  };

  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {callState.isInCall ? (
        <div className="flex flex-col">
          <div className="relative bg-black rounded-lg h-screen">
            <video
              ref={remoteVideoRef}
              className="peer-video "
              autoPlay
              playsInline
            />
            <video
              ref={localVideoRef}
              className="self-video "
              autoPlay
              playsInline
              muted
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={toggleAudio}
              >
                {audioEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
              <Button variant="destructive" size="icon" onClick={handleEndCall}>
                <PhoneOff className="h-5 w-5" />
              </Button>
              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={toggleVideo}
              >
                {videoEnabled ? (
                  <Camera className="h-5 w-5" />
                ) : (
                  <CameraOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : callState.isCalling && callState.callerId ? (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Incoming Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${callState.callerName}`}
                  />
                  <AvatarFallback className="text-2xl">
                    {callState.callerName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-medium">
                    {callState.callerName}
                  </h3>
                  <p className="text-muted-foreground">is calling you...</p>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={handleRejectCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600"
                  onClick={handleAcceptCall}
                >
                  <Phone className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : callState.isCalling && callState.receiverId ? (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Calling...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${callState.receiverName}`}
                  />
                  <AvatarFallback className="text-2xl">
                    {callState.receiverName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-medium">
                    {callState.receiverName}
                  </h3>
                  <p className="text-muted-foreground">Ringing...</p>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex h-max">
          <div className="w-64 border-r h-full overflow-hidden flex flex-col">
            <OnlineUsersList
              onStartChat={(name, socketId) => {
                handleStartCall(name, socketId);
              }}
              isNeedVideoCall
            />
          </div>
          <div className="flex-1 relative bg-black rounded-lg overflow-hidden h-96 w-80">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={toggleAudio}
              >
                {audioEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={toggleVideo}
              >
                {videoEnabled ? (
                  <Camera className="h-5 w-5" />
                ) : (
                  <CameraOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

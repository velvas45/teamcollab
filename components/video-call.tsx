/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { createPeer, getLocalStream } from "@/lib/webrtc";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type Peer from "simple-peer";

export default function VideoCallPage() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [signalData, setSignalData] = useState("");
  const [peerSignalData, setPeerSignalData] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (!isCallStarted) return;

    // Initialize local stream
    const initStream = async () => {
      try {
        const stream = await getLocalStream();
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast.error("Error", {
          description: "Could not access camera/microphone",
        });
      }
    };

    initStream();

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [signalData]); // Added dependencies

  const startCall = () => {
    // if (!localStream) return;

    setIsInitiator(true);
    setIsCallStarted(true);

    const peer = createPeer(localStream!, true);
    peerRef.current = peer;

    console.log(peer);

    peer.on("signal", (data) => {
      console.log("signal on start call", data);
      // Convert signal data to string to share
      setSignalData(JSON.stringify(data));
    });

    peer.on("stream", (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      toast.error("Connection Error", {
        description: "Failed to establish connection",
      });
    });
  };

  const joinCall = () => {
    if (!peerSignalData) return;

    try {
      const signalObj = JSON.parse(peerSignalData);
      setIsCallStarted(true);

      const peer = createPeer(localStream!, false);
      peerRef.current = peer;

      peer.on("signal", (data) => {
        // Convert signal data to string to share
        setSignalData(JSON.stringify(data));
      });

      peer.on("stream", (stream) => {
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        toast.error("Connection Error", {
          description: "Failed to establish connection",
        });
      });

      // Connect with the other peer
      peer.signal(signalObj);
    } catch (error) {
      toast.error("Invalid Signal Data", {
        description: "Please check the signal data and try again",
      });
    }
  };

  const connectPeers = () => {
    if (!peerRef.current || !peerSignalData) return;

    try {
      const signalObj = JSON.parse(peerSignalData);
      peerRef.current.signal(signalObj);
    } catch (error) {
      toast.error("Invalid Signal Data", {
        description: "Please check the signal data and try again",
      });
    }
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setIsCallStarted(false);
    setRemoteStream(null);
    setSignalData("");
    setPeerSignalData("");
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied", {
      description: "Signal data copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {!isCallStarted ? (
        <Card>
          <CardHeader>
            <CardTitle>Start or Join a Call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={startCall} className="w-full">
                Start New Call
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Or Join with Signal Data</Label>
              <Input
                value={peerSignalData}
                onChange={(e) => setPeerSignalData(e.target.value)}
                placeholder="Paste signal data here..."
              />
              <Button
                onClick={joinCall}
                className="w-full"
                disabled={!peerSignalData}
              >
                Join Call
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Local Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Remote Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {signalData && (
            <Card>
              <CardHeader>
                <CardTitle>Your Signal Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input value={signalData} readOnly />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-1/2 -translate-y-1/2 m-0 cursor-pointer"
                    onClick={() => copyToClipboard(signalData)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {!isInitiator && (
                  <Button onClick={connectPeers} className="w-full">
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
            <Button
              variant={audioEnabled ? "outline" : "destructive"}
              size="icon"
              onClick={toggleAudio}
            >
              {audioEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-12 w-12"
              onClick={endCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              variant={videoEnabled ? "outline" : "destructive"}
              size="icon"
              onClick={toggleVideo}
            >
              {videoEnabled ? (
                <Camera className="h-4 w-4" />
              ) : (
                <CameraOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

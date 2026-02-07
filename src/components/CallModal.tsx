"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type CallType = "video" | "voice";
export type CallRole = "member" | "rcic" | "team";

interface CallModalProps {
  caseId: string;
  type: CallType;
  role: CallRole;
  /** 作为接听方时传入房间 ID；不传则作为发起方创建房间 */
  roomId?: string | null;
  onClose: () => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

function useMediaStream(type: CallType): { stream: MediaStream | null; error: string | null } {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let s: MediaStream | null = null;
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: type === "video" ? { facingMode: "user" } : false,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        s = mediaStream;
        setStream(mediaStream);
      })
      .catch((err) => {
        setError(err?.message || "无法获取摄像头/麦克风");
      });
    return () => {
      s?.getTracks().forEach((t) => t.stop());
    };
  }, [type]);

  return { stream, error };
}

export default function CallModal({ caseId, type, role, roomId: initialRoomId, onClose }: CallModalProps) {
  const [roomId, setRoomId] = useState<string | null>(initialRoomId ?? null);
  const [status, setStatus] = useState<"creating" | "ringing" | "connecting" | "connected" | "ended" | "error">(
    initialRoomId ? "connecting" : "creating"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const signalsSeenRef = useRef(0);

  const isInitiator = !initialRoomId;
  const { stream: localStream, error: streamError } = useMediaStream(type);

  useEffect(() => {
    if (streamError) {
      setErrorMsg(streamError);
      setStatus("error");
    }
  }, [streamError]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const cleanup = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 发起方：创建房间
  useEffect(() => {
    if (!isInitiator || !caseId || roomId || status !== "creating") return;

    fetch("/api/call/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, type }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.roomId) {
          setRoomId(data.roomId);
          setStatus("ringing");
        } else {
          setErrorMsg(data.message || "创建通话失败");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("网络错误");
        setStatus("error");
      });
  }, [isInitiator, caseId, roomId, status]);

  // 创建 PeerConnection 并交换信令
  useEffect(() => {
    if (!roomId || !localStream || status === "error" || status === "ended") return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (ev) => {
      if (remoteVideoRef.current && ev.streams[0]) {
        remoteVideoRef.current.srcObject = ev.streams[0];
      }
      setStatus("connected");
    };
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        fetch(`/api/call/${roomId}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "ice", data: ev.candidate.toJSON() }),
        }).catch(() => {});
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setStatus("ended");
      }
    };

    pcRef.current = pc;
    setStatus("connecting");

    const doOffer = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await fetch(`/api/call/${roomId}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "offer", data: offer }),
        });
      } catch (e) {
        setErrorMsg("创建 offer 失败");
        setStatus("error");
      }
    };

    const doAnswer = async (offer: RTCSessionDescriptionInit) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await fetch(`/api/call/${roomId}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "answer", data: answer }),
        });
      } catch (e) {
        setErrorMsg("创建 answer 失败");
        setStatus("error");
      }
    };

    const poll = async () => {
      try {
        const res = await fetch(`/api/call/${roomId}?after=${signalsSeenRef.current}`);
        const data = await res.json();
        if (!data.success || !data.signals) return;
        const signals = data.signals as { type: string; data: unknown }[];
        signalsSeenRef.current += signals.length;
        for (const sig of signals) {
          if (sig.type === "offer") {
            await doAnswer(sig.data as RTCSessionDescriptionInit);
          } else if (sig.type === "answer") {
            await pc.setRemoteDescription(new RTCSessionDescription(sig.data as RTCSessionDescriptionInit));
          } else if (sig.type === "ice") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(sig.data as RTCIceCandidateInit));
            } catch (_) {}
          }
        }
      } catch (_) {}
    };

    if (isInitiator) {
      doOffer();
    } else {
      fetch(`/api/call/${roomId}/join`, { method: "POST" }).then(() => {
        poll(); // 接听方立即拉取一次以拿到 offer
      });
    }

    pollTimerRef.current = setInterval(poll, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pc.close();
    };
  }, [roomId, localStream, isInitiator, type]);

  const handleEnd = () => {
    if (roomId) {
      fetch(`/api/call/${roomId}/end`, { method: "POST" }).catch(() => {});
    }
    setStatus("ended");
    cleanup();
    onClose();
  };

  const label = type === "video" ? "视频通话" : "语音通话";
  const isVideo = type === "video";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-white">{label}</h3>
          <button
            onClick={handleEnd}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
            title="结束通话"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {errorMsg && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}
          {status === "creating" && (
            <p className="text-slate-400">正在创建通话...</p>
          )}
          {status === "ringing" && (
            <p className="text-amber-400">等待对方接听...</p>
          )}
          {status === "connecting" && (
            <p className="text-slate-400">正在连接...</p>
          )}
          {status === "connected" && (
            <p className="text-green-400">已连接</p>
          )}
          {status === "ended" && (
            <p className="text-slate-400">通话已结束</p>
          )}

          <div className="flex gap-4 justify-center items-center flex-wrap">
            {localStream && (
              <div className="relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`rounded-xl bg-slate-900 object-cover ${isVideo ? "w-40 h-32" : "w-0 h-0"}`}
                />
                {!isVideo && (
                  <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                    🎤
                  </div>
                )}
                <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-2 py-0.5 rounded">我</span>
              </div>
            )}
            <div className="relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`rounded-xl bg-slate-900 object-cover ${isVideo ? "w-40 h-32" : "w-0 h-0"}`}
              />
              {!isVideo && (
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                  🎤
                </div>
              )}
              <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-2 py-0.5 rounded">对方</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-center">
          <button
            onClick={handleEnd}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
          >
            结束通话
          </button>
        </div>
      </div>
    </div>
  );
}

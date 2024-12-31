import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";
import type { Session } from "@/types/session";

interface SessionResponse {
  code: number;
  data?: {
    sessions: Session[];
  };
  message: string;
}

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId] = useState<string>("b6ad717dc8cd472dafe383e9c793e14c");
  const [avatarId] = useState<string>("Ann_Therapist_public");
  const [language] = useState<string>("uk");
  const [text, setText] = useState<string>("");
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [showPlayButton, setShowPlayButton] = useState(true);

  async function fetchAccessToken() {
    const response = await fetch("/api/get-access-token", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.status}`);
    }

    const token = await response.text();
    return token;
  }

  async function listSessions(): Promise<Session[]> {
    const response = await fetch("/api/list-sessions");

    if (!response.ok) {
      throw new Error(`Failed to list sessions: ${response.status}`);
    }

    const data: SessionResponse = await response.json();
    return data.data?.sessions || [];
  }

  async function startSession() {
    setIsLoadingSession(true);
    setDebug("Starting session...");

    try {
      const token = await fetchAccessToken();
      if (!token) {
        throw new Error("Failed to obtain access token");
      }

      console.log("Token obtained successfully"); // Debug log
      
      avatar.current = new StreamingAvatar({ token });

      avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });

      avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });

      avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        endSession();
      });

      avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
        setStream(event.detail);
      });

      avatar.current.on(StreamingEvents.STREAM_ERROR, (error) => {
        console.error("Stream error:", error);
        setDebug(`Stream error: ${error}`);
      });

      console.log("Attempting to create avatar with params:", { // Debug log
        quality: AvatarQuality.Medium,
        avatarName: avatarId,
        knowledgeId: knowledgeId,
        language: language
      });

      await avatar.current.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: avatarId,
        knowledgeId: knowledgeId,
        voice: {
          rate: 1,
          emotion: VoiceEmotion.SOOTHING,
        },
        language: language,
        disableIdleTimeout: false,
      });

      setChatMode("text_mode");
    } catch (error) {
      console.error("Detailed error starting avatar session:", error);
      setDebug(error instanceof Error ? error.message : "Unknown error occurred");
      // Clean up on error
      avatar.current = null;
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }

    try {
      // Use a task type that allows the avatar to process and respond to the input
      if (!text.trim()) {
        throw new Error("Please enter some text");
      }

      await avatar.current.speak({
        text: text,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });

      setDebug("Speech completed");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";
      setDebug(`Error: ${errorMessage}`);
      console.error("Speech error:", e);
    } finally {
      setIsLoadingRepeat(false);
    }
  }

  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  const previousText = usePrevious(text);

  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        setDebug("Stream ready, click to play");
      };
    }
  }, [mediaStream, stream]);

  const handlePlayVideo = () => {
    if (mediaStream.current) {
      mediaStream.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
      setHasStartedPlaying(true);
      setDebug("Playing");
    }
  };

  const handlePlayVideoClick = () => {
    if (!isLoadingSession) {
      handlePlayVideo();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Card>
        <CardBody className="h-[500px] w-[900px] flex flex-col justify-center items-center">
          {stream || isLoadingSession ? (
            <div className="h-[500px] w-[900px] justify-center items-center flex rounded-lg overflow-hidden relative">
              {stream && (
                <>
                  <video
                    ref={mediaStream}
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      opacity: hasStartedPlaying ? 1 : 0,
                    }}
                  >
                    <track kind="captions" />
                  </video>
                  {hasStartedPlaying && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        right: 54,
                        width: '900px',
                        height: '40px',
                        backgroundColor: 'rgba(24, 24, 27, 1)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        zIndex: 10
                      }}
                    />
                  )}
                </>
              )}
              {!hasStartedPlaying && (
                <div className="absolute inset-0 flex justify-center items-center">
                  <button
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity duration-300"
                    onClick={handlePlayVideoClick}
                    disabled={isLoadingSession}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handlePlayVideoClick();
                      }
                    }}
                    style={{
                      backgroundImage: "url('/instructions.png')",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      width: "800px",
                      height: "430px",
                      opacity: isLoadingSession ? 0.5 : 1,
                      cursor: isLoadingSession ? "default" : "pointer",
                      display: "block",
                    }}
                  >
                    <span className="sr-only">Play Video</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full justify-center items-center flex flex-col gap-8">
              <button
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity duration-300"
                onClick={startSession}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    startSession();
                  }
                }}
                style={{
                  backgroundImage: "url('/therapist.png')",
                  backgroundSize: "cover",
                  height: "430px",
                  width: "800px",
                }}
              >
                <span className="sr-only">Start session</span>
              </button>
            </div>
          )}
          <InteractiveAvatarTextInput
            disabled={!stream}
            input={text}
            label=""
            loading={isLoadingRepeat}
            onSubmit={handleSpeak}
            placeholder=""
            setInput={setText}
          />
        </CardBody>
      </Card>
    </div>
  );
}

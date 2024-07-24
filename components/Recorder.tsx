"use client";

import Image from "next/image"
import activeAssistantIcon from "@/img/active.gif";
import notActiveAssistantIcon from "@/img/notactive.png";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export const mimeType = "audio/webm";

function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {

  const mediaRecorder = useRef<MediaRecorder | null>(null);//responsible for capturing bunch of information
  const { pending } = useFormStatus();
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    getMicrophonePermission();
  }, [])

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported by your browser. Please use a different browser.");
    }
  };

  const startRecording = async () => {
    if (stream === null || pending) return;

    setRecordingStatus("recording");

    // Create a new MediaRecorder instance with the stream (Stream is where u get the permissions from the user)
    const media = new MediaRecorder(stream, { mimeType }); // this will allow us to capture info
    mediaRecorder.current = media; // store the media recorder in the ref
    mediaRecorder.current.start(); // start the recording

    let localAudioChunks: Blob[] = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return; //if u start and stop recording immediately, it will return undefined
      if (event.data.size === 0) return; // if the size of the data is 0, return

      localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks); // set the audio chunks to the local audio chunks
  };

  const stopRecording = async () => {
    if (mediaRecorder.current === null || pending) return; // if the media recorder is null or pending, return immediately 

    setRecordingStatus("inactive");
    mediaRecorder.current.stop(); // stop the recording
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      uploadAudio(audioBlob);
      setAudioChunks([]);
    }
  }


  return (
    <div className="flex items-center justify-center">

      {!permission && (
        <button onClick={getMicrophonePermission}>Get Microphone</button>
      )}

      {pending && (
        <Image // if the recording status is inactive, show the not active assistant icon
          src={activeAssistantIcon}
          width={350}
          height={350}
          priority
          alt="Recording"
          className="assistant grayscale" // grayscale the image when recording
        />
      )}

      {permission && recordingStatus === "inactive" && !pending && (
        <Image // if the recording status is inactive, show the not active assistant icon
          src={notActiveAssistantIcon}
          alt="Not Recording"
          width={350}
          height={350}
          onClick={startRecording}
          priority={true}
          className="assistant currsor-pointer hover:scale-110 duration-150 transition-all ease-in-out" // grayscale the image when recording
        />
      )}

      {recordingStatus === "recording" && (
        <Image // if the recording status is recording, show the active assistant icon
          src={activeAssistantIcon}
          alt="Recording"
          width={350}
          height={350}
          onClick={stopRecording}
          priority={true}
          className="assistant currsor-pointer hover:scale-110 duration-150 transition-all ease-in-out" // grayscale the image when recording
        />
      )}

    </div>
  );
}

export default Recorder;
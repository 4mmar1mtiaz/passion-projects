'use client';

import { useState, useRef, useCallback } from 'react';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      // Use AudioContext destination capture via getUserMedia as fallback
      // Primary: capture system audio output via AudioContext
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const stopRecording = useCallback((): Promise<{ blob: Blob; duration: number } | null> => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === 'inactive') {
        resolve(null);
        return;
      }

      const duration = (Date.now() - startTimeRef.current) / 1000;

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        resolve({ blob, duration });
      };

      mr.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording };
}

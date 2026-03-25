'use client';

import { useState, useRef, useCallback } from 'react';
import { getEngine } from './audioEngine';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const engine = getEngine();
      if (!engine) return false;

      const stream = engine.recordDest.stream;
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
        setIsRecording(false);
        resolve({ blob, duration });
      };

      mr.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording };
}

import { useEffect, useRef, useCallback } from 'react';
import { useCadStore } from '../store/useCadStore';

export function useVoiceRecognition() {
  const {
    voiceState,
    setVoiceListening,
    setVoiceTranscript,
    setVoiceStatus,
    sendAiMessage,
    showNotification,
  } = useCadStore();

  const recognitionRef = useRef<any>(null);

  // Spoken verbal response
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser. Fallback text input active.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceStatus('listening');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setVoiceTranscript(transcript);

      if (event.results[current].isFinal) {
        setVoiceStatus('processing');
        showNotification(`Heard: "${transcript}"`, 'info');
        sendAiMessage(transcript);
        speak(`Processing design instruction: ${transcript}`);
        setVoiceListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setVoiceStatus('error', event.error);
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceStatus('idle');
      setVoiceListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [setVoiceListening, setVoiceTranscript, setVoiceStatus, sendAiMessage, showNotification, speak]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showNotification('Web Speech API not available in this browser. Use text command box below!', 'warning');
      return;
    }

    if (voiceState.isListening) {
      recognitionRef.current.stop();
      setVoiceListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setVoiceListening(true);
        showNotification('Listening... Speak a design command (e.g. "Increase wingspan to 40 cm")', 'info');
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  return { toggleListening, isSupported: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) };
}


import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useStore } from 'react-redux';
import { ControlStatus, ApiStatus } from '../../../redux/types';

export const getSpeechRecognition = () => {
  if (!window || !(window as any).webkitSpeechRecognition) {
    throw new Error('Your browser does not support web speech recognition');
  }
  const speechRecognition = new (window as any).webkitSpeechRecognition();
  speechRecognition.continuous = true;
  speechRecognition.interimResults = true;
  // speechRecognition.lang = 'kn-IN';
  return speechRecognition as SpeechRecognition;
};

export const useRecognition = () => {
  var transcript=""
  var finalTranscript=""
  const [transcripts, setTranscripts] = React.useState<string[]>([]);
  const listen = useCallback(

    async (transcriptsFull: string, control: React.MutableRefObject<ControlStatus>,  currentAPI: React.MutableRefObject<ApiStatus>) =>
      new Promise((resolve, reject) => {
        var lastStartedAt = new Date().getTime();

        const speechRecognition = getSpeechRecognition();
        speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
          if (control.current.listening == false || currentAPI.current.currentAPI != 0) {
              speechRecognition.stop()
              resolve(transcriptsFull);   
          } else {
            console.log(event.results)
          const finalResult = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
          transcript =  finalResult;

          if (event.results[0].isFinal) {
            console.log(finalResult)

          }    
          setTranscripts([...transcripts, transcript]);
          transcriptsFull = transcript
        }
        };
  
        speechRecognition.onend = () => { 
          var timeSinceStart = new Date().getTime() - lastStartedAt;
          if (control.current.listening && currentAPI.current.currentAPI === 0) {
            if (timeSinceStart > 1000) {

            speechRecognition.start()
            }
          } else {
            resolve(transcriptsFull);   
          }
        
        }
         speechRecognition.start();
      }),
    [setTranscripts]
  );

  return useMemo(() => ({ transcripts, listen }), [transcripts]);
};
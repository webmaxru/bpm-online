import RealTimeBPMAnalyzer from './../components/realtime-bpm-analyzer/src/index.js';

let context;
let input;
let scriptProcessorNode;

const start = () => {
  return function (e) {
    /**
     * Disable buttun during the analysis
     */
    e.currentTarget.setAttribute('disabled', 'disabled');

    /**
     * Get AudioContext
     */
    context = new window.AudioContext() || window.mozAudioContext() || window.webkitAudioContext();

    const currentThresoldOutput = document.getElementById('current-thresold');
    const firstBPMOutput = document.getElementById('first-bpm');
    const secondBPMOutput = document.getElementById('second-bpm');

    const onStream = (stream) => {
      /**
       * Set the source with the HTML Audio Node
       */
      input = context.createMediaStreamSource(stream);

      /**
       * Set the scriptProcessorNode to get PCM data in real time
       */
      scriptProcessorNode = context.createScriptProcessor(4096, 1, 1);

      /**
       * Connect everythings together (do not connect input to this.context.destination to avoid sound looping)
       */
      input.connect(scriptProcessorNode);
      scriptProcessorNode.connect(context.destination);

      const onAudioProcess = new RealTimeBPMAnalyzer({
        debug: true,
        scriptNode: {
          bufferSize: 4096,
          numberOfInputChannels: 1,
          numberOfOutputChannels: 1
        },
        computeBPMDelay: 5000,
        stabilizationTime: 10000,
        continuousAnalysis: true,
        pushTime: 1000,
        pushCallback: function(err, bpm, thresold) {
          if (err) throw err;

          if(bpm && bpm.length) {
            currentThresoldOutput.innerHTML = `Thresold: ${thresold}`;
            firstBPMOutput.innerHTML = `BPM: ${bpm[0].tempo} (${bpm[0].count})`;
            secondBPMOutput.innerHTML = `BPM: ${bpm[1].tempo} (${bpm[1].count})`;
          }
        },
        onBpmStabilized: (thresold) => {
          onAudioProcess.clearValidPeaks(thresold);
        }
      });

      /**
       * Attach realTime function to audioprocess event.inputBuffer (AudioBuffer)
       */
      scriptProcessorNode.onaudioprocess = function (e) {
        onAudioProcess.analyze(e);
      };
    };

    /**
     * Get user media and enable microphone
     */
    navigator.getUserMedia = ( navigator.getUserMedia ||
                               navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia ||
                               navigator.msGetUserMedia);
    navigator.getUserMedia({audio: true}, onStream.bind(this), function() {});
  }
};

/**
 * Resume audioContext
 */
const stop = () => {
  return () => {
    input.disconnect(scriptProcessorNode);
    scriptProcessorNode.disconnect(context.destination);
    context.resume().then(() => {
      /**
       * Re-enable button
       */
      document.getElementById('start').removeAttribute('disabled');
    });
  };
};

export default () => {
  document.getElementById('start').addEventListener('click', start());
  document.getElementById('stop').addEventListener('click', stop());
};

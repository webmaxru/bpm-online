import RealTimeBPMAnalyzer from './../components/realtime-bpm-analyzer/src/index.js';

let context;

const start = () => {
  /**
   * Initialize BPM status
   */
  const output = document.getElementById('current-bpm');
  output.innerHTML = `BPM: - (0)`;

  return (e) => {
    /**
     * Disable buttun during the analysis
     */
    e.currentTarget.setAttribute('disabled', 'disabled');

    /**
     * Get AudioContext
     */
    context = new window.AudioContext() || window.mozAudioContext() || window.webkitAudioContext();

    /**
     * Play music to get BPM
     */
    document.getElementById('track').play();

    /**
     * Set the source with the HTML Audio Node
     */
    const source = context.createMediaElementSource(document.getElementById('track'));

    /**
     * Set the scriptProcessorNode to get PCM data in real time
     */
    const scriptProcessorNode = context.createScriptProcessor(4096, 1, 1);

    /**
     * Connect everythings together
     */
    scriptProcessorNode.connect(context.destination);
    source.connect(scriptProcessorNode);
    source.connect(context.destination);

    /**
     * Insternciate RealTimeBPMAnalyzer
     */
    const onAudioProcess = new RealTimeBPMAnalyzer({
      debug: true,
      scriptNode: {
        bufferSize: 4096,
        numberOfInputChannels: 1,
        numberOfOutputChannels: 1
      },
      pushTime: 1000,
      pushCallback: function (err, bpm) {
        if (err) throw err;

        if (typeof bpm[0] != 'undefined') {
          output.innerHTML = `BPM: ${bpm[0].tempo} (${bpm[0].count})`;
        }
      }
    });

    /**
     * Attach realTime function to audioprocess event
     */
    scriptProcessorNode.onaudioprocess = function (e) {
        onAudioProcess.analyze(e);
    };
  };
};

/**
 * Resume audioContext
 */
const stop = () => {
  return () => {
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
  document.getElementById('track').addEventListener('ended', stop());
};

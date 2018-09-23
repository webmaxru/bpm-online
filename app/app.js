'use strict';

const RealTimeBPMAnalyzer = require('./components/realtime-bpm-analyzer/src/index.js');
const utils = require('./components/realtime-bpm-analyzer/src/utils.js');

const App = {
  context: null,

  initAudioNode(context) {


    // Set the source with the HTML Audio Node
    var source = this.context.createMediaElementSource(document.getElementById('track'));
    // Set the scriptProcessorNode to get PCM data in real time
    var scriptProcessorNode = this.context.createScriptProcessor(4096, 1, 1);
    // Connect everythings together
    scriptProcessorNode.connect(this.context.destination);
    source.connect(scriptProcessorNode);
    source.connect(this.context.destination);


    // Insternciate RealTimeBPMAnalyzer
    var onAudioProcess = new RealTimeBPMAnalyzer({
        scriptNode: {
            bufferSize: 4096,
            numberOfInputChannels: 1,
            numberOfOutputChannels: 1
        },
        pushTime: 1000,
        pushCallback: function (err, bpm) {
            if (! err) {
                document.getElementById('current-bpm').innerHTML = 'BPM : ' + bpm[0].tempo + ' (' + bpm[0].count + ')';
            }
        }
    });


    // Attach realTime function to audioprocess event
    scriptProcessorNode.onaudioprocess = function (e) {
        onAudioProcess.analyze(e);
    };
  },

  initUserMedia(context) {

    document.getElementById('start').addEventListener('click', () => {

      console.log('[initUserMedia] function: started !');

      // Get user media and enable microphone
      navigator.getUserMedia = ( navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia ||
                                 navigator.msGetUserMedia);
      navigator.getUserMedia({audio: true}, onStream.bind(this), function() {});

      let cacheBPM = null;

      function onStream(stream) {
        // Set the source with the HTML Audio Node
        var input = this.context.createMediaStreamSource(stream);
        // Set the scriptProcessorNode to get PCM data in real time
        var scriptProcessorNode = this.context.createScriptProcessor(4096, 1, 1);

        // Connect everythings together (do not connect input to this.context.destination to avoid sound looping)
        scriptProcessorNode.connect(this.context.destination);
        input.connect(scriptProcessorNode);

        var onAudioProcess = new RealTimeBPMAnalyzer({
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
            if(bpm && bpm.length) {
              cacheBPM = bpm;
              console.log('%c[pushCallback]' + JSON.stringify(cacheBPM[0]) + ' ' + JSON.stringify(cacheBPM[1]) + ' thresold ' + thresold, 'background: #eee')

            }
          },
          onBpmStabilized: (thresold) => {
            onAudioProcess.clearValidPeaks(thresold);
          }
        });

        // Attach realTime function to audioprocess event.inputBuffer (AudioBuffer)
        scriptProcessorNode.onaudioprocess = function (e) {
          onAudioProcess.analyze(e);
        };
      }
    });

    document.getElementById('stop').addEventListener('click', () => {
      this.stop();
    });
  },

  init (choice) {
    // Create new instance of AudioContext
    this.context = new window.AudioContext() || window.webkitAudioContext();

    // Create and update timer
    const timer = document.getElementById('timer');
    let date = Date.now();

    if (timer) {
      setInterval(() => {
        let now = Date.now();
        timer.innerHTML = ((now - date) / 1000).toFixed(1) + 's';
      }, 1000);
    }

    if (choice == 'userMedia') {
      return this.initUserMedia(this.context);
    } else if (choice == 'audioNode') {
      return this.initAudioNode(this.context);
    }
  },

  stop () {
    this.context.resume().then(() => {
      console.log('Playback resumed successfully');
    });
  }
}

module.exports = App;
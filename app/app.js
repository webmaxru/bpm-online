'use strict';

const RealTimeBPMAnalyzer = require('realtime-bpm-analyzer');

const App = {
  init() {

    // Create new instance of AudioContext
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    // Set the source with the HTML Audio Node
    var source = audioContext.createMediaElementSource(document.getElementById('track'));
    // Set the scriptProcessorNode to get PCM data in real time
    var scriptProcessorNode = audioContext.createScriptProcessor(4096, 1, 1);
    // Connect everythings together
    scriptProcessorNode.connect(audioContext.destination);
    source.connect(scriptProcessorNode);
    source.connect(audioContext.destination);


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
  }
}

module.exports = App;
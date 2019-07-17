'use strict';

const RealTimeBPMAnalyzer = require('./components/realtime-bpm-analyzer/src/index.js');
const utils = require('./components/realtime-bpm-analyzer/src/utils.js');
const $ = require('jquery');
const requestAnimationFrame = require('raf');




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


  initGraphic (audioContext) {
    // Constants
    const sampleSize   = 1024;  // number of samples to collect before analyzing data
    const canvasWidth  = 512;
    const canvasHeight = 256;

    // Create canvasNodes
    const canvas1 = $('<canvas/>');
    canvas1.attr('id', 'canvas1');
    canvas1.attr('width', '512px');
    canvas1.attr('height', '256px');

    const canvas2 = $('<canvas/>');
    canvas2.attr('id', 'canvas2');
    canvas2.attr('width', '512px');
    canvas2.attr('height', '256px');

    // Apend it to #root
    $('#root').append(canvas1);
    $('#root').append(canvas2);

    var testNode = function (elementId, audioUrl) {
      var sourceNode;
      var analyserNode;
      var javascriptNode;
      var audioData = null;
      var audioPlaying = false;
      var dataArray; // array to hold time domain data
      // Global Variables for the Graphics
      var ctx = $("#" + elementId).get()[0].getContext("2d");

      // Play the audio and loop until stopped
      function playSound(buffer) {
        sourceNode.buffer = buffer;
        sourceNode.start(0); // Play the sound now
        sourceNode.loop = true;
        audioPlaying = true;
      }

      // Load the audio from the URL via Ajax and store it in global variable audioData
      // Note that the audio load is asynchronous
      function loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        // When loaded, decode the data and play the sound
        request.onload = function () {
          audioContext.decodeAudioData(request.response, function (buffer) {
            audioData = buffer;
            playSound(audioData);
          }, function (e) {
            console.log(e);
          });
        }
        request.send();
      }

      function drawTimeDomain() {
        function clearCanvas() {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        }
        clearCanvas();

        ctx.font = "16px Courier New";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText("Hello World", canvasWidth/2, canvasHeight/2);

        for (var i = 0; i < dataArray.length; i++) {
          var value = dataArray[i] / 256;
          var y = canvasHeight - (canvasHeight * value) - 1;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i, y, 1, 1);
        }
      }

      // Set up the audio Analyser, the Source Buffer and javascriptNode
      sourceNode     = audioContext.createBufferSource();
      analyserNode   = audioContext.createAnalyser();
      javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);
      // Create the array for the data values
      dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      // Now connect the nodes together

      // add lowerPassFilter on the canvas2
      if (elementId == 'canvas2') {
        var filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        sourceNode.connect(audioContext.destination);
        sourceNode.connect(filter);
        filter.connect(analyserNode);
        analyserNode.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
      } else {
        sourceNode.connect(audioContext.destination);
        sourceNode.connect(analyserNode);
        analyserNode.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
      }

      // setup the event handler that is triggered every time enough samples have been collected
      // trigger the audio analysis and draw the results
      javascriptNode.onaudioprocess = function () {
        // get the Time Domain data for this sample
        analyserNode.getByteTimeDomainData(dataArray);
        //analyserNode.getByteFrequencyData(dataArray);
        // draw the display if the audio is playing
        if (audioPlaying == true) {
          requestAnimationFrame(drawTimeDomain);
        }
      }

      // Load the Audio the first time through, otherwise play it from the buffer
      if(audioData == null) {
        loadSound(audioUrl);
      } else {
        playSound(audioData);
      }

      // Stop the audio playing
      $('body').one('click', '#stop_button', function(e) {
        e.preventDefault();
        sourceNode.stop(0);
        audioPlaying = false;
      });
    }

    // the AudioContext is the primary 'container' for all your audio node objects
    // gather samples for the analysis, update the canvas
    $('body').one('click', '#start_button', function(e) {
      e.preventDefault();
      testNode('canvas1', "/media/new_order-blue_monday1.wav");
      testNode('canvas2', "/media/new_order-blue_monday1.wav");
    });
  },

  initTest () {

    // Hacks to deal with different function names in different browsers
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function(callback, element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();


    const WIDTH = "400px";
    const HEIGHT = "60px";
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const test = (elementId) => {
      var analyser = audioCtx.createAnalyser();
      var source = audioCtx.createMediaElementSource(document.getElementById(elementId));
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 256;
      var bufferLength = analyser.frequencyBinCount;
      console.log('bufferLength', bufferLength);
      var dataArray = new Uint8Array(bufferLength);
      var canevas = document.getElementById(elementId); // dans votre HTML, cet élément apparaît comme <canvas id="monCanevas"></canvas>
      var canvasCtx = canevas.getContext('2d');
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      function draw() {
        var drawVisual = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i]/2;

          canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
          canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);

          x += barWidth + 1;
        }
      };
      draw();
    }

    test('canvas1');
    test('canvas2');
  },

  init (choice) {
    // Create new instance of AudioContext
    this.context = new window.AudioContext() || window.mozAudioContext() || window.webkitAudioContext();

    // Create and update timer
    const timer = document.getElementById('timer');
    let date = Date.now();

    if (timer) {
      setInterval(() => {
        let now = Date.now();
        timer.innerHTML = ((now - date) / 1000).toFixed(1) + 's';
      }, 100);
    }

    if (choice == 'userMedia') {
      return this.initUserMedia(this.context);
    } else if (choice == 'audioNode') {
      return this.initAudioNode(this.context);
    } else if (choice == 'graphic') {
      $(document).ready(() => {
        return this.initGraphic(this.context);
      });
    } else if (choice == 'test') {
      return this.initTest(this.context);
    }
  },

  stop () {
    this.context.resume().then(() => {
      console.log('Playback resumed successfully');
    });
  }
}

module.exports = App;

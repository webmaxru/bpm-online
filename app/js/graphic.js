import $ from 'jquery';
import requestAnimationFrame from 'raf';

let context;
const sampleSize = 2048;  // number of samples to collect before analyzing data
let canvasWidth;
const canvasHeight = 256;

const start = () => {
  canvasWidth = document.getElementById('root').offsetWidth;

  const canvas1 = document.getElementById('canvas1');
  canvas1.style.width = `${canvasWidth}px`;
  canvas1.style.height = `${canvasHeight}px`;

  const canvas2 = document.getElementById('canvas2');
  canvas2.style.width = `${canvasWidth}px`;
  canvas2.style.height = `${canvasHeight}px`;

  return (e) => {
    /**
     * Get AudioContext
     */
    context = new window.AudioContext() || window.mozAudioContext() || window.webkitAudioContext();

    var testNode = function (elementId, audioUrl) {
      var filter;
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
          context.decodeAudioData(request.response, function (buffer) {
            audioData = buffer;
            playSound(audioData);
          }, function (e) {
            console.log(e);
          });
        }
        request.send();
      }

      function drawTimeDomain() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
      sourceNode     = context.createBufferSource();
      analyserNode   = context.createAnalyser();
      javascriptNode = context.createScriptProcessor(sampleSize, 1, 1);
      // Create the array for the data values
      dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      // Now connect the nodes together

      // add lowerPassFilter on the canvas2
      if (elementId == 'canvas2') {
        filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        sourceNode.connect(context.destination);
        sourceNode.connect(filter);
        filter.connect(analyserNode);
        analyserNode.connect(javascriptNode);
        javascriptNode.connect(context.destination);
      } else {
        sourceNode.connect(context.destination);
        sourceNode.connect(analyserNode);
        analyserNode.connect(javascriptNode);
        javascriptNode.connect(context.destination);
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

      /**
       * Load the Audio the first time through, otherwise play it from the buffer
       */
      if(audioData == null) {
        loadSound(audioUrl);
      } else {
        playSound(audioData);
      }

      /**
       * Stop the audio playing
       */
      $('body').one('click', '#stop', function(e) {
        if (elementId == 'canvas2') {
          sourceNode.disconnect(context.destination);
          sourceNode.disconnect(filter);
          filter.disconnect(analyserNode);
          analyserNode.disconnect(javascriptNode);
          javascriptNode.disconnect(context.destination);
        } else {
          sourceNode.disconnect(context.destination);
          sourceNode.disconnect(analyserNode);
          analyserNode.disconnect(javascriptNode);
          javascriptNode.disconnect(context.destination);
        }

        context.resume().then(() => {
          /**
           * Re-enable button
           */
          document.getElementById('start').removeAttribute('disabled');
        });
      });
    };

    testNode('canvas1', "/media/new_order-blue_monday1.wav");
    testNode('canvas2', "/media/new_order-blue_monday1.wav");
  };
};

export default () => {
  document.getElementById('start').addEventListener('click', start());
};

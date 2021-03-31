import RealTimeBPMAnalyzer from './../components/realtime-bpm-analyzer/src/index.js';
window.Buffer = window.Buffer || require('buffer').Buffer;

const Writer = require('web-audio-stream/write');

let audioContext;
let input;
let scriptProcessorNode;
let isStopped = 0;

// window.requestAnimFrame = (function(){
//     return  window.requestAnimationFrame ||
//     window.webkitRequestAnimationFrame ||
//     window.mozRequestAnimationFrame ||
//     window.oRequestAnimationFrame ||
//     window.msRequestAnimationFrame ||
//     function( callback ){
//         window.setTimeout(callback, 1000 / 60);
//     };
// })();

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
    audioContext = new window.AudioContext() || window.mozAudioContext() || window.webkitAudioContext();
    const assetURL = 'https://zaycevfm.cdnvideo.ru/ZaycevFM_zaychata_256.mp3';

    // function sourceOpen (_) {
    //   console.log('sourceOpen');
    //   //console.log(this.readyState); // open
    //   const mediaSource = this;
    //   console.log('mediaSource', mediaSource);
    //   const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
    //   console.log('sourceBuffer', sourceBuffer);
    //   fetchAB(assetURL, function (buffer) {
    //     sourceBuffer.addEventListener('updateend', function (_) {
    //       mediaSource.endOfStream();
    //       video.play();
    //       //console.log(mediaSource.readyState); // ended
    //     });
    //     sourceBuffer.appendBuffer(buffer);
    //   });
    // };

    // function fetchAB (url, cb) {
    //   console.log(url);
    //   var xhr = new XMLHttpRequest;
    //   xhr.open('get', url);
    //   xhr.responseType = 'arraybuffer';
    //   xhr.onload = function () {
    //     cb(xhr.response);
    //   };
    //   xhr.send();
    // };

    /**
     * Play music to get BPM
     */
    const player = document.getElementById('stream');

    // const mediaSource = new MediaSource()
    // player.src = URL.createObjectURL(mediaSource);
    // mediaSource.addEventListener('sourceopen', sourceOpen);

    // var source = audioContext.createMediaStreamSource(mediaSource)
    // console.log('source', source);
    // source.connect(audioContext.destination);
    // source.start();

    // console.log('mediaSource', mediaSource);

    // console.log('streamNode.src', player.src);

    // player.play()

    // const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
    // let startTime = 0;
    // var delayTime = 0;
    // var init = 0;
    // var audioStack = [];
    // var nextTime = 0;

    // function scheduleBuffers() {
    //   console.log('scheduleBuffers', audioStack.length);
    //     while ( audioStack.length) {
    //         var buffer = audioStack.shift();
    //         var source    = audioContext.createBufferSource();
    //         source.buffer = buffer;
    //         source.connect(audioContext.destination);
    //         if (nextTime == 0) {
    //           nextTime = audioContext.currentTime + 0.05;  /// add 50ms latency to work well across systems - tune this if you like
    //         }
    //         source.start(nextTime);
    //         nextTime+=source.buffer.duration; // Make the next buffer wait the length of the last buffer before being played
    //     };
    // }
    //


    //options or single properties are optional
    let write = Writer(audioContext.destination, {
      samplesPerFrame: 1024
    });

    // let writable = Writable(audioContext.destination, {
    //   context: audioContext,
    //   channels: 2,
    //   sampleRate: audioContext.sampleRate,

    //   //BUFFER_MODE, SCRIPT_MODE, WORKER_MODE (pending web-audio-workers)
    //   mode: Writable.BUFFER_MODE,

    //   //disconnect node if input stream ends
    //   autoend: true
    // })

    // setTimeout(writable.end, 1000)

    fetch(assetURL)
    // Retrieve its body as ReadableStream
    .then(response => {
      console.log('response.body', response.body);
      let reader = response.body.getReader()
      let pump = () => {
        reader.read().then(({value, done}) => {
          if (done) {
            isStopped = 1;
          }

          // writable.write(value.buffer);
          console.log('value', value);
          console.log('value.buffer', value.buffer);
          write(value.buffer);
          // audioContext.decodeAudioData(value.buffer, function(buffer) {
          //   // console.log('buffer', buffer.duration, buffer);
          //   writable.write(buffer);
          // }, function (error) {
          //   console.log('error', error);
          // });


          // Reader Read
          // console.log('value', value.buffer);

          // audioContext.decodeAudioData(value.buffer, function(buffer) {
          //   // console.log('buffer', buffer.duration, buffer);
          //   // const source = audioContext.createBufferSource();
          //   // source.buffer = buffer;
          //   // source.connect(audioContext.destination);

          //   audioStack.push(buffer);
          //   if (init !== 0 || audioStack.length > 10) { // make sure we put at least 10 chunks in the buffer before starting
          //       init++;
          //       scheduleBuffers();
          //   }
          // }, function (error) {
          //   console.log("err(decodeAudioData): "+error);
          // });
          //
          // This is working !
          // audioContext.decodeAudioData(value.buffer, function(buffer) {
          //   // console.log('buffer', buffer.duration, buffer);
          //   const source = audioContext.createBufferSource();
          //   source.buffer = buffer;
          //   source.connect(audioContext.destination);

          //   // if (startTime === 0) {
          //     source.start(startTime);
          //   // }

          //   startTime += buffer.duration;
          // }, function (error) {

          // });

          // chunk of data (push chunk to audio context)
          // onDecoded(value.buffer);
          // sourceBuffer.appendBuffer(value.buffer) // Repeat this for each chunk as ArrayBuffer

          if (!done) {
            pump()
          }
        })
      };

      pump()
    });


    // const source = audioContext.createMediaStreamSource(streamNode);
    // console.log('source', source);
    // const gainNode = audioContext.createGain();
    // // source.connect(gainNode);
    // source.connect(audioContext.destination);
    // // streamNode.play();

    // console.log('streamNode', streamNode);
    // console.log('streamNode.src', streamNode.src);

    // function onDecoded(buffer){
    //   const bufferSource = context.createBufferSource();
    //   bufferSource.buffer = buffer;
    //   bufferSource.connect(context.destination);
    //   bufferSource.start();
    // }






    //   // const source = context.createMediaStreamSource(response.body);

    //   // /**
    //   //  * Set the scriptProcessorNode to get PCM data in real time
    //   //  */
    //   // const scriptProcessorNode = context.createScriptProcessor(4096, 1, 1);

    //   // // Connect everythings together
    //   // source.connect(scriptProcessorNode);
    //   // scriptProcessorNode.connect(context.destination);
    //   // // source.connect(context.destination);

    //   // scriptProcessorNode.onaudioprocess = function (e) {
    //   //   console.log('onaudioprocess');
    //   // };
    // });

    /**
     * Set the source with the HTML Audio Node
     */
    // const source = context.createMediaElementSource(streamNode);
    // console.log('source', source);



    // // /**
    // //  * Insternciate RealTimeBPMAnalyzer
    // //  */
    // // const onAudioProcess = new RealTimeBPMAnalyzer({
    // //   debug: true,
    // //   scriptNode: {
    // //     bufferSize: 4096,
    // //     numberOfInputChannels: 1,
    // //     numberOfOutputChannels: 1
    // //   },
    // //   pushTime: 1000,
    // //   pushCallback: function (err, bpm) {
    // //     if (err) throw err;

    // //     if (typeof bpm[0] != 'undefined') {
    // //       output.innerHTML = `BPM: ${bpm[0].tempo} (${bpm[0].count})`;
    // //     }
    // //   }
    // // });

    // /**
    //  * Attach realTime function to audioprocess event
    //  */
    // scriptProcessorNode.onaudioprocess = function (e) {
    //   console.log('onaudioprocess');
    // };
  };
  // return function (e) {
  //   /**
  //    * Disable buttun during the analysis
  //    */
  //   e.currentTarget.setAttribute('disabled', 'disabled');

  //   /**
  //    * Get AudioContext
  //    */
  //   context = new window.AudioContext() || window.mozAudioContext() || window.webkitAudioContext();

  //   const currentThresoldOutput = document.getElementById('current-thresold');
  //   const firstBPMOutput = document.getElementById('first-bpm');
  //   const secondBPMOutput = document.getElementById('second-bpm');

  //   const onStream = (stream) => {
  //     /**
  //      * Set the source with the HTML Audio Node
  //      */
  //     input = context.createMediaStreamSource(stream);
  //     // input = stream;

  //     /**
  //      * Set the scriptProcessorNode to get PCM data in real time
  //      */
  //     scriptProcessorNode = context.createScriptProcessor(4096, 1, 1);

  //     /**
  //      * Connect everythings together (do not connect input to this.context.destination to avoid sound looping)
  //      */
  //     input.connect(scriptProcessorNode);
  //     scriptProcessorNode.connect(context.destination);

  //     const onAudioProcess = new RealTimeBPMAnalyzer({
  //       debug: true,
  //       scriptNode: {
  //         bufferSize: 4096,
  //         numberOfInputChannels: 1,
  //         numberOfOutputChannels: 1
  //       },
  //       computeBPMDelay: 5000,
  //       stabilizationTime: 10000,
  //       continuousAnalysis: true,
  //       pushTime: 1000,
  //       pushCallback: function(err, bpm, thresold) {
  //         if (err) throw err;

  //         if(bpm && bpm.length) {
  //           currentThresoldOutput.innerHTML = `Thresold: ${thresold}`;
  //           firstBPMOutput.innerHTML = `BPM: ${bpm[0].tempo} (${bpm[0].count})`;
  //           secondBPMOutput.innerHTML = `BPM: ${bpm[1].tempo} (${bpm[1].count})`;
  //         }
  //       },
  //       onBpmStabilized: (thresold) => {
  //         onAudioProcess.clearValidPeaks(thresold);
  //       }
  //     });

  //     /**
  //      * Attach realTime function to audioprocess event.inputBuffer (AudioBuffer)
  //      */
  //     scriptProcessorNode.onaudioprocess = function (e) {
  //       onAudioProcess.analyze(e);
  //     };
  //   };

  //   /**
  //    * Get user media and enable microphone
  //    */
  //   const url = "https://zaycevfm.cdnvideo.ru/ZaycevFM_zaychata_256.mp3";
  //   const audioFile = new Audio();
  //   audioFile.crossOrigin = 'anonymous';
  //   audioFile.src = url;

  //   console.log('audioFile', audioFile);
  //   const source = context.createMediaElementSource(audioFile);
  //   const stream = audioFile.captureStream();
  //   console.log('stream', stream);
  //   onStream(stream);
  //   // MediaStreamAudioSourceNode
  //   // MediaElementSourceNode
  // }
};

/**
 * Resume audioContext
 */
const stop = () => {
  return () => {
    // input.disconnect(scriptProcessorNode);
    // scriptProcessorNode.disconnect(context.destination);
    // context.resume().then(() => {
    //   /**
    //    * Re-enable button
    //    */
    //   document.getElementById('start').removeAttribute('disabled');
    // });
  };
};

export default () => {
  document.getElementById('start').addEventListener('click', start());
  document.getElementById('stop').addEventListener('click', stop());
};

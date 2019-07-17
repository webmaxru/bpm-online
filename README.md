# [Realtime BPM Analyzer](https://github.com/dlepaux/realtime-bpm-analyzer) Exemple

[![Greenkeeper badge](https://badges.greenkeeper.io/dlepaux/realtime-bpm-analyzer-exemple.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/dlepaux/realtime-bpm-analyzer-exemple.svg?branch=master)](https://travis-ci.org/dlepaux/realtime-bpm-analyzer-exemple)


## Installation

- This project contains `node-sass` be sure to have the `node-gyp` [requirments (windows)](https://github.com/nodejs/node-gyp#on-windows)

- Run `npm install` or `yarn` to install dependencies

- Run `npm run start` and rendez-vous to your [localhost:3000](http://localhost:3000)

### Chrome http/https redirect
https://www.anhsblog.com/make-chrome-stop-redirect-from-http-to-https/#.XS85pZMzZTY

## Develompment workflow

You have in app/component the original project repository. You can edit it and commit to it properly without conflict in the exemple repository.

Run `npm run start` or `npm run server` to launch a server in **HTTPS** because of Chrome 70 new policies with WebAudioAPI.


## Yarn Offline

To setup offline package just do `yarn config set yarn-offline-mirror ./npm-packages-offline-cache`

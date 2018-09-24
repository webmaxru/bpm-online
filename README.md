# [Realtime BPM Analyzer](https://github.com/dlepaux/realtime-bpm-analyzer) Exemple

[![Greenkeeper badge](https://badges.greenkeeper.io/dlepaux/realtime-bpm-analyzer-exemple.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/dlepaux/realtime-bpm-analyzer-exemple.svg?branch=master)](https://travis-ci.org/dlepaux/realtime-bpm-analyzer-exemple)

## Installation

- This project contains `node-sass` be sure to have the `node-gyp` [requirments](https://github.com/nodejs/node-gyp#on-windows)

- Run `npm install` or `yarn` to install dependencies

- Execute `bash install.sh` in the root folder of this project to clone git dependencies

- Run `node server.js` and rendez-vous to your [localhost:3000](https://localhost:3000)



## Develompment workflow

Execute `bash install.sh` in the root folder of this project (if you have not do it in the installation process). It will append the `realtime-bpm-analyzer project` in the `app/components` folder to edit it easily.

Run `node server.js` or `npm run server` to launch a server in **HTTPS** because of Chrome 70 new policies with WebAudioAPI.



## Yarn Offline

To setup offline package just do `yarn config set yarn-offline-mirror ./npm-packages-offline-cache`

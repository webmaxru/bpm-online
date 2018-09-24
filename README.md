# [Realtime BPM Analyzer](https://github.com/dlepaux/realtime-bpm-analyzer) Example

[![Greenkeeper badge](https://badges.greenkeeper.io/dlepaux/realtime-bpm-analyzer-example.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/dlepaux/realtime-bpm-analyzer-example.svg?branch=master)](https://travis-ci.org/dlepaux/realtime-bpm-analyzer-example)

## Installation

- This project contain `node-sass` be sur to have the `node-gyp` [requirments](https://github.com/nodejs/node-gyp#on-windows)

- Run `npm install` or `yarn` to install dependencies

- Execute `bash install.sh` in the root folder of this project

Rendez-vous to your [localhost:3000](https://localhost:3000)

## Develompment workflow

Execute `bash install.sh` in the root folder of this project

It will append the realtime-bpm-analyzer project in the app/components folder to edit it easily.

Run `node server.js` or `npm run server` to launch a server in HTTPS because of Chrome 70 new policies.


## Yarn Offline

To setup offline package just do `yarn config set yarn-offline-mirror ./npm-packages-offline-cache`
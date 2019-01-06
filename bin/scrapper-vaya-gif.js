#!/usr/bin/env node

const osmosis = require('osmosis')
const {log, superLog, create, done} = require('../utils')

const entries = []

osmosis
  .get('https://www.vayagif.com/')
  .follow('.storyTitle a')
  .set({
    title: '#main > div.box.story > h2 > a',
    link: '#main > div.box.story > h2 > a@href',
    video: {
      webm: '.story video source[type="video/webm"]@src',
      mp4: '.story video source[type="video/mp4"]@src',
      poster: '#main > div.box.story > p > span > video@poster'
    }
  })
  .data(entry => entries.push(entry))
  .done(done.bind(null, 'vayagif', entries))
  .log(superLog)
  .error(superLog)
  .debug(superLog)

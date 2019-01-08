#!/usr/bin/env node

const osmosis = require('osmosis')
const {log, superLog, create, done} = require('../utils')

const entries = []

osmosis
  .get('http://explosm.net/comics/archive')
  .follow('.archive-list-item a')
  .set({
    link: '#main-comic@src',
    image: 'img#main-comic@src'
  })
  .data(entry => {
    entries.push({...entry, title: 'explosm', image: `https:${entry.image}`})
  })
  .done(done.bind(null, 'explosm', entries))
  .log(superLog)
  .error(superLog)
  .debug(superLog)

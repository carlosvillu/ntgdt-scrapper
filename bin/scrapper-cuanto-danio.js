#!/usr/bin/env node

const osmosis = require('osmosis');
const {log, superLog, create, done} = require('../utils')

const entries = []

osmosis
  .get('http://www.cuantodanio.es/')
  .paginate('.nav-previous a', 2)
  .follow('.entry-title a@href')
  .set({
    'title': '.entry-title',
    'link': 'head > link[rel="canonical"]@href',
    'images': ['.entry-content img@src'],
    'instagrams': ['.entry-content [data-instgrm-version] a@href'],
    'twittes': ['.twitter-tweet p:last a@href' ]
  })
  .data(entry => entries.push(entry))
  .done(done.bind(null, 'cuantodanio', entries))
  .log(superLog)
  .error(superLog)
  .debug(superLog)

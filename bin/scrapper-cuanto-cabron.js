#!/usr/bin/env node

const osmosis = require('osmosis');
const {log, superLog, create, done} = require('../utils')

const entries = []

osmosis
  .get('http://www.cuantocabron.com/')
  .paginate('body > ul > li:nth-child(11) > a', 2)
  .follow('.storyTitle a@href')
  .set({
    'title': '.storyTitle a',
    'link': '.storyTitle a@href',
    'image': '#main > div.box.story.rounded3px > p > span > a > img@src'
  })
  .data(entry => entries.push(entry))
  .done(done.bind(null, 'cuantocabron', entries))
  .log(superLog)
  .error(superLog)
  .debug(superLog)


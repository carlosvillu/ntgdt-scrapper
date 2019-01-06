#!/usr/bin/env node

const osmosis = require('osmosis')
const {log, superLog, create, done} = require('../utils')

const entries = []

osmosis
  .get('http://www.vistoenlasredes.com')
  .paginate('body > ul > li:nth-child(11) > a', 2)
  .follow('.story_content a')
  .set({
    title: '.storyTitle a',
    link: '.storyTitle a@href',
    image: '#main > div.box.story > div.story_content > a > img@src'
  })
  .data(entry => entries.push(entry))
  .done(done.bind(null, 'vistoenredes', entries))
  .log(superLog)
  .error(superLog)
  .debug(superLog)

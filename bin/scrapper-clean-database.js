#!/usr/bin/env node

const {firebase} = require('../utils')
const request = require('request')

const db = firebase.database()

const removeEntry = async entry => {
  await db.ref(`/entries/${entry.id}`).remove()
  console.log('removed', entry.id) // eslint-disable-line
}

const checkEntry = entry =>
  new Promise(resolve => {
    const url = entry.image || (entry.video && entry.video.poster)
    request({url, method: 'HEAD', encoding: null}, async (error, response) => {
      if (error || response.statusCode !== 200) {
        await removeEntry(entry)
        resolve(`entry ${entry.id} => KO`)
      }

      resolve(`entry ${entry.id} => OK`)
    })
  })

async function* chekEntries(entries) {
  for (let i = 0; i <= entries.length - 1; i++) {
    const result = await checkEntry(entries[i])
    yield result
  }
}

;(async () => {
  const snapshot = await db.ref(`/entries`).once('value')
  const entries = Object.values(snapshot.val())
  const total = entries.length
  let partial = 1
  for await (const result of chekEntries(entries)) {
    console.log(`[${partial++}/${total}] ${result}`) // eslint-disable-line
  }
  process.exit(0)
})()

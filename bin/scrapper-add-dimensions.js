#!/usr/bin/env node

const sharp = require('sharp')
const {firebase} = require('../utils')
const request = require('request')

const db = firebase.database()

const removeEntry = async entry => {
  await db.ref(`/entries/${entry.id}`).remove()
  console.log('removed', entry.id) // eslint-disable-line
}

const updateEntry = async (entry, dimensions) => {
  await db.ref(`/entries/${entry.id}`).set({
    ...entry,
    width: dimensions.width,
    height: dimensions.height
  })
}

const getDimension = entry =>
  new Promise(resolve => {
    const url = entry.image || (entry.video && entry.video.poster)
    console.log('Requesting ', url) // eslint-disable-line
    request({url, encoding: null}, async (error, response, body) => {
      if (error || response.statusCode !== 200) {
        await removeEntry(entry)
        return resolve({width: 0, height: 0})
      }

      const metadata = await sharp(body).metadata()
      ;(entry.width === undefined || entry.height === undefined) &&
        (await updateEntry(entry, metadata))
      resolve(metadata)
    })
  })

async function* getDimensions(entries) {
  for (let i = 0; i <= entries.length - 1; i++) {
    const dimensions = await getDimension(entries[i])
    yield dimensions
  }
}

;(async () => {
  const snapshot = await db
    .ref(`/entries`)
    // .limitToLast(100)
    .once('value')
  const entries = Object.values(snapshot.val()).filter(
    entry => !entry.width || !entry.height
  )

  const total = entries.length
  let partial = 0
  for await (const dimensions of getDimensions(entries)) {
    console.log(`${partial++}/${total} => w: ${dimensions.width} h: ${dimensions.height}`) // eslint-disable-line
  }
  process.exit(0)
})()

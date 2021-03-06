const program = require('commander')
const request = require('request')
const sharp = require('sharp')

const {NODE_ENV = 'development'} = process.env

// Firebase
const firebase = require('firebase-admin')
exports.firebase = firebase
firebase.initializeApp(
  require(process.env.FIREBASE_CREDENTIALS ||
    `${__dirname}/../firebase-admin-credentials.${NODE_ENV}.json`)
)
const db = firebase.database()

const create = (exports.create = async entry => {
  const snapshot = await db.ref(`/entries/${entry.id}`).once('value')

  const url = entry.image || (entry.video && entry.video.poster)
  if (url && snapshot.val() == null) {
    entry.image && (entry.image_blur = await blurImage(url))
    entry.video && (entry.image_blur = await blurImage(url))

    const dimensions = await getDimension(entry)

    entry.width = dimensions.width
    entry.height = dimensions.height

    log(entry)
    return db.ref(`/entries/${entry.id}`).set(entry)
  }
})

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
    request({url, encoding: null}, async (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return resolve({width: 0, height: 0})
      }

      const metadata = await sharp(body).metadata()
      ;(entry.width === undefined || entry.height === undefined) &&
        (await updateEntry(entry, metadata))
      resolve(metadata)
    })
  })

const blurImage = url => {
  return new Promise(resolve => {
    const transform = sharp()
      .resize(14)
      .blur()
      .png()
      .toBuffer((err, data) => {
        err && console.error(err)
        resolve('data:image/png;base64,' + data.toString('base64'))
      })
    request(url).pipe(transform)
  })
}

// CLI
program
  .option('-V, --verbose', 'verbose output')
  .option('-VV, --super-verbose', 'verbose output')
  .parse(process.argv)
const verbose = fn => (...args) => program.verbose && fn.apply(null, args)
const superVerbose = fn => (...args) =>
  program.superVerbose && fn.apply(null, args)
const log = (exports.log = verbose(console.log))
exports.superLog = superVerbose(console.log)

// Mapper
const isEmpty = obj => Object.keys(obj).length === 0
exports.done = (site, entries) => {
  Promise.all(
    entries.map(data => {
      if (isEmpty(data)) {
        return Promise.resolve()
      }
      const id = require('crypto')
        .createHash('md5')
        .update(data.link)
        .digest('hex')
      const createdAt = Date.now()
      const entry = Object.assign(data, {id, createdAt, site})
      return create(entry)
    })
  )
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

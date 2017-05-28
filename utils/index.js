const program = require('commander')
const request = require('request')
const sharp = require('sharp')

// Firebase
const firebase = require("firebase-admin")
firebase.initializeApp(require(process.env.FIREBASE_CREDENTIALS || `${__dirname}/../firebase-admin-credentials.json`))
const create = exports.create = async entry => {
  const db = firebase.database()
  const snapshot = await db.ref(`/entries/${entry.id}`).once('value')
  if (snapshot.val() == null) {
    entry.image && (entry.image_blur = await blurImage(entry.image))
    log(entry)
    return db.ref(`/entries/${entry.id}`).set(entry)
  }
}

const blurImage = url => {
  return new Promise(resolve => {
    const transform =
      sharp()
        .resize(14)
        .blur()
        .png()
        .toBuffer((err, data) => {
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
const superVerbose = fn => (...args) => program.superVerbose && fn.apply(null, args)
const log = exports.log = verbose(console.log)
exports.superLog = superVerbose(console.log)

// Mapper
const isEmpty = obj => Object.keys(obj).length === 0
exports.done = (site, entries) => {
  Promise.all(entries.map(data => {
    if (isEmpty(data)) { return Promise.resolve() }
    const id = require('crypto').createHash('md5').update(data.link).digest('hex')
    const createdAt = Date.now()
    return create(Object.assign(data, {id, createdAt, site}))
  }))
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
}

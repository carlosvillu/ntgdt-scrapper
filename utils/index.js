const program = require('commander')

// Firebase
const firebase = require("firebase-admin")
firebase.initializeApp(require(`${__dirname}/../firebase-admin-credentials.json`))
const create = exports.create = async entry => {
  const db = firebase.database()
  const snapshot = await db.ref(`/entries/${entry.id}`).once('value')
  if (snapshot.val() == null) {
    log(entry)
    return db.ref(`/entries/${entry.id}`).set(entry)
  }
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
exports.done = (site, entries) => {
  Promise.all(entries.map(data => {
    const id = require('crypto').createHash('md5').update(data.link).digest('hex')
    const createdAt = Date.now()
    return create(Object.assign(data, {id, createdAt, site}))
  }))
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
}

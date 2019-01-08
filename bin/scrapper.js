#!/usr/bin/env node

const program = require('commander')

const pkg = require('../package.json')

const version = pkg.version

program.version(version, '    --version')

program.command('cuanto-danio', 'Parse 2 pages of http://www.cuantodanio.es/')

program.command(
  'visto-en-redes',
  'Parse 2 pages of http://www.vistoenlasredes.com'
)

program.command('cuanto-cabron', 'Parse 2 pages of http://www.cuantocabron.com')
program.command('vaya-gif', 'Parse 1 pages of https://www.vayagif.com')
program.command('explosm', 'Parse 1 pages of explosm.net')

program.parse(process.argv)

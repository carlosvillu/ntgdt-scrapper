#!/usr/bin/env node

const program = require('commander')

const pkg = require('../package.json')

const version = pkg.version

program
  .version(version, '    --version')

program
  .command('cuanto-danio', 'Parse 2 pages of http://www.cuantodanio.es/')

program
  .command('visto-en-redes', 'Parse 2 pages of http://www.vistoenlasredes.com')

program.parse(process.argv)

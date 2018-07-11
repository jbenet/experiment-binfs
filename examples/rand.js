#!/usr/bin/env node

var crypto = require('crypto')

function rand(len) {
  return crypto.randomBytes(Math.ceil(len/2))
    .toString('hex') // convert to hexadecimal format
    .slice(0,len)   // return required number of characters
}


while (true) {
  var batch = 2000
  process.stdout.write(rand(batch))
}

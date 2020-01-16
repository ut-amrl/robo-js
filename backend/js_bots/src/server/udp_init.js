'use strict';
const _log = require('./utils.js').log('UDP '),
      dgram = require('dgram');

exports.READ = Number.parseInt(process.argv[3], 10);
exports.WRITE = exports.READ + 1;

exports.log = _log;

exports.mId = (function(mId) {
  return () => mId++;
}(1));

exports.init = () => {
  const udp = dgram.createSocket('udp4');

  udp.on('listening', () => {
    _log.info('OPENED.');
  });

  udp.on('close', () => {
    _log.info('CLOSED.');
  });

  udp.on('error', err => {
    _log.warn(JSON.stringify(err));
  });

  return udp;
};

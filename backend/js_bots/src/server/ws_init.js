'use strict';
const _log = require('./utils.js').log,
      WS = require('ws');

module.exports = id => {
  const log = _log(id),
        wsServer = new WS.Server({ noServer: true });

  wsServer.on('listening', () => {
    log.info('OPENED.');
    // log.info(JSON.stringify(wsServer.address()));
  });

  wsServer.on('close', () => {
    log.info('CLOSED.');
  });

  wsServer.on('error', err => {
    log.warn(JSON.stringify(err));
    wsServer.close();
  });

  wsServer.log = log;

  return wsServer;
};

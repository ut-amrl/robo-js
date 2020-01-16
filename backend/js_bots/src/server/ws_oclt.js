'use strict';
const _udp = require('./udp_main.js'),
      _ws = require('./ws_init.js')('OCLT');

_ws.on('connection', (ws, req) => {
  // Rand for > 1 connection per PC.
  const cID = req.connection.remoteAddress + Math.random();

  let toID = null;

  function listener() {
    ws.readyState === 1 && ws.send(JSON.stringify(_udp.read()));
    // _ws.log.info('TO: %s SENT: %o', cID, JSON.stringify(_udp.read()));
  }

  _udp.addListener(cID, listener);
  _ws.log.info('CONNECTED: %s', cID);

  ws.on('message', msg => {
    msg = JSON.parse(msg);
    // _ws.log.info('FROM: %s RECIEVED: %o', cID, msg);

    if (!Number.isInteger(msg.sslVisionId)) {
      listener();
    } else {
      global.clearTimeout(toID);
      _udp.queue(msg, cID);
      toID = global.setTimeout(() => {
        _udp.queue({
          sslVisionId: msg.sslVisionId,
          halt: true
        }, cID);
        listener();
      }, 6000);
    }
  });

  ws.on('close', () => {
    _ws.log.info('DISCONNECTED: %s', cID);
    _udp.removeListener(cID, listener);
  });
});

module.exports = _ws;

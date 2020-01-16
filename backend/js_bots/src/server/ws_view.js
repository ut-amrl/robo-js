'use strict';
const _sim = require('./sccr_sim.js'),
      _udp = require('./udp_main.js'),
      _ws = require('./ws_init.js')('VIEW');

_ws.on('connection', (ws, req) => {
  _ws.log.info('CONNECTED: %s', req.connection.remoteAddress);

  ws.on('message', msg => {
    msg = JSON.parse(msg);
    // _ws.log.info('FROM: %s RECIEVED: %o', req.headers.host, msg);

    if (msg.cmd === 'start') {
      _sim.start(msg.conf);
    } else if (msg.cmd === 'stop') {
      _sim.stop();
    }
  });

  ws.on('close', () => {
    _ws.log.info('DISCONNECTED: %s', req.connection.remoteAddress);
  });

 global.setInterval(() => ws.readyState === 1 &&
   ws.send(JSON.stringify(_udp.read())), 10);
});

module.exports = _ws;

'use strict';
const fs = require('fs'),
      _sccr = require('./sccr_ps.js'),
      _log = require('./utils.js').log('SIM '),
      _port = require('./udp_init.js').READ;

let botConfig;

exports.start = conf => {
  if (botConfig === conf.bots) {
    _sccr.start(conf.ball ? [conf.ball] : []);
  } else if (!_sccr.isRunning()) {
    fs.writeFile(`${process.cwd()}/../scripts/simulator_positions_${_port}.txt`,
      conf.bots, err => {
      if (err) {
        _log.warn(JSON.stringify(err));
      } else {
        botConfig = conf.bots;
        _sccr.start(conf.ball ? [conf.ball] : []);
      }
    });
  }
};

exports.stop =_sccr.stop;

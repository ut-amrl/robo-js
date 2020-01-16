'use strict';
const _log = require('./utils.js').log('SCCR'),
      _udp = require('./udp_main.js'),
      spawn = require('child_process').spawn;

let soccer;

exports.isRunning = () => Boolean(soccer);

exports.start = args => {
  if (!soccer) {
    soccer = spawn('./bin/soccer',
      ['-S', '-tb', '-py'].concat(args), {
      cwd: `${process.cwd()}/..`,
      stdio: 'inherit',
      env: {
        JS_BOTS_READ: _udp.WRITE,
        JS_BOTS_WRITE: _udp.READ
      }
    });

    soccer.on('error', err => {
      _log.warn(JSON.stringify(err));
    });

    soccer.on('close', code => {
      _log.info('CLOSED:', code);
      soccer = null;
      _udp.stopListening();
    });

    _udp.startListening();
  }
};

exports.stop = () => {
  if (soccer) {
    soccer.kill('SIGINT');
  }
};

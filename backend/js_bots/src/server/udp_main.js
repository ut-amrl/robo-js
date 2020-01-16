'use strict';
const _udp = require('./udp_init.js'),
      _utils = require('./utils.js'),
      events = require('events'),
      evntEmttr = new events.EventEmitter(),
      msgs = {};

let udp,
    state = {};

exports.queue = (msg, cID) => {
  msgs[cID] = Object.assign({}, msg, {
    pb: _utils.proto.toProto(msg) // _utils.proto.toProto(Object.assign(msg, { messageId: _udp.mId() }))
  }, msg.hasOwnProperty('kick') ? {
    ballStart: {
      pX: state.pX,
      pY: state.pY
    }
  } : null);

  udp && udp.send(msgs[cID].pb, 0, msgs[cID].pb.length, _udp.WRITE, '224.5.23.3', null);
};

exports.read = () => state;

exports.addListener = (cID, cb) => {
  evntEmttr.addListener(cID, cb);
};

exports.removeListener = (cID, cb) => {
  delete msgs[cID];
  evntEmttr.removeListener(cID, cb);
};

exports.startListening = () => {
  if(!udp) {
    udp = _udp.init();

    udp.on('message', msg => {
      state = JSON.parse(_utils.proto.fromProto(msg));
      for (const cID of Object.keys(msgs)) {
        try {
          if (!msgs[cID].halt && _utils.shouldEmit(msgs[cID],
            state.ourBots.find(bot => bot.id === msgs[cID].sslVisionId),
            { pX: state.pX, pY: state.pY, vX: state.vX, vY: state.vY })) {
            global.setTimeout(() => {
              evntEmttr.emit(cID);
              // _udp.log.info('EMITTED: %s', cID);
            }, 100);
            // _udp.log.info('COMPLETE: %o', msgs[cID]);
            delete msgs[cID];
            // _udp.log.info('MSGS: %o', msgs);
          } /* else {
            _udp.log.info('FROM: %s SENDING: %o', cID, msgs[cID]);
            udp.send(msgs[cID].pb, 0, msgs[cID].pb.length, _udp.WRITE, '224.5.23.3', null);
          } */
        } catch (err) {
          _udp.log.warn('Bot %i not found in PB.\n%o', msgs[cID].sslVisionId, err);
        }
      }
    });

    udp.bind(_udp.READ, '224.5.23.3');
  }
};

exports.stopListening = () => {
  udp.close();
  state = {};
  udp = null;
};

exports.READ = _udp.READ;
exports.WRITE = _udp.WRITE;

exports.startListening();

'use strict';
const protoRoot = require('protobufjs/light').Root.fromJSON(require('../../protos.json')),
      msgInType = protoRoot.lookupType('JSBotsProto.World'),
      msgOutType = protoRoot.lookupType('JSBotsProto.Puppet');

exports.log = (function() {
  function _printer(lvl, ps, args) {
    const message = `${(new Date()).toISOString()} ${lvl} ${ps} ${args[0]}`;
    args.shift();
    lvl === 'INFO' ? console.info(message, ...args) : console.warn(message, ...args);
  }

  return ps => {
    return {
      info: (...args) => {
        _printer('INFO', ps, args);
      },
      warn: (...args) => {
        _printer('WARN', ps, args);
      }
    };
  };
}());

exports.shouldEmit = (function() {
  function dist(pX1, pY1, pX2, pY2) {
    return Math.sqrt(Math.pow(pX1 - pX2, 2) + Math.pow(pY1 - pY2, 2));
  }

  function rotated(vel, cur, fin) {
    return Math.abs(vel) < 0.4 && (Math.abs(fin - cur) < 0.1 ||
      (Math.min(fin, cur) < 0 && Math.max(fin, cur) > 0 &&
      Math.abs(Math.abs(fin) + Math.abs(cur) - (2 * Math.PI)) < 0.1));
  }

  function stopped(vX, vY) {
    return Math.abs(vX) < 50 && Math.abs(vY) < 50;
  }

  return (msgClient, msgServer, ball) => {
    // Catching:
    return (msgClient.hasOwnProperty('catchBall') &&
      (dist(ball.vX, ball.vY, msgServer.pX, msgServer.pY) < 100 ||
      Math.sqrt(Math.pow(ball.vX, 2) + Math.pow(ball.vY, 2)) < 100)) ||
      // Kicking:
      (msgClient.hasOwnProperty('kick') &&
      dist(msgClient.ballStart.pX, msgClient.ballStart.pY, ball.pX, ball.pY) > 100) ||
      // Moving:
      (!msgClient.hasOwnProperty('kick') && !msgClient.hasOwnProperty('catchBall') &&
      dist(msgClient.x, msgClient.y, msgServer.pX, msgServer.pY) < 20 &&
      rotated(msgServer.vTheta, msgServer.pTheta, msgClient.theta)) ||
      // Near the ball (DSS):
      (!msgClient.hasOwnProperty('kick') && !msgClient.hasOwnProperty('catchBall') &&
      dist(msgServer.pX, msgServer.pY, ball.pX, ball.pY) < 150 &&
      dist(msgClient.x, msgClient.y, ball.pX, ball.pY) < 150 &&
      rotated(msgServer.vTheta, msgServer.pTheta, msgClient.theta) &&
      stopped(msgServer.vX, msgServer.vY));
  };
}());

exports.proto = {
  fromProto: payload => {
    return JSON.stringify(msgInType.decode(payload));
  },
  toProto: payload => {
    return msgOutType.encode(msgOutType.create(payload)).finish();
  }
};

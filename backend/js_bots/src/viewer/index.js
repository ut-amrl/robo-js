'use strict';
(function(global) {
  const confMap = [
          { conf: { bots: '0 0 0\n', ball: '-b3000,0,0,0' } },
          { conf: { bots: '-120 0 0\n' } },
          { conf: { bots: '-1000 1000 0\n', ball: '-b3000,0,0,0' } },
          { conf: { bots: '-1000 1000 0\n500 0 0\n', ball: '-b3000,0,0,0' } },
          { conf: { bots: '-1500 1000 270\n', ball: '-b3000,0,0,0' } },
          { conf: { bots: '-1500 1000 270\n', ball: '-b3000,0,0,0' } },
          { conf: { bots: '-1500 1000 270\n500 -500 180\n', ball: '-b3000,0,0,0' } },
          { conf: { bots: '-1000 1000 315\n1000 1000 225\n1000 -1000 135\n-1000 -1000 45\n',
            ball: '-b3000,0,0,0' } },
          { conf: { bots: '0 0 0\n1700 0 180\n', ball: '-b3000,0,0,0' } },
          { conf: { bots: '100 0 0\n1700 0 180\n', ball: '-b600,0,0,0' } },
          { conf: { bots: '-120 0 0\n-1700 0 0\n1000 0 180\n1700 0 180\n' } },
          { conf: { bots: '1700 0 180\n1000 0 180\n-120 0 0\n-1700 0 0\n' } },
          { conf: { bots: '100 0 0\n1700 0 180\n', ball: '-b600,0,0,0' } }
        ],
        elements = {},
        ws = new WebSocket(`ws://${global.location.host}`);

  let ctx,
      curr,
      state = {};

  function render() {
    if (curr) {
      ctx.soccerDrawPitch(curr);

      state.theirBots && state.theirBots.forEach(bot =>
        ctx.soccerDrawBot(bot.id, bot.pX, bot.pY, bot.pTheta, false));

      state.ourBots && state.ourBots.forEach(bot =>
        ctx.soccerDrawBot(bot.id, bot.pX, bot.pY, bot.pTheta, true));

      ctx.soccerDrawBall(state.pX, state.pY);
    }

    global.requestAnimationFrame(render);
  }

  function toggleVis() {
    elements.confOptions.style.visibility = (elements.confOptions.style.visibility === 'hidden') ?
      'visible': 'hidden';
  }

  ws.onopen = () => console.info('Connected.');
  ws.onclose = () => console.info('Disconnected.');
  ws.onerror = () => console.error('Network error.');

  global.onload = () => {
    ctx = document.getElementById('field').getContext('2d');
    elements.conf = document.getElementById('conf');
    elements.confOptions = document.getElementById('conf-options-container');
    elements.option = document.getElementById('conf-option');
    elements.start = document.getElementById('start');
    elements.stop = document.getElementById('stop');

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.scale(1 / 3, -1 / 3);

    elements.conf.addEventListener('click', toggleVis);
    elements.start.addEventListener('click', () => {
      toggleVis();
      curr = elements.option.value;
      global.localStorage.setItem('maze', curr);
      if (curr === '12') {  // This one has a random ball.
        const goalWidthH = 380;
        const fieldWidthH = 1800;
        const getMinAngle = function(x, y) {
          return Math.atan2(-goalWidthH - y, fieldWidthH - x);
        };
        const getMaxAngle = function(x, y) {
          return Math.atan2(goalWidthH - y, fieldWidthH - x);
        };
        const RadToDeg = function(a) {
          return 180 / Math.PI * a;
        };
        let ballMinX = 750;
        let ballMaxX = 1250;
        let ballMaxY = 600;
        let x = Math.random() * (ballMaxX - ballMinX) + ballMinX;
        let y = (Math.random() - 0.5) * 2 * ballMaxY;
        let angleMin = getMinAngle(x, y);
        let angleMax = getMaxAngle(x, y);
        let a = angleMin + Math.random() * (angleMax - angleMin);
        const d = 180;
        let rx = x - d * Math.cos(a);
        let ry = y - d * Math.sin(a);
        confMap[curr].conf.ball =
            '-b' + x.toString() + ',' + y.toString() + ',0,0';
        confMap[curr].conf.bots =
            rx.toString() + ' '  + ry + ' ' + RadToDeg(a).toString() +
            '\n' + (fieldWidthH - 300).toString() + ' 0 180\n';
      }
      ws.send(JSON.stringify(Object.assign({ cmd: 'start' }, confMap[curr])));
    });
    elements.stop.addEventListener('click', () => {
      curr = '0';
      global.localStorage.setItem('maze', curr);
      ws.send(JSON.stringify({ cmd: 'stop' }));
    });

    ws.onmessage = e => {
      state = JSON.parse(e.data);

      if (Object.keys(state).length && (!elements.conf.disabled || elements.stop.disabled)) {
        curr = global.localStorage.getItem('maze');
        elements.conf.classList.add('btn-disabled');
        elements.conf.disabled = true;
        elements.confOptions.style.visibility = 'hidden';
        elements.stop.classList.remove('btn-disabled');
        elements.stop.disabled = false;
      } else if (!Object.keys(state).length && (elements.conf.disabled || !elements.stop.disabled)) {
        curr = '0';
        elements.conf.classList.remove('btn-disabled');
        elements.conf.disabled = false;
        elements.stop.classList.add('btn-disabled');
        elements.stop.disabled = true;
      }
    };

    global.requestAnimationFrame(render);
  };
}(window));

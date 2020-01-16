'use strict';
(function() {
  function _formatAngle(a) {
    if (a > 2 * Math.PI) {
      a -= ((2 * Math.PI) * Math.trunc(a / (2 * Math.PI)));
    } else if (a < -2 * Math.PI) {
      a += ((2 * Math.PI) * Math.trunc(a / (-2 * Math.PI)));
    }

    return a;
  }

  const field = (function() {
    const _field = document.createElement('canvas');

    _field.width = '4200';
    _field.height = '2700';

    const _ctx = _field.getContext('2d');

    _ctx.translate(_ctx.canvas.width / 2, _ctx.canvas.height / 2);

    _ctx.lineWidth = 30;

    _ctx.strokeRect(-1800, -400, -100, 800);
    _ctx.strokeRect(1800, 400, 100, -800);

    _ctx.strokeStyle = 'white';

    _ctx.strokeRect(0, 0, 1800, 1200);
    _ctx.strokeRect(0, 0, 1800, -1200);
    _ctx.strokeRect(0, 0, -1800, 1200);
    _ctx.strokeRect(0, 0, -1800, -1200);
    _ctx.strokeRect(1800, 0, -400, 400);
    _ctx.strokeRect(1800, 0, -400, -400);
    _ctx.strokeRect(-1800, 0, 400, 400);
    _ctx.strokeRect(-1800, 0, 400, -400);

    _ctx.beginPath();
    _ctx.arc(0, 0, 200, 0, 2 * Math.PI);
    _ctx.moveTo(1800, 1200);
    _ctx.arc(1800, 1200, 100, Math.PI, 3 * Math.PI / 2);
    _ctx.moveTo(-1800, 1200);
    _ctx.arc(-1800, 1200, 100, 3 * Math.PI / 2, 0);
    _ctx.moveTo(-1800, 1200);
    _ctx.arc(-1800, 1200, 100, 3 * Math.PI / 2, 0);
    _ctx.moveTo(-1800, 1200);
    _ctx.arc(-1800, 1200, 100, 3 * Math.PI / 2, 0);
    _ctx.moveTo(-1800, -1200);
    _ctx.arc(-1800, -1200, 100, 0, Math.PI / 2);
    _ctx.moveTo(1800, -1200);
    _ctx.arc(1800, -1200, 100, Math.PI / 2, Math.PI);
    _ctx.stroke();

    return _field;
  }()),
  obstacles = (function() {
    function _makeObs() {
      const _obs = document.createElement('canvas');

      _obs.width = '4200';
      _obs.height = '2700';

      const _ctx = _obs.getContext('2d');

      _ctx.translate(_ctx.canvas.width / 2, _ctx.canvas.height / 2);

      _ctx.lineWidth = 30;
      _ctx.lineCap = 'round';
      _ctx.fillStyle = 'yellow';
      _ctx.strokeStyle = 'brown';

      return _obs;
    }

    const _box = _makeObs(),
          _ctxBox = _box.getContext('2d'),
          _maze0 = _makeObs(),
          _ctx0 = _maze0.getContext('2d'),
          _maze1 = _makeObs(),
          _ctx1 = _maze1.getContext('2d'),
          _maze2 = _makeObs(),
          _ctx2 = _maze2.getContext('2d');

    _ctxBox.fillRect(750, 750, 500, 500);
    _ctxBox.fillRect(-750, 750, 500, 500);
    _ctxBox.fillRect(-750, -750, 500, 500);
    _ctxBox.fillRect(250, -1250, 500, 500);
    _ctxBox.strokeStyle = 'white';
    function line(x1, y1, x2, y2) {
      _ctxBox.beginPath();
      _ctxBox.moveTo(x1, y1);
      _ctxBox.lineTo(x2, y2);
      _ctxBox.stroke();
    }
    const W = 1750;
    const H = 1250;
    for (let y =-H; y <= H; y += 500) {
      line(-W, y, W, y);
    }
    for (let x =-W; x <= W; x += 500) {
      line(x, -H, x, H);
    }

    _ctxBox.beginPath();
    _ctxBox.arc(0, 0, 20, 0, 2 * Math.PI);
    _ctxBox.fill();

    //_ctxBox.strokeRect(-500, -500, 1000, 1000);

    _ctx0.fillRect(1250, -1250, 500, 500);
    _ctx0.strokeRect(-1750, -1250, 3500, 2500);

    _ctx0.beginPath();
    _ctx0.moveTo(-1250, 750);
    _ctx0.lineTo(-750, 750);
    _ctx0.lineTo(-750, 250);
    _ctx0.lineTo(250, 250);
    _ctx0.lineTo(250, -250);
    _ctx0.moveTo(-1250, -250);
    _ctx0.lineTo(-250, -250);
    _ctx0.moveTo(-1250, -750);
    _ctx0.lineTo(250, -750);
    _ctx0.moveTo(-250, 1250);
    _ctx0.lineTo(-250, 750);
    _ctx0.moveTo(250, 750);
    _ctx0.lineTo(750, 750);
    _ctx0.moveTo(750, 250);
    _ctx0.lineTo(1250, 250);
    _ctx0.lineTo(1250, 750);
    _ctx0.moveTo(750, -1250);
    _ctx0.lineTo(750, -250);
    _ctx0.lineTo(1250, -250);
    _ctx0.moveTo(1750, -750);
    _ctx0.lineTo(1250, -750);
    _ctx0.stroke();

    _ctx1.fillRect(1250, -1250, 500, 500);
    _ctx1.strokeRect(-1750, -1250, 3500, 2500);

    _ctx1.beginPath();
    _ctx1.moveTo(-1250, 1250);
    _ctx1.lineTo(-1250, 750);
    _ctx1.moveTo(-750, 750);
    _ctx1.lineTo(-750, -750);
    _ctx1.moveTo(-1750, -250);
    _ctx1.lineTo(-1250, -250);
    _ctx1.moveTo(-250, 1250);
    _ctx1.lineTo(-250, 750);
    _ctx1.moveTo(-250, -1250);
    _ctx1.lineTo(-250, -750);
    _ctx1.moveTo(-250, 250);
    _ctx1.lineTo(-250, -250);
    _ctx1.lineTo(250, -250);
    _ctx1.lineTo(250, -750);
    _ctx1.moveTo(250, -250);
    _ctx1.lineTo(750, -250);
    _ctx1.lineTo(750, 250);
    _ctx1.lineTo(1250, 250);
    _ctx1.moveTo(750, -1250);
    _ctx1.lineTo(750, -750);
    _ctx1.moveTo(1250, -750);
    _ctx1.lineTo(1250, -250);
    _ctx1.moveTo(1750, 750);
    _ctx1.lineTo(1250, 750);
    _ctx1.moveTo(750, 750);
    _ctx1.lineTo(250, 750);
    _ctx1.lineTo(250, 250);
    _ctx1.stroke();

    _ctx2.fillRect(-1250, 750, 500, 500);
    _ctx2.strokeRect(-1750, -1250, 3500, 2500);

    _ctx2.beginPath();
    _ctx2.moveTo(-1250, 1250);
    _ctx2.lineTo(-1250, -750);
    _ctx2.lineTo(-250, -750);
    _ctx2.moveTo(-750, 750);
    _ctx2.lineTo(-750, -250);
    _ctx2.lineTo(-250, -250);
    _ctx2.moveTo(-250, 750);
    _ctx2.lineTo(-250, 250);
    _ctx2.moveTo(250, 250);
    _ctx2.lineTo(250, -250);
    _ctx2.moveTo(750, 750);
    _ctx2.lineTo(750, -250);
    _ctx2.moveTo(1250, -250);
    _ctx2.lineTo(1250, -750);
    _ctx2.lineTo(250, -750);
    _ctx2.moveTo(1250, 1250);
    _ctx2.lineTo(1250, 250);
    _ctx2.stroke();

    return [_box, _box, _maze0, _maze1, _maze2];
  }());

  CanvasRenderingContext2D.prototype.soccerDrawPitch = function(id) {
    this.clearRect(-3 * this.canvas.width / 2, -3 * this.canvas.height / 2,
      3 * this.canvas.width, 3 * this.canvas.height);
    this.drawImage(obstacles[id - 2] || field, -3 * this.canvas.width / 2,
      -3 * this.canvas.height / 2);
  };

  CanvasRenderingContext2D.prototype.soccerDrawBall = function(x, y) {
    this.fillStyle = 'orange';

    this.beginPath();
    this.arc(x, y, 20, 0, 2 * Math.PI);
    this.fill();
  };

  CanvasRenderingContext2D.prototype.soccerDrawBot = function(id, x, y, theta, isOurTeam) {
    theta = _formatAngle(theta + (Math.PI / 4));

    this.fillStyle = isOurTeam ? 'black' : 'red';

    this.beginPath();
    this.arc(x, y, 90, theta, theta + (3 * Math.PI / 2));
    this.fill();

    this.save();

    this.fillStyle = isOurTeam ? 'white' : 'black';
    this.font = '250px sans-serif';
    this.textAlign = 'center';
    this.textBaseline = 'middle';

    this.translate(x, y);
    this.scale(1 / 3, -1 / 3);

    this.fillText(id, 0, 0);

    this.restore();
  };
}());

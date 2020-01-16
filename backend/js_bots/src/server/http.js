'use strict';
const wsOclt = require('./ws_oclt.js'),
      wsView = require('./ws_view.js'),
      _log = require('./utils.js').log('HTTP'),
      fs = require('fs'),
      http = require('http'),
      mimeTypes = {
        '/':     'text/html',
        '.html': 'text/html',
        '.js':   'text/javascript',
        '.css':  'text/css',
        '.ico':  'image/png'
      },
      httpServer = http.createServer((req, res) => {
        const fileType = req.url.substring(req.url.lastIndexOf('.')).toLowerCase(),
              basePath = fileType === '.ico' ? `${__dirname}/../..` : `${__dirname}/../viewer`,
              filePath = fileType === '/' ? '/index.html' : req.url.toLowerCase();

        fs.readFile(`${basePath}${filePath}`, (err, file) => {
          if (err) {
            if (err.code === 'ENOENT') {
              fs.readFile(`${basePath}/404.html`, (err, file404) => {
                if (err) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(err), 'utf-8');
                } else {
                  res.writeHead(404, { 'Content-Type': 'text/html' });
                  res.end(file404, 'utf-8');
                }
              });
            } else {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(err), 'utf-8');
            }
          } else {
            res.writeHead(200, { 'Content-Type': mimeTypes[fileType] });
            res.end(file, 'utf-8');
          }
        });
      });

httpServer.on('close', () => {
  _log.info('CLOSED.');
});

httpServer.on('request', (req) => { // jshint ignore:line
  // _log.info('REQUEST:', req.url);
});

httpServer.on('clientError', (err, sock) => {
  _log.warn(JSON.stringify(err));
  sock.end('HTTP/1.1 400 Bad Request');
});

httpServer.on('upgrade', (req, sock, head) => {
  _log.info('UPGRADE.');

  if (req.headers.origin.indexOf('8080') > -1) {
    wsOclt.handleUpgrade(req, sock, head, ws => {
      wsOclt.emit('connection', ws, req);
    });
  } else if (req.headers.origin.indexOf(process.argv[2]) > -1) {
    wsView.handleUpgrade(req, sock, head, ws => {
      wsView.emit('connection', ws, req);
    });
  } else {
    sock.destroy();
  }
});

module.exports = httpServer;

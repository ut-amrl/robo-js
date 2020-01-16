'use strict';
const httpPort = Number.parseInt(process.argv[2], 10),
      udpPort = Number.parseInt(process.argv[3], 10);

function exit9(msg) {
  console.error(`Invalid Argument.\n${msg}`);
  process.exit(9);
}

if (!httpPort || !udpPort) {
  exit9('npm start -- <HTTP PORT> <UDP PORT>');
} else if (httpPort < 1025 || httpPort > 65535) {
  exit9('HTTP port outside range.');
} else if (httpPort === 8080) {
  exit9('HTTP port reserved for Ocelot.');
} else if (udpPort < 1025 || udpPort > 65535) {
  exit9('UDP port outside range.');
} else if (udpPort % 2) {
  exit9('UDP port must be even.');
} else {
  require('./http.js').listen(httpPort);
}

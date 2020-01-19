# Robo-JS 🤖
This repository is effectively the software artifact for the white paper [Making High-Performance Robots Safe and Easy to Use ForAn Introduction to Computing](https://arxiv.org/abs/1909.03110). As such, it is meant for use not development.

### Limitations ❌
- The soccer binary was built and tested on **Ubuntu 18.04.3 LTS**. Ubuntu is a hard requirement. Other versions of Ubuntu have not been tested, proceed at your own risk.

- The Web IDE must be accessed from the same machine running the soccer binary (i.e. localhost). This requirement could be alleviated with further engineering effort, if there is interest.

- The Google account feature as described in the publication is not present.

### Contents 📦
- `backend/`: Contains the soccer simulation binary as well as the Node.js middleware. The middleware communicates with the Web client via a WS connection and with the soccer program via UDP.

- `frontend/`: The Web IDE.

- `scripts/`: A collection of scripts for installation and startup. More details are found in the instructions below.

### Instructions 📝
There are three Bash scripts in the `scripts` directory to provide assistance in operation.

1. `install.sh`: Installs third-party dependencies. Successful completion is a necessary and sufficient condition for use. As implied, this script only needs to run successfully once per machine.

1. `runBackend.sh`: Starts the Node.js program. Optionally, port numbers can be provided for the WS server and UDP broadcast. The syntax is as follows:

  ```
  $ ./runBackend.sh # Use the default ports of 8000 (WS) and (41300).
  ^C
  $ ./runBackend.sh 8001 41302 # Provide custom ports.
  ```

1. `runFrontend.sh`: Starts an HTTP server to access the Web IDE.

Both the `runBackend.sh` and `runFrontend.sh` must be left running for the system to be fully operational. To get started navigate to the Web IDE in your browser.

### Problems 🔴
See [Issues](../../issues); if someone has not already filed an issue for your problem, then please create one. Be descriptive.

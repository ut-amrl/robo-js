#!/bin/bash

cd "$(dirname "$0")" || exit
mkdir installs; cd installs || exit

if [[ ! $(dpkg -s libgoogle-glog0v5) ]]; then
  sudo apt-get install libgoogle-glog0v5
fi

if [[ ! $(dpkg -s libspqr2) ]]; then
  sudo apt-get install libspqr2
fi

if [[ ! $(dpkg -s libtbb2) ]]; then
  sudo apt-get install libtbb2
fi

if [[ ! $(dpkg -s libprotobuf10) ]]; then
  sudo apt-get install libprotobuf10
fi

if [[ ! $(command -v make) ]]; then
  sudo apt-get install make
fi

if [[ ! $(command -v python) ]]; then
  sudo apt-get install python
fi

if [[ ! $(command -v g++) ]]; then
  sudo apt-get install g++
fi

if [[ ! $(command -v z3) ]]; then
  git clone https://github.com/Z3Prover/z3.git && \
  pushd z3 && \
    sudo python scripts/mk_make.py && \
    pushd build && \
      sudo make -j"$(nproc)" && sudo make install && \
    popd && \
  popd || exit
  # To uninstall z3; run `sudo make uninstall` from z3/build.
fi

if [[ ! $(command -v luajit) ]]; then
  git clone http://luajit.org/git/luajit-2.0.git && \
    pushd luajit-2.0 && \
      make -j"$(nproc)" && sudo make install && \
    popd || exit
  # To uninstall luajit; run `sudo make uninstall` from luajit-2.0.
fi

if [[ ! $(command -v npm) ]]; then
  wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash && \
  NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" && \
  export NVM_DIR
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
  nvm install --lts=carbon # Install the latest 8.x version.
  # To uninstall run: `nvm uninstalll --lts=carbon`.
  # To uninstall nvm itself see: https://github.com/nvm-sh/nvm#uninstalling--removal
elif [[ $(node -v | cut -c2) -lt 8 ]]; then
  echo 'WARNING: Node.js current version may not be sufficient.'
fi

if ! ldconfig -p | grep -q libre2; then
  git clone https://github.com/google/re2.git && \
  pushd re2 && \
    make -j"$(nproc)" test && sudo make install && \
  popd || exit
fi

echo '
Please exit and open a new terminal.
'

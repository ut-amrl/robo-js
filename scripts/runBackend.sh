#!/bin/bash

cd "$(dirname "$0")" || exit
cd ../backend/js_bots || exit

if [[ $# -eq 2 ]]; then
  npm start -- "$1" "$2"
else
  npm start -- 8000 41300
fi

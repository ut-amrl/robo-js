#!/bin/bash

cd "$(dirname "$0")" || exit
cd ../frontend || exit
npm run serve-local

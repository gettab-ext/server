#!/usr/bin/env bash

./install_nodejs.sh;
sudo npm i -g pm2;
./run_geoip_server.sh;

git clone https://github.com/gettab-ext/server.git /opt/gettab-server;
cd /opt/gettab-server;
npm i;
pm2 gettab.json;

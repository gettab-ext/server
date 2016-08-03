#!/usr/bin/env bash

git clone https://github.com/gettab-ext/server.git /opt/gettab-server;
cd /opt/gettab-server/scripts;

./run_geoip_server.sh;
./install_nodejs.sh;

sudo npm i -g pm2;

npm i;
pm2 start gettab.json;

#!/usr/bin/env bash

sudo apt-get update;
sudo apt-get install nginx -y;

wget https://raw.githubusercontent.com/gettab-ext/server/master/etc/balancer.conf -O /etc/nginx/sites-enabled/balancer.conf;
sudo /etc/init.d/nginx restart;

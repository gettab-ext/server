#!/usr/bin/env bash

ln -s /opt/gettab-proxy/etc/gettab1.conf /etc/nginx/sites-enabled/gettab1;
/etc/init.d/nginx reload;
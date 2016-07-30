#!/usr/bin/env bash

ln -sf /opt/gettab-server/etc/gettab1.conf /etc/nginx/sites-enabled/gettab1;
/etc/init.d/nginx reload;
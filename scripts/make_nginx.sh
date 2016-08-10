#!/usr/bin/env bash

ln -sf /opt/gettab-server/etc/worker.conf /etc/nginx/sites-enabled/worker;
/etc/init.d/nginx reload;

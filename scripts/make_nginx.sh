#!/usr/bin/env bash

ln -sf /opt/gettab-server/etc/gettab-balancer.conf /etc/nginx/sites-enabled/gettab-balancer;
/etc/init.d/nginx reload;

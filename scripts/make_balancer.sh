#!/usr/bin/env bash

ulimit -n 65536;

net.core.somaxconn
sysctl -w net.ipv4.tcp_max_tw_buckets=65536;
sysctl -w net.ipv4.tcp_tw_recycle=1;
sysctl -w net.ipv4.tcp_tw_reuse=0;
sysctl -w net.ipv4.tcp_max_syn_backlog=131072;
sysctl -w net.ipv4.tcp_syn_retries=3;
sysctl -w net.ipv4.tcp_synack_retries=3;
sysctl -w net.ipv4.tcp_retries1=3;
sysctl -w net.ipv4.tcp_retries2=8;
sysctl -w net.ipv4.tcp_rmem=16384 174760 349520;
sysctl -w net.ipv4.tcp_wmem=16384 131072 262144;
sysctl -w net.ipv4.tcp_mem=262144 524288 1048576;
sysctl -w net.ipv4.tcp_max_orphans=65536;
sysctl -w net.ipv4.tcp_fin_timeout=10;
sysctl -w net.ipv4.tcp_low_latency=1;
sysctl -w net.ipv4.tcp_syncookies=0;

sudo apt-get update;
sudo apt-get install nginx -y;

wget https://raw.githubusercontent.com/gettab-ext/server/master/misc/ok.html -O /opt/ok.html;

wget https://raw.githubusercontent.com/gettab-ext/server/master/etc/balancer.conf -O /etc/nginx/sites-enabled/balancer.conf;
sudo /etc/init.d/nginx restart;

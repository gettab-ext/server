#!/usr/bin/env bash

docker run --net=host --restart=always -d fiorix/freegeoip -http localhost:6551;

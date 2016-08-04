#!/usr/bin/env bash

docker run --net=host --restart=always -d fiorix/freegeoip -http 0.0.0.0:6551 -use-x-forwarded-for;

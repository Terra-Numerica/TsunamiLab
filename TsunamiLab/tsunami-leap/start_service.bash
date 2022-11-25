#!/bin/bash

sudo leapd &
sleep 5
cd websocket
python -m SimpleHTTPServer
#!/bin/bash

source venv/bin/activate
cd websocket
LD_PRELOAD=./libLeap.so python server.py
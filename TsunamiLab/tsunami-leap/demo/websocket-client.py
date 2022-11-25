import websocket

ws = websocket.WebSocket()
ws.connect("ws://localhost:8765")
import time
t0 = time.time()
t = t0
while t < t0 + 20:
    print(t-t0)
    t=time.time()
    time.sleep(0.1)
print(ws.recv())
ws.close()
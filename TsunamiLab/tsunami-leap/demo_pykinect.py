import numpy as np
import freenect
import calibkinect

# Update the point cloud from the shell or from a background thread!

def update(dt=0):
  global projpts, rgb, depth
  depth,_ = freenect.sync_get_depth()
  rgb,_ = freenect.sync_get_video()
  q = depth
  X,Y = np.meshgrid(range(640),range(480))
  # YOU CAN CHANGE THIS AND RERUN THE PROGRAM!
  # Point cloud downsampling
  d = 4
  projpts = calibkinect.depth2xyzuv(q[::d,::d],X[::d,::d],Y[::d,::d])

update() 

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
puntos = projpts[0]

xs = puntos[:,0]
ys = puntos[:,1]
zs = puntos[:,2]
uv = projpts[1]
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.scatter(uv[:,0], uv[:,1], zs, c = zs)

ij = np.floor(uv).astype(np.int)
colors = rgb[ij[:,1],ij[:,0]]
colors = np.reshape(colors, (-1,3))

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.scatter(puntos[:,0], puntos[:,1], puntos[:,2], c=list(colors/255.))
plt.show()
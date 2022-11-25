# leap-tsunami


# Linux

## Installation


`sudo dpkg --install Leap-*-x64.deb`
`LeapControlPanel`
`sudo service leapd restart`
`sudo leapd`

## Usage

1. Abrir carpeta `leap-tsunami` (repo root folder)

2. Abrir Terminal: Click botón derecho en espacio en blanco -> "Abrir Terminal"

3. Escribir y luego presionar Enter

```
sudo ./start_service.bash
```
Ingresar contraseña.

4. Abrir Terminal, escribir y luego presionar enter:

```
./startup.bash
```

5. Abrir Chrome en la siguiente dirección:

```
    localhost:8000
```

Presionar tecla F11 para ver en pantalla completa. Si no funciona, hacer click en la ventan de Chrome y presionar F11

# Mac OS

## Installation
### Websocket server
Follow these instructions first:

https://gist.github.com/i3games/20232baf5a6ef13131fcf72d63869113

In my case, the command was:
```
install_name_tool -change /Library/Frameworks/Python.framework/Versions/2.7/Python /Users/jgalazmo/opt/miniconda3/envs/leap/lib/libpython2.7.dylib LeapPython.so
```



---------
First install the environment with `conda`:
```
conda create --name leap python=2.7
```
Then deactivate the `base` environment and activate the new `leap` environment
```
conda deactivate
conda activate leap
```
You have to deactivate the `base` environment, otherwise you will be still using the system's python instead of conda's.
Check that it works with
```
python --version
which python
```
both should print something with Anaconda inside, depending on your installation. If it does not say conda or something, then it probably is using the system's python instead. For example, in my case:
```
(leap) ➜  demo git:(retry) python --version
Python 2.7.18 :: Anaconda, Inc.
(leap) ➜  demo git:(retry) which python
/Users/jgalazmo/opt/miniconda3/envs/leap/bin/python
```





### Frontend
The frontend is now semi-dockerized. To run it `cd` into the `websocket` folder and
1. Build the image running `docker compose build`. You need an internet connection for this.
2. Run `docker compose run frontend sh` and leave it open
3. Open another terminal session in the `websocket` folder
4. Obtain the container's ID from the `docker ps` command. Let's name it `<container ID>`.
5. Copy the `node_modules` with `docker cp <container ID>:/code/node_modules .`
6. You can close the session opened in step 2.
7. Open a local server with `python -m SimpleHTTPServer`, for example.
8. Go to `localhost:8000` in Chrome and you should be able to see the app's frontend.


## Usage

Go to the `websocket` folder and start the server with
```
conda deactivate
conda activate leap
python mac_server.py
```

Then in another terminal. If you prefer python2 start the frontend server with 

```
python -m SimpleHTTPServer
```
or if you have Python 3, then start it with
```
python -m http.server
```

Then open-up the browser in the `http://localhost:8000` address. 

### Monitoring and debugging
There is currently a bug that adds additional steps to get the data from the websockets server.
The problem is that the server's terminal has to be "in focus" while the frontend is open, this means that after you open the frontend in the browser, you will have to click the terminal's window.
Even with this fix sometimes it breaks. So to debug it:

1. Open the developer's tools and go to the Network tab
2. Open `localhost:8000`. If you did it before step 1., then refresh the page.
3. Click on the `localhost:8765` connection, it should have the `101 Switchint Protocols` HTTP status
4. Click on the `Preview` tab of this connection
5. Verify that the connection has not been lost. If it was lost then refresh the page.
6. Click on the server's terminal, you should see these messages in the terminal

```
starting
new client!
sending aspect ratio
```

and the client should receive something like

```
{"xz": 1.592185510852872, "yz": 1.592185510852872, "xy": 1.0, "obj_name": "ratio"}	1638020132.3219166
```
7. When you click on the terminal the client should receive the stream of messages from the Leap sensor.

### Supported browsers

It works well with Safari 15.0 (16612.1.29.41.4, 16612). Tried on Chrome Version 96.0.4664.55 (Official Build) (x86_64) but the simulation is very slow and I'm not sure the leap works.

# Windows

## Installation
### 1/3 Leapmotion

Download the v2 SDK https://developer-archive.leapmotion.com/v2?id=skeletal-beta&platform=windows&version=2.3.1.31549
Install the LeapMotion software using the executable in the root folder of the SDK. 
Plug the camera, open the control panel and look for the diagnostic visualizer. 
If after opening it you don't see your hands plotted on the screen, and/or if the taskbar icon of the leapmotion control panel is black and not green, then follow these instructions to fix it:

bug fix: 
https://forums.leapmotion.com/t/resolved-windows-10-fall-creators-update-bugfix/6585
cited here
https://support.leapmotion.com/hc/en-us/articles/360005533097-Why-won-t-my-Leap-Motion-work-with-V2-and-Windows-10-
for reference:
https://developer-archive.leapmotion.com/documentation/v2/python/devguide/Project_Setup.html

The installation of the LeapMotion Controller is successful when:
1. The icon in the taskbar is green
2. The diagnostic visualizer shows your virtual hands plotted nicely on screen.

### 2/3 python environment
Install miniconda https://docs.conda.io/projects/conda/en/latest/user-guide/install/windows.html


```
conda create --name leap python=2.7
conda deactivate
conda activate leap
conda install -c cctbx websocket-server
```


### 3/3 node modules (frontend)

#### Without docker
Install node.js https://nodejs.org/en/download/current/ and run
```
npm install
```
inside the websockets folder

#### With docker
Install and start docker. If already installed in another user you may need to add it to the `docker-users` group as
```
net localgroup docker-users work /add
```
and logout / login.


The frontend is now semi-dockerized. To run it `cd` into the `websocket` folder and
1. Build the image running `docker compose build`. You need an internet connection for this.
2. Run `docker compose run frontend sh` and leave it open
3. Open another terminal session in the `websocket` folder
4. Obtain the container's ID from the `docker ps` command. Let's name it `<container ID>`.
5. Copy the `node_modules` with `docker cp <container ID>:/code/node_modules .`
6. You can close the session opened in step 2.
7. Open a local server with `python -m SimpleHTTPServer`, for example.
8. Go to `localhost:8000` in Chrome and you should be able to see the app's frontend.








## Running
After plugging your camera: 

1. If the leapmotion icon is not green on the tasks bar:

  - Start leapmotion
  - Quit ultraleap
  - Resume leapmotion tracking

2. Open an Anaconda prompt (win key - Anaconda prompt )

```
cd websockets
conda deactivate
conda activate leap
python win_server.py
```

3. Open another Anaconda prompt
```
cd websockets
conda deactivate
conda activate base
python -m http.server
```

4. Lunch the app from the Edge browser at `localhost:8000`

If hands do not show in the app then refresh the browser and make sure the terminal running the hands server is focused (click on it). Sometimes there is an error, about the client being lost or something: just refresh  the browser again and click on the hand-server terminal.


# Ideas

https://hal.inria.fr/file/index/docid/857534/filename/RT-440.pdf


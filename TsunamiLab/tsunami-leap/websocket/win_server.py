from websocket_server import WebsocketServer
import time
import logging
import json
import sys, os, inspect

import os, sys, inspect
src_dir = os.path.dirname(inspect.getfile(inspect.currentframe()))
# Windows and Linux
arch_dir = '../win-lib/x64' if sys.maxsize > 2**32 else '../win-lib/x86'

sys.path.insert(0, os.path.abspath(os.path.join(src_dir, arch_dir)))
sys.path.insert(0, os.path.abspath(os.path.join(src_dir, '../win-lib')))

from pprint import pprint 
pprint(sys.path)
import Leap

X_COORD = 0
Y_COORD = 1
Z_COORD = 2
FINGER_ID = {0:'thumb', 1:'index', 2:'middle', 3:'ring', 4:'pinky'}
PREV_FRAME = 0


def serve(client, websocket):
	global PREV_FRAME
	print('starting')
	on_connect = True
	print("new client!")
	controller = Leap.Controller()
	print("got a controller")
	while True:
		time.sleep(1./10.)
		# print ('sleeping')
		if controller.is_connected:
			# print('connected')
			frame = controller.frame()
			if frame.is_valid:
				if on_connect:
					print ('sending aspect ratio')
					try:
						websocket.send_message_to_all(json.dumps(get_aspect_ratio(frame)))
					except Exception as e:
						print(e)
						print("breaking out from loop")
						break
					on_connect = False

				if frame.hands:
					print('sending hands in frame')
					new_frame = get_frame(frame)
					try:
						websocket.send_message_to_all(json.dumps(new_frame))
					except Exception as e:
						print(e)
						print("breaking out from loop")
						break
			PREV_FRAME = frame

def get_frame(frame) :
	print('getting frame')
	frames = dict()
	frames['obj_name'] = 'frame'
	hands = list()
	for hand in frame.hands:
		hands.append(get_hand_positions(frame, hand))
	frames['hand_list'] = hands
	return frames 
		
		

def get_hand_positions(frame, hand):
	print('getting hand positions')
	hand_obj = dict()
	hand_obj['obj_id'] = hand.id
	if hand.is_left:
		hand_obj['desc'] = 'left'
		
	else :
		hand_obj['desc'] = 'right'
	hand_obj['data'] = get_hand_data(frame, hand)
	return hand_obj

def get_hand_data(frame, hand):
	hand_data = dict()
	hand_data['palm'] = get_palm_position(frame, hand)
	hand_data['fingers'] = get_finger_positions(frame, hand)
	hand_data['pinch'] = get_pinch_strength(frame,hand)
	hand_data['grab'] = get_grab_strength(frame,hand)

	return hand_data

def get_palm_position(frame, hand):
	#print ('getting palm position')
	global PREV_FRAME
	velocity = hand.palm_velocity
	
	translation = hand.translation(PREV_FRAME)
	probability = hand.translation_probability(PREV_FRAME)
	magnitude = (velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2) ** 0.5
	#print ("Velocity : {}".format(velocity))
	#print ("Translation: {}".format(translation))
	#print("Probability: {}".format(probability))
	#print("Magnitude: {}".format(magnitude))
	#if probability * 100 > 80 :
		#print ("Hand is moving!!!!")
	if magnitude < 200:
		print("you are slow")
	elif magnitude < 750:
		print("eh thats okay")
	else:
		print("wow we got a speedracer over here")
	data = {}
	data['direction'] = normalize_point(frame, hand.direction)
	data['velocity'] = normalize_point(frame, hand.palm_velocity)
	data.update(normalize_point(frame, hand.palm_position))
	#print ('hand data is {}'.format(data))
	return data

def get_finger_positions(frame, hand):
	#print ('getting finger positions')
	fingers = dict()
	for pointable in hand.pointables:
		if pointable.is_finger:
			fingers[FINGER_ID[Leap.Finger(pointable).type]] = create_finger(frame, pointable)
	return fingers
				
def get_aspect_ratio(frame):
	ibox = frame.interaction_box
	ratio = dict()
	ratio['obj_name'] = 'ratio'
	ratio['xy'] = ibox.width/ibox.height
	ratio['yz'] = ibox.height/ibox.depth
	ratio['xz'] = ibox.width/ibox.depth
	return ratio
	
def normalize_point(frame, data):
	ibox = frame.interaction_box
	coordinates = ibox.normalize_point(data, True)
	normalized_coord = dict()
	normalized_coord['x'] = coordinates[X_COORD]
	normalized_coord['y'] = coordinates[Y_COORD]
	normalized_coord['z'] = coordinates[Z_COORD]
	
	return normalized_coord

def create_finger(frame, pointable):
	data = {}
	data['direction'] = normalize_point(frame, pointable.direction)
	data['is_extended'] = pointable.is_extended
	data['velocity'] = normalize_point(frame, pointable.tip_velocity)
	finger_data = pointable.tip_position
	data.update(normalize_point(frame, finger_data))
	#print ('finger data is {}'.format(data))
	return data

def get_pinch_strength(frame, hand):
	#print('getting pinch strength')
	strength = hand.pinch_strength
	data = {}
	data['pinch_strength'] = strength
	#print(strength)
	return data

def get_grab_strength(frame, hand):
	#print('getting grab strength')
	strength = hand.grab_strength
	data = {}
	data['grab_strength'] = strength
	#print(strength)
	return data
	

# start_server = websockets.serve(serve, 'localhost', 8765)
# asyncio.get_event_loop().run_until_complete(start_server)
# asyncio.get_event_loop().run_forever()

server = WebsocketServer(host='127.0.0.1', port=8765, loglevel=logging.INFO)
server.set_fn_new_client(serve)
server.run_forever()

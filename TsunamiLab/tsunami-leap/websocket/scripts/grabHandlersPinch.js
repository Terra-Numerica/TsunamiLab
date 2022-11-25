let minGrabStrength = 0.95;
let midPointGrab = [];
function updateGrab(handObj) {
  let text = document.getElementById('grab');
  let grab = handObj.data.grab.grab_strength;
  text.innerHTML += '<br />Hand: ' + handObj.desc +
    '<br />    Strength: (' + grab + ')<br />';
}

function resetGrab() {
  document.getElementById('grab').innerHTML = 'Grab: ';
}


function getGrabStrength(hand) {
  let grabStrength = hand.data.grab.grab_strength;
  let palmPos = hand.data.palm;
  let normalPalm = normalizePoint(palmPos);
  let side = hand.desc;
  let midPoints = [];
  if (grabStrength > minGrabStrength) {
    midPoints = midPointFingers(hand);
    if (side == 'right' && currentAction == 'grabOneRight') {
      drawCircle(Math.round(midPoints[0]), Math.round(midPoints[1]), 35 * grabStrength, 'red');
    }
    if (side == 'left' && currentAction == 'grabOneLeft') {
      drawCircle(Math.round(midPoints[0]), Math.round(midPoints[1]), 35 * grabStrength, 'red');
    }
  }
  return grabStrength;
}



function handleGrab(hand) {
  let palmPos = hand.data.palm;
  let normalPalm = normalizePoint(palmPos);
  let midPoints = [];

  let pinchStrength = hand.data.pinch.pinch_strength
  if (pinchStrength > minGrabStrength) {
    midPoints = midPointFingers(hand);
    if (hand.desc == 'right') {
      if (draggingRight == false && currentAction.length == 0) {
        currentAction = 'grabOneRight';
        actionLock = true;
        draggingRight = true;
        //initialDragPointRight = [Math.round(normalPalm[0]),Math.round(normalPalm[1])];
        initialDragPointRight = [Math.round(midPoints[0]), Math.round(midPoints[1])];
        if (dragLock.length == 0) {
          dragLock = hand.desc;
          dragging = true;
          initialDragPoint = initialDragPointRight;
          simulateMouseEvent(initialDragPointRight[0], initialDragPointRight[1], 'mousedown');
        }
        //console.log("initial drag point right: ",initialDragPointRight);
      }
    }

  }
  // console.log("handleGrab dragging is: ", dragging);
}



function handleReleaseGrab(hand) {
  let pinchStrength = hand.data.pinch.pinch_strength
  if (pinchStrength <= minGrabStrength) {
    if (hand.desc == 'right') {
      if (draggingRight == true) {
        //console.log("drag released right",dragging);
        initialDragPointRight = [];
        draggingRight = false;
        if (dragLock == hand.desc && currentAction == 'grabOneRight') {
          currentAction = '';
          actionLock = false;
          dragging = false;
          dragLock = '';
          initialDragPoint = [];
          simulateMouseEvent(0, 0, 'mouseup');
          //console.log("drag released right",dragging);
        }
        //console.log("drag released right",dragging);
      }
    }
  }
  //console.log("handleReleaseGrab dragging is: ",dragging);
  if (draggingRight == false && draggingLeft == false) { //fix for when hand leaves leapmotion doing grab gesture
    dragging = false;
    dragLock = '';
    initialDragPoint = [];
  }
}
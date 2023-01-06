let COORDINATE_SYS = 'xz';
let CAMERA_STYLE = 'up';
let canvas = document.getElementById('plot');
canvas.height = window.innerHeight;
canvas.width = window.innerHeight;
let COLORS = ['red', 'yellow', 'blue', 'cyan', 'magenta', 'black', 'green'];

let dragging = false;
let initialDragPoint = [];

let dragLock = '';
let draggingRight = false;
let draggingLeft = false;
let initialDragPointLeft = [];
let initialDragPointRight = [];

let pinchRight = false;
let pinchLeft = false;
let initialPinchRight = [];
let initialPinchLeft = [];
let currentPinchRight = [];
let currentPinchLeft = [];
let firstPinch = true;

let minPinchStrength = 0.99;

let saveEpicenter = false;
let lastEpicenter = [];

let currentAction = '';
let actionLock = false;


let handIdLeft = -1;
let handIdRight = -1;

function getColor(objId) {
  return COLORS[objId % COLORS.length];
}

function updateCoordinates(handObj) {
  let text = document.getElementById('coordinates');
  let palm = normalizePoint(handObj.data.palm);
  text.innerHTML += '<br />Hand: ' + handObj.desc +
    '<br />    Palm: (' + Math.round(palm[0]) + ',' + Math.round(palm[1]) + ')<br />';
}

function updatePinch(handObj) {
  let text = document.getElementById('pinch');
  let pinch = handObj.data.pinch.pinch_strength;
  text.innerHTML += '<br />Hand: ' + handObj.desc +
    '<br />    Strength: (' + pinch + ')<br />';
}


function updateDoublePinch() {
  let text = document.getElementById('twopinch');
  if(firstPinch == false){
    let difference = differenceDoublePinch();
    text.innerHTML += '<br />Is First Pinch Value: : ' + firstPinch +
    '<br />    Diff: (' + difference + ')<br />';
  }
}

function resetCoordinates() {
  document.getElementById('coordinates').innerHTML = 'Coordinates: ';
}

function resetPinch() {
  document.getElementById('pinch').innerHTML = 'Pinch: ';
}


function resetDiffPinch(){
  document.getElementById('twopinch').innerHTML = 'Diff Double Pinch: ';
}

function setCanvasSize(ratio) {
  console.log('setting canvas size');
  percentageOfWindow = 1.0;
  canvasWidth = window.innerWidth * percentageOfWindow;
  canvasHeight = window.innerHeight * percentageOfWindow;

  if (canvasWidth / canvasHeight > ratio[COORDINATE_SYS]) {
    canvasWidth = canvasHeight * ratio[COORDINATE_SYS];
  } else {
    canvasHeight = canvasWidth / ratio[COORDINATE_SYS];
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function normalizePoint(point) {
  let x, y, z;
  if(COORDINATE_SYS == 'xy'){
    if (CAMERA_STYLE == 'up') {
      x = point.x * canvas.width;
      y = canvas.height - point.y * canvas.height;
    } else if (CAMERA_STYLE == 'toward_user') {
      x = point.x * canvas.width;
      y = point.z * canvas.height;
    } else if (CAMERA_STYLE == 'away_user') {
      x = canvas.width - point.x * canvas.width;
      y = point.z * canvas.height;
    }
    return [x, y];
  }
  if(COORDINATE_SYS == 'xz'){
    if (CAMERA_STYLE == 'up') {
      x = point.x * canvas.width;
      z = point.z * canvas.height;
    } else if (CAMERA_STYLE == 'toward_user') {
      x = point.x * canvas.width;
      z = point.y * canvas.height;
    } else if (CAMERA_STYLE == 'away_user') {
      x = canvas.width - point.x * canvas.width;
      z = point.y * canvas.height;
    }
    return [x, z];
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearCanvas(context) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

async function drawHand(handObj, x, y) {
  let handPoints = [];
  getPoints(handObj, handPoints);
  for (let point of Object.values(handPoints)) {
    normalPoint = normalizePoint(point);
    drawSquare(normalPoint[0], normalPoint[1], 10, getColor(handObj.obj_id));
  }
}

function getPoints(obj, points) {
  if (!(obj.x == undefined)) {
    points.push(obj);
  } else {
    for (let value of Object.values(obj)) {
      if (typeof (value) == 'object') {
        getPoints(value, points);
      }
    }
  }
}

async function drawSquare(x, y, size, color = 'black') {
  if (canvas.getContext) {
    let ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = color;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
}

async function drawCircle(x, y, size, color = 'red', fill= false, alpha = 1) {
  if (canvas.getContext) {
    let ctx = canvas.getContext('2d');
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    if(size<=0){
      size=1;
    }
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    if(fill){
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }
}

async function drawLine(xInit, yInit,xFinal,yFinal, color = 'black') {
    if (canvas.getContext) {
      let ctx = canvas.getContext('2d');
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.moveTo(xInit,yInit);
      ctx.lineTo(xFinal,yFinal);
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }
async function drawTriangle(xInit, yInit,xFinal,yFinal, color = 'black'){
  let size = 30;
  let len = distanceTwoPoints([xInit, yInit],[xFinal, yFinal]);
  let diffX= (xFinal - xInit)/len;
  let diffY = (yFinal - yInit)/len;
  let hip = diffY/diffX;
  let pointFirst = [];
  let pointSecond = [];
  let pointThird = [];
  
  pointFirst[0] = xFinal + (size*diffX);
  pointFirst[1] = yFinal + (size*diffY);
  pointSecond[0] = xFinal - size*diffY/2;
  pointSecond[1] = yFinal + size*diffX/2;
  pointThird[0] = xFinal + size*diffY/2;
  pointThird[1] = yFinal - size*diffX/2;
  if (canvas.getContext) {
    let ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.moveTo(xFinal,yFinal);
    ctx.lineTo(pointFirst[0],pointFirst[1]);
    ctx.lineTo(pointSecond[0],pointSecond[1]);
    ctx.lineTo(pointThird[0],pointThird[1]);
    ctx.lineTo(pointFirst[0],pointFirst[1]);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

  }
  // console.log("len is: ",len);
  // console.log("triangle head at: ",pointFirst);
}

function getExtendedFingers(hand) {
  let extendedFingers = [];
  for (let [finger, data] of Object.entries(hand.data.fingers)) {
    if (data.is_extended) {
      extendedFingers.push(finger);
    }
  }
  return extendedFingers;
}

function getPinchStrengthAndDrawIt(hand) {
  let pinchStrength = hand.data.pinch.pinch_strength;
  let indexFinger = hand.data.fingers.index;
  let normalIndex = normalizePoint(indexFinger);
  let side = hand.desc;
  //console.log("pinch strength is: ", pinchStrength);
  if (pinchStrength > minPinchStrength) {
    //console.log("pinch_pos: ", normalIndex);
    // if(side == 'right' && currentAction == 'pinchOneRight'){
    //   drawCircle(Math.round(normalIndex[0]), Math.round(normalIndex[1]), 50 * pinchStrength, 'blue');
    // }
    if(side == 'left' && currentAction == 'pinchOneLeft'){
      drawCircle(Math.round(normalIndex[0]), Math.round(normalIndex[1]), 50 * pinchStrength, 'blue');
    }
  }
  return pinchStrength;
}

function handleRotation(hand){
    let palmPos = hand.data.palm;
    let normalPalm = normalizePoint(palmPos);
    let midPoints = midPointFingers(hand);
    //let currentPosition = [Math.round(normalPalm[0]),Math.round(normalPalm[1])];
    let currentPosition = [Math.round(midPoints[0]),Math.round(midPoints[1])];
    if(hand.desc == 'right'){
      //console.log("handleRotationRIGHT",[draggingRight,dragging,dragLock]);
      if((draggingRight == true && dragging == true) && dragLock==hand.desc){
        drawTriangle(initialDragPointRight[0],initialDragPointRight[1],currentPosition[0],currentPosition[1]);
        drawLine(initialDragPointRight[0],initialDragPointRight[1],currentPosition[0],currentPosition[1]);
        simulateMouseEvent(currentPosition[0], currentPosition[1], 'mousemove');
      }
    }
    if(hand.desc == 'left'){
      //console.log("handleRotationLEFT",[draggingLeft,dragging,dragLock]);
      if((draggingLeft==true && dragging==true) && dragLock==hand.desc){
        drawTriangle(initialDragPointLeft[0],initialDragPointLeft[1],currentPosition[0],currentPosition[1]);
        drawLine(initialDragPointLeft[0],initialDragPointLeft[1],currentPosition[0],currentPosition[1]);
        simulateMouseEvent(currentPosition[0], currentPosition[1], 'mousemove');
      }
    }


}

function handlePinch(hands){
    let handLength = hands.length;
    if (handLength == 1){
        saveEpicenter = true;
        let indexFinger = hands[0].data.fingers.index;
        let normalIndex = normalizePoint(indexFinger);
        // if(hands[0].desc == 'right'){
        //   if(getPinchStrength(hands[0])>minPinchStrength && pinchRight==false && currentAction.length == 0){
        //       pinchRight = true;
        //       currentAction = 'pinchOneRight';
        //       actionLock = true;
        //       initialPinchRight = [Math.round(normalIndex[0]),Math.round(normalIndex[1])];
        //       //console.log("initial pinch point right: ",initialPinchRight);
        //   }
        // }
        if(hands[0].desc == 'left'){
            if(getPinchStrengthAndDrawIt(hands[0])>minPinchStrength && pinchLeft==false && currentAction.length == 0){
                pinchLeft = true;
                currentAction = 'pinchOneLeft';
                actionLock = true;
                initialPinchLeft = [Math.round(normalIndex[0]),Math.round(normalIndex[1])];
                //console.log("initial pinch point left: ",initialPinchLeft);
            }
        }
    }
    if (handLength == 2  && currentAction.length == 0) {
        currentAction = 'pinchBoth';
        actionLock = true;
        saveEpicenter = false;
        if(hands[0].desc == 'left'){ //switch hands so hands[0] is right hand
            let auxHand = hands[0];
            hands[0]=hands[1];
            hands[1]=auxHand;
        }

        let indexFinger1 = hands[0].data.fingers.index;
        let normalIndex1 = normalizePoint(indexFinger1);
        if(getPinchStrengthAndDrawIt(hands[0])>minPinchStrength && pinchRight==false){
            pinchRight = true;
            initialPinchRight = [Math.round(normalIndex1[0]),Math.round(normalIndex1[1])];
        }


        let indexFinger2 = hands[1].data.fingers.index;
        let normalIndex2 = normalizePoint(indexFinger2);
        if(getPinchStrengthAndDrawIt(hands[1])>minPinchStrength && pinchLeft==false){
            pinchLeft = true;
            initialPinchLeft = [Math.round(normalIndex2[0]),Math.round(normalIndex2[1])];
        }


        if(pinchLeft && pinchRight && firstPinch){
          initialPinchRight = [Math.round(normalIndex1[0]),Math.round(normalIndex1[1])];
          initialPinchLeft = [Math.round(normalIndex2[0]),Math.round(normalIndex2[1])];
        }
    }
}

function handlePinchRelease(hands){
    let handLength = hands.length;
    if (handLength == 1){
      if(hands[0].desc == 'right'){
        if(getPinchStrengthAndDrawIt(hands[0])<=minPinchStrength && pinchRight==true  && currentAction == 'pinchOneRight'){
          currentAction = '';
          actionLock = false;
          pinchRight = false;
          saveEpicenter = false;
          initialPinchRight = [];
          currentPinchRight = [];
          //console.log("pinch released (right)");
        }
      }
      else{
        if(getPinchStrengthAndDrawIt(hands[0])<=minPinchStrength && pinchLeft==true  && currentAction == 'pinchOneLeft'){
          currentAction = '';
          actionLock = false;
          pinchLeft = false;
          saveEpicenter = false;
          initialPinchLeft = [];
          currentPinchLeft = [];
          //console.log("pinch released (left)");
        }
      }
    }
    if (handLength == 2 && currentAction == 'pinchBoth') {
        if(hands[0].desc == 'left'){ //switch hands so hands[0] is right hand
            let auxHand = hands[0];
            hands[0]=hands[1];
            hands[1]=auxHand;
        }
        if(getPinchStrengthAndDrawIt(hands[0])<=minPinchStrength && pinchRight==true){
            pinchRight = false;
            initialPinchRight = [];
            currentPinchRight = [];
            //console.log("pinch released (right)");
        }    
        if(getPinchStrengthAndDrawIt(hands[1])<=minPinchStrength && pinchLeft==true){
            pinchLeft = false;
            initialPinchLeft = [];
            currentPinchLeft = [];
            //console.log("pinch released (left)");
        }
        if(pinchLeft == false || pinchRight == false){
          firstPinch = true;
          currentAction = '';
          actionLock = false;
        }
    }
    if(pinchLeft == false || pinchRight == false){
      firstPinch = true;
    }
}

function handleZoom(hands){
    let handLength = hands.length;
    if (handLength == 1){
      let indexFinger = hands[0].data.fingers.index;
      let normalIndex = normalizePoint(indexFinger);
      let currentPosition = [normalIndex[0],normalIndex[1]];
      if(hands[0].desc == 'right'){
        if(pinchRight == true && hands[0].obj_id == handIdRight){
          //drawLine(initialPinchRight[0],initialPinchRight[1],currentPosition[0],currentPosition[1]);
          // epicenter(currentPosition);
        }
      }
      else{
        if(pinchLeft == true && hands[0].obj_id == handIdLeft){
          //drawLine(initialPinchLeft[0],initialPinchLeft[1],currentPosition[0],currentPosition[1]);
          epicenter(currentPosition);
        }
      }
    }
    if (handLength == 2){
      if(hands[0].desc == 'left'){ //switch hands so hands[0] is right hand
        let auxHand = hands[0];
        hands[0]=hands[1];
        hands[1]=auxHand;
      }
      let indexFingerRight = hands[0].data.fingers.index;
      let normalIndexRight = normalizePoint(indexFingerRight);
      let indexFingerLeft = hands[1].data.fingers.index;
      let normalIndexLeft = normalizePoint(indexFingerLeft);
      if(pinchLeft==true && pinchRight == true){
        if(firstPinch == true){
          firstPinch = false;
        }
        else{
          currentPinchRight[0] = normalIndexRight[0];
          currentPinchRight[1] = normalIndexRight[1];
          currentPinchLeft[0] = normalIndexLeft[0];
          currentPinchLeft[1] = normalIndexLeft[1];
          let midPoint = middlePoint(currentPinchLeft,currentPinchRight);
          console.log("Middle point is: ",midPoint);

          drawMagnitudeControl(midPoint);

          setEarthquakeMagnitudeFromRadius(differenceDoublePinch()/2+100);

          simulation.texture.needsUpdate = true;

          
          //drawLine(currentPinchLeft[0],currentPinchLeft[1],currentPinchRight[0],currentPinchRight[1],'green');
        }
      }
    }
}

function drawMagnitudeControl(midPoint){
  drawCircle(midPoint[0], midPoint[1], 100, color = 'green',true,0.35);
  drawCircle(midPoint[0], midPoint[1], 5, color = 'black',true);
  drawCircle(midPoint[0], midPoint[1], (100 + differenceDoublePinch()/2), color = 'orange');
  drawCircle(Math.round(currentPinchRight[0]), Math.round(currentPinchRight[1]), 50 , 'blue');
  drawCircle(Math.round(currentPinchLeft[0]), Math.round(currentPinchLeft[1]), 50 , 'blue');
}
function distanceTwoPoints(firstPoint,secondPoint){
  let diffX = firstPoint[0] - secondPoint[0];
  let diffY = firstPoint[1] - secondPoint[1];
  let distance =  Math.sqrt((Math.pow(diffX,2))+(Math.pow(diffY,2)));
  return distance;
}
function differencePoints(initial,current){
  return current - initial;
}

function differenceDoublePinch(){
  let initialDistance = distanceTwoPoints(initialPinchRight,initialPinchLeft);
  let currentDistance = distanceTwoPoints(currentPinchLeft,currentPinchRight);
  let difference = differencePoints(initialDistance,currentDistance);
  return difference;
}

function middlePoint(firstPoint,secondPoint){
  let middlePoint = [(firstPoint[0] + secondPoint[0])/2,(firstPoint[1] + secondPoint[1])/2];
  //let midX = (firstPoint[0] + secondPoint[0])/2;
  //let midY = (firstPoint[1] + secondPoint[1])/2;
  return middlePoint;
}

function midPointFingers(hand){
  let palmPos = hand.data.palm;
  let fingers= hand.data.fingers;
  let sumX = 0;
  let sumY = 0;
  let normalFingers = [];
  let normalPalm = [];
  let center = [];
  for (let finger of Object.values(fingers)){
    normalFingers = normalizePoint(finger);
    sumX = sumX + normalFingers[0];
    sumY = sumY + normalFingers[1];
  }
  normalPalm = normalizePoint(palmPos);
  sumX = sumX + normalPalm[0];
  sumY = sumY + normalPalm[1];

  center = [(sumX/6),(sumY/6)];
  return center;
}


function epicenter(position){
  let coordEpicenter = [];
  if(saveEpicenter){
    coordEpicenter = position; 
    lastEpicenter = coordEpicenter;
    let epicenterGeoCoords = convertUICanvasToGeographicalCoordinates(lastEpicenter[0], lastEpicenter[1]);
    
    if(epicenterGeoCoords){
      if(epicenterLocationTimeout){
        clearTimeout(epicenterLocationTimeout);
      }
      
      epicenterLocationTimeout = setSimulationEpicenter(epicenterGeoCoords)
    }
  }
  else{
    coordEpicenter = lastEpicenter;
  }
  console.log("coordinate epicenter: ",coordEpicenter);
  console.log("last epicenter: ",lastEpicenter);
  return coordEpicenter;
}

function updateEpicenter(){
  if(lastEpicenter.length>0){
    drawCircle(lastEpicenter[0], lastEpicenter[1], 10, color = 'white', fill= true);
  }
}

function releaseHand(hands){//to release vars when a hand leaves the scene
  let handLength = hands.length;
  if (handLength == 1){
    if(hands[0].desc == 'right'){
      releaseLeft();    //release everything left hand
    }
    if(hands[0].desc == 'left'){
      releaseRight();   //release everything right hand
    }
  }
  if(handLength==2){
    releaseBoth(hands);  //release everything both hands
  }
}

function releaseLeft(){
  pinchLeft = false;
  currentPinchLeft = [];
  initialPinchLeft = [];
  firstPinch = true;
  draggingLeft = false;
  initialDragPointLeft = [];
  if(currentAction == 'pinchOneLeft' || currentAction == 'grabOneLeft'){
    currentAction = '';
    actionLock = false;
  }
}

function releaseRight(){
  pinchRight = false;
  currentPinchRight = [];
  initialPinchRight = [];
  firstPinch = true;
  draggingRight = false;
  initialDragPointRight = [];
  if(currentAction == 'pinchOneRight' || currentAction == 'grabOneRight'){
    currentAction = '';
    actionLock = false;
  }
}
function releaseBoth(hands){
  if(hands.length==1 && currentAction == 'pinchBoth'){
    currentAction = '';
    actionLock = false;
  }
}


function handIdSet(hand){
  if(hand.desc == 'right'){
    handIdRight = hand.obj_id;
  }
  if(hand.desc == 'left'){
    handIdLeft = hand.obj_id;
  }
  console.log("hands: ",handIdRight,handIdLeft);
}

let url = "ws://localhost:8765";
let ws = new WebSocket(url);

ws.onopen = function (event) {
  console.log('open');
  resetCoordinates();
};
ws.onmessage = function (event) {

  let serverData = JSON.parse(event.data);
  // console.log("serverdata is: ",serverData);
  if (serverData.obj_name == 'ratio') {
    console.log('ratio found');
    setCanvasSize(serverData);
  }


  if (serverData.obj_name == 'frame') {
    let points = [];
    //console.log(serverData);

    ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1.0;
    clearCanvas(ctx);
    resetCoordinates();
    resetPinch();
    resetGrab();
    resetDiffPinch();

    for (let hand of Object.values(serverData.hand_list)) {
      //console.log(getExtendedFingers(hand));
      handIdSet(hand);
      drawHand(hand);
      updateCoordinates(hand);
      updatePinch(hand);
      updateGrab(hand);
      getPinchStrengthAndDrawIt(hand);
      // getGrabStrength(hand);
      if(serverData.hand_list.length==1){
        handleGrab(hand);
        handleReleaseGrab(hand);
        handleRotation(hand);
      }
    }
    updateDoublePinch();
    handlePinch(serverData.hand_list);
    handlePinchRelease(serverData.hand_list);
    handleZoom(serverData.hand_list);
    /*
    console.log("init pinch right: ", initialPinchRight);
    console.log("init pinch left: ", initialPinchLeft);
    console.log("is dragging: ",dragging);
    console.log("dragging sides: ",draggingRight,draggingLeft)
    console.log("init drag pos: ",initialDragPoint);
    console.log("draglock is: ",dragLock);
    */
    releaseHand(serverData.hand_list);
    // updateEpicenter();
    //console.log("Current Action is: ",currentAction);
    //console.log("Action Lock is: ",actionLock);
  }

};
canvas.onmousedown = ev =>{
  // console.log('mousedown', ev.clientX, ev.clientY);
};
canvas.onmousemove = (ev)=>{
  if(draggingLeft || draggingRight){

    // console.log('mousemove', ev.clientX, ev.clientY);
    return;
  }

  clearCanvas(canvas.getContext('2d'));

  const rect = canvas.getBoundingClientRect();
  const [canvasX, canvasY] = [rect.left, rect.top];

  let x = ev.clientX - canvasX;
  let y = ev.clientY - canvasY;

  drawCircle(x, y, 10);

};

canvas.onmouseout = (ev) =>{
  clearCanvas(canvas.getContext('2d'));
}


function simulateMouseEvent(x,y,type="mousedown") {
  // adapted from https://developer.mozilla.org/es/docs/Web/API/MouseEvent
  var evt = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX:  x,
    clientY: y
  });
  var canceled = !canvas.dispatchEvent(evt);
}
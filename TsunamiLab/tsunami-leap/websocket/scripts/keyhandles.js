let fakeHand = {
    desc:'right',
    data : {
        palm: {
            x: 0.5,
            y: 0.5,
            z: 0.0
        },
        grab:{
            grab_strength: 0.5
        }
    }
}
window.onkeydown = ev =>{
    if(ev.key === "g"){
        fakeHand.data.grab.grab_strength = 0.9;
        handleGrab(fakeHand);
    }
    
    if(ev.key === "r"){
        fakeHand.data.palm = { x:0.6, y:0.4, z:0.0}
        handleGrab(fakeHand);
        handleRotation(fakeHand)
    }
};

window.onkeyup = ev =>{
    fakeHand = {
        desc:'right',
        data : {
            palm: {
                x: 0.5,
                y: 0.5,
                z: 0.0
            },
            grab:{
                grab_strength: 0.5
            }
        }
    }
    
    handleReleaseGrab(fakeHand);   
}
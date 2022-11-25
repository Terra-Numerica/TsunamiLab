

let simulationCanvas = document.getElementById('simulation');




let data = {
    bathymetry: 'assets/bathymetry.png',
    bathymetryMetadata: {
        zmin: -6709,
        zmax: 10684
    },
    earthquake: [{
        depth: 22900,
        strike: 17,
        dip: 13.0,
        rake: 108.0,
        U3: 0.0,
        cn: -36.122,   //centroid N coordinate, e
        ce: -72.898,
        Mw: 9,
        reference: 'center'
    }],
    
    
    coordinates: 'spherical',
    waveWidth: parseInt(2159/2),
    waveHeight: parseInt(960/2),
    xmin: -179.99166666666667,
    xmax: 179.67499999999998,
    ymin: -79.991666666666646,
    ymax: 79.841666666666654,
    isPeriodic: true,
    canvas: simulationCanvas,
    slab : slab,
    cfl: 0.25*1.5,
}

let output = {
    displayWidth: parseInt(2159/2),
    displayHeight: parseInt(960/2),
    stopTime: 60 * 60 * 35  ,
    displayOption: 'heights',
    loop: false,
    pause: false,
    // colormap: colormap,
};

function updateClockAndMagnitudeTexts(model){
    const hours = Math.floor(model.currentTime/60/60);
    const minutes = Math.floor((model.currentTime/60/60-hours)*60);
    const hoursText = hours<10? '0'+hours : hours;
    const minutesText = minutes < 10 ? '0' + minutes : minutes;
    
    let el = document.getElementById('clock');
    el.children[0].innerText = `${hoursText}h ${minutesText}m`;
    // console.log(model.currentTime/60/60, controller.stopTime/60/60);
    // console.log("updating clock")
    const magnitude = model.earthquake[0].Mw.toFixed(1);
    
    let mwElement = document.getElementById('magnitude');
    mwElement.children[0].innerText = `${magnitude} Mw`;
};

let lifeCycle = {
    dataWasLoaded: (model) => {
        init();
        console.log('data loaded');
    },
    modelStepDidFinish: (model, controller) => {
        if (model.discretization.stepNumber % 5 !== 0) return true;
        
        if( thismodel.model.currentTime >= 30*60*60){
            thismodel.model.earthquake = [thismodel.model.earthquake[0]];
        }
        // console.log("STEP FINISHED")
        
        simulation.texture.needsUpdate = true;

        updateClockAndMagnitudeTexts(model);
       
        
        return false;   
    }
}


let thismodel = new NAMI.app(data, output, lifeCycle);


var epicenterLocationTimeout;

function setSimulationEpicenter(epicenterGeoCoords){
    thismodel.model.earthquake = [Object.assign(
            thismodel.model.earthquake[0],
            {cn:epicenterGeoCoords[1], ce:epicenterGeoCoords[0], slip:undefined})];
    updateClockAndMagnitudeTexts(thismodel.model);
    thismodel.controller.paused = true;
    simulation.texture.needsUpdate = true;

    const lon = thismodel.model.earthquake[0].ce;
    const lat = thismodel.model.earthquake[0].cn;
    addEpicenterPin(lon,lat);

    let timeout = setTimeout(()=>{
        if(thismodel.controller.paused ){
            thismodel.controller.paused  = false;
        }
    }, 3000);
        
    return timeout;
}
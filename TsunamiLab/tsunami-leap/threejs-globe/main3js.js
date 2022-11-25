let viewer;
let videoLayer;
var videoElement = document.getElementById('videoElement');
let events = {
    'rotate': {
        pressed: false,
        initialPoint: []
    }
};
let tsunamiView;
let canvas2;
let restartTimer;
let canvas = document.createElement('canvas');
let recordVideo = true;
/* 
Model setup
*/

let cmin = -1.5;
let cmax = 1.5;
let colormap = {    
    thresholds: [0.0*(cmax-cmin) + cmin, 
                0.06666666666666667*(cmax-cmin) + cmin, 
                0.13333333333333333*(cmax-cmin) + cmin, 
                0.2*(cmax-cmin) + cmin, 
                0.26666666666666666*(cmax-cmin) + cmin, 
                0.3333333333333333*(cmax-cmin) + cmin, 
                0.4*(cmax-cmin) + cmin, 
                0.49*(cmax-cmin) + cmin, 
                0.5*(cmax-cmin) + cmin, 
                0.51*(cmax-cmin) + cmin, 
                0.6666666666666666*(cmax-cmin) + cmin, 
                0.7333333333333333*(cmax-cmin) + cmin, 
                0.8*(cmax-cmin) + cmin, 
                0.8666666666666667*(cmax-cmin) + cmin, 
                0.9333333333333333*(cmax-cmin) + cmin,
                1.0*(cmax - cmin) + cmin],
    
    rgba: [[ 0.001462,0.000466,0.013866,1],
         [ 0.046915,0.030324,0.150164,0.8 ],
         [ 0.142378,0.046242,0.308553,0.8 ],
         [ 0.258234,0.038571,0.406485,0.8 ],
         [ 0.366529,0.071579,0.431994,0.8 ],
         [ 0.472328,0.110547,0.428334, 0.9 ],
         [ 0.578304,0.148039,0.404411, 0.8 ],
         [ 0.682656,0.189501,0.360757, 0.4 ],
         [ 0.780517,0.243327,0.299523, 0 ],
         [ 0.865006,0.316822,0.226055, 0.4 ],
         [ 0.929644,0.411479,0.145367, 0.8 ],
         [ 0.970919,0.522853,0.058367, 0.9 ],
         [ 0.987622,0.64532,0.039886,0.8 ],
         [ 0.978806,0.774545,0.176037,0.8 ],
         [ 0.950018,0.903409,0.380271,0.8 ],
         [ 0.988362,0.998364,0.644924,1 ]]
}


let data = {
    bathymetry: 'bathymetry.png',
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
    canvas:canvas
}

let output = {
    displayWidth: parseInt(2159/2),
    displayHeight: parseInt(960/2),
    stopTime: 60 * 60 * 30,
    displayOption: 'heights',
    loop: false,
    colormap: colormap,
};

let niterations = 0;

var mediaRecorder, recordedBlobs = [];

let getVideo = ()=>{
    let video2 = document.getElementById('videoRecorded');
    var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    video2.src = window.URL.createObjectURL(superBuffer);
    video2.controls = true;
}

let lifeCycle = {
    dataWasLoaded: (model) => {

        document.body.appendChild(model.canvas);
        console.log("will init main3js")
        init();

        if(recordVideo){
            let stream = model.canvas.captureStream();       
            
            var options = { mimeType: 'video/webm' };
            mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.start(100);
        }
        
        function handleDataAvailable(event) {
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        }
        
        
        
    },
    modelStepDidFinish: (model, controller) => {
        if (model.discretization.stepNumber % 100 == 0) {
            console.log(model.currentTime/60/60, controller.stopTime/60/60);
        }
        niterations = niterations + 1;
        
        
        if (niterations % 10 == 0) {
            niterations = 0;
            return false;
        }
        else {
            return true;
        }
        
    },
    
    modelSimulationWillStart: (model, controller) => {
        controller.paused = true;
        
        // para salir del lock de stepnumber = 0 y paused en primera iteración
        model.discretization.stepNumber += 1;
        
        
        model.displayPColor();
        
        clearTimeout(restartTimer);
        
        restartTimer = setTimeout(() =>{
            controller.paused = false;
        }, 1000);
        
        
    },
    
    controllerSimulationDidFinish: (model, controller)=> {
        if(recordVideo){
            getVideo();
        }

        controller.downloadAllPois();
        controller.downloadArrivalTimes();
        controller.downloadMaximumHeights();
    }
}

let thismodel;



thismodel = new NAMI.app(data, output, lifeCycle);


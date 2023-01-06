var magnitudeTimeout;
function setEarthquakeMagnitudeFromRadius(radius){
    
    

    var rmax = window.innerHeight*0.6;
    const magnitude = radiusToMagnitude(radius, rmax);
    thismodel.model.earthquake = [
        Object.assign(thismodel.model.earthquake[0], {
            slip: undefined,
            Mw: magnitude
    })];

    updateClockAndMagnitudeTexts(thismodel.model);
    

    if(epicenterLocationTimeout){
        clearTimeout(epicenterLocationTimeout);
    }

    if(magnitudeTimeout){
        clearTimeout(magnitudeTimeout);
    }
    
    thismodel.controller.paused = true;

    magnitudeTimeout = setTimeout(()=>{
        if(thismodel.controller.paused ){
            thismodel.controller.paused  = false;
        }
    },2000);
}



var Mwmax = 9.6;


function magnitudeToRadius(Mw){
    /* Returns the "relative" radius of a sphere
     such that its volume equals M0 and
     r=1 implies Mw = Mwmax*/
    var M0 =  Math.pow(10.0, 1.5*(Mw-Mwmax));
    return Math.pow(M0,1/3.)*rmax;
};
  

var radiusToMagnitude = function(r,rmax){
    // inverse of magnitudeToRadius
    var M0max = Math.pow(10, 1.5*(Mwmax+6.07));
    var M0 = Math.pow(r/rmax,3)*M0max;
    var Mw = 2/3*Math.log10(M0)-6.07;
    return Mw;
}
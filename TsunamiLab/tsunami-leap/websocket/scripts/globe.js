/* 3js functoins */

var camera, scene, renderer;
var earth = {};
var simulation = {};
var spherePin;

var geometry, material, earthMesh;
var controls;

function init() {
    
    scene = new THREE.Scene();
    
	camera = new THREE.PerspectiveCamera( 70, 1, 0.01, 10 );
	camera.position.set(0, 0, 0.52);
    controls = new THREE.OrbitControls( camera );
    
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.noZoom = false;
    controls.rotateSpeed = 0.0025;
    controls.noPan = true;
    

    
    controls.update();

    earth.geometry = new THREE.SphereGeometry( 0.3, 32, 32 );
    texture = new THREE.CanvasTexture( canvas );
    // loader = new THREE.TextureLoader().load( "assets/NE2_LR_LC_SR_W.jpg",
    // loader = new THREE.TextureLoader().load( "assets/bathymetry_texture.png",
    
    loader = new THREE.TextureLoader().load( "assets/NE2_ps_flat.jpg",
    function(texture_map){
        loader = new THREE.TextureLoader().load( "assets/earthspec1k.jpg",function(texture_spec){
            earth.texture = texture_map;
            earth.material = new THREE.MeshPhongMaterial({map: texture_map,
                specularMap: texture_spec,
                specular: 0xffffff,
                shininess: 10});
            earth.mesh = new THREE.Mesh( earth.geometry, earth.material );
            scene.add( earth.mesh );    
            animate();
        });
    } );
    var ysouth = Math.PI/2 - data.ymin*Math.PI/180.0;
    var ynorth = Math.PI/2 - data.ymax*Math.PI/180.0;
    

    simulation.geometry = new THREE.SphereGeometry( 0.301, 32, 32,	0, Math.PI*2.0,	ynorth, ysouth-ynorth)
    simulation.texture = new THREE.CanvasTexture( thismodel.model.canvas );
    simulation.material = new THREE.MeshBasicMaterial({color:0xffffff, map: simulation.texture, transparent: true});
    simulation.mesh = new THREE.Mesh( simulation.geometry, simulation.material );
    scene.add( simulation.mesh );    

    console.log("init")

    var ambientLight = new THREE.AmbientLight( 0x999999 ); // soft white light
    scene.add( ambientLight );

    var pointLight = new THREE.PointLight( 0x838383);
    pointLight.position.set( 0, 0, 10000 );
    scene.add( pointLight );

    var axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );

    renderer = new THREE.WebGLRenderer( { 
        antialias: true, canvas:document.getElementById('globe') ,
        alpha: true
    } );
    renderer.setClearColor(0x000000,0);
    renderer.setSize( 0.94*window.innerHeight, 0.94*window.innerHeight);
    console.log("wil render")
    renderer.render(scene, camera);
    console.log("rendered")
}

function addEpicenterPin(lon,lat){

    if(spherePin==undefined){
        var geometry = new THREE.SphereGeometry( 0.301/60, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        spherePin = new THREE.Mesh( geometry, material );
        scene.add( spherePin );
    }


    const [x,y,z] = convertGeographicalToSceneCoordinates(lon,lat);

    spherePin.position.set(x,y,z);

}
function animate() {

    
    // if(thismodel.model.currentTime < thismodel.controller.stopTime){
    //     simulation.mesh.material.map.needsUpdate = true;
        
    // }
    controls.update();
    
    renderer.render( scene, camera );
    
    requestAnimationFrame( animate );
}

function convertGeographicalToSceneCoordinates(lon,lat){

    const theta = Math.PI/180*lon;
    const phi = Math.PI/180*lat;
    const r = 0.3;

    const x = Math.cos(phi)*Math.cos(theta)*r;
    const y = Math.sin(phi)*r;
    const z = -Math.cos(phi)*Math.sin(theta)*r;

    return [x,y,z];
}

function convertUICanvasToGeographicalCoordinates(xUI,yUI){
    /* converts coordinates from the canvas where the leap UI is drawn
    to lon,lat (geographical) normalized to [-180,180) */
    // console.log(xUI,yUI);

    
    // UI canvas to 3js canvas
    const globeCanvas = document.getElementById('globe');
    const simulationCanvas = thismodel.model.canvas;
    const uiCanvasContainer = document.getElementById('canvas-container');

    const uiRect = uiCanvasContainer.getBoundingClientRect();
    const globeRect = globeCanvas.getBoundingClientRect();
    
    let xglobe = xUI + uiRect.left - globeRect.left;
    let yglobe = yUI + uiRect.top - globeRect.top;
    // yglobe = globeCanvas.height - yglobe;

    // raycast canvas to globe
    xglobe = xglobe / globeCanvas.width  * 2 - 1;
    yglobe = -(yglobe / globeCanvas.height  * 2 - 1);
    let globePosition = new THREE.Vector2(xglobe, yglobe);
    
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( globePosition, camera );
    let intersects = raycaster.intersectObjects( [earth.mesh] );

    // globe (x,y,z) to lon, lat 

    if(intersects.length == 0) return;

    let lat = intersects[0].point.angleTo(new THREE.Vector3(0,-1,0))/Math.PI*180 - 90;

    let projection = new THREE.Vector2(intersects[0].point.x, -intersects[0].point.z);
    let lon = projection.angle()/Math.PI*180;
    lon = lon<=180 ? lon : lon-360;
    console.log(lon, lat);

    return [lon, lat];

}
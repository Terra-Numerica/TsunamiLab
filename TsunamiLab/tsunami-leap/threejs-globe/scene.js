/* 3js functoins */

var camera, scene, renderer;
var earth = {};
var simulation = {};

var geometry, material, earthMesh;
var controls;

function init() {

    console.log("scene init")
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;

    scene = new THREE.Scene();
    
    controls = new THREE.OrbitControls( camera );
    camera.position.set( 0, 0, 1 );
    controls.enableDamping = true;
    debugger;
    controls.rotateSpeed = 0.01
    controls.update();

    earth.geometry = new THREE.SphereGeometry( 0.3, 32, 32 );
    texture = new THREE.VideoTexture( videoElement );
    console.log("texture")
    loader = new THREE.TextureLoader().load( "NE2_ps_flat.jpg",function(texture){
        console.log("texture loaded")
        earth.texture = texture;

        earth.material = new THREE.MeshBasicMaterial({map: earth.texture});
        earth.mesh = new THREE.Mesh( earth.geometry, earth.material );
        scene.add( earth.mesh );    
        animate();
        
    } );
    var ysouth = Math.PI/2 - data.ymin*Math.PI/180.0;
    var ynorth = Math.PI/2 - data.ymax*Math.PI/180.0;
    

    simulation.geometry = new THREE.SphereGeometry( 0.301, 32, 32,	0, Math.PI*2.0,	ynorth, ysouth-ynorth)
    simulation.texture = new THREE.CanvasTexture( thismodel.model.canvas );
    simulation.material = new THREE.MeshBasicMaterial({color:0xffffff, map: simulation.texture, transparent: true});
    simulation.mesh = new THREE.Mesh( simulation.geometry, simulation.material );
    scene.add( simulation.mesh );    

    renderer = new THREE.WebGLRenderer( { antialias: true, canvas:document.getElementById('3jscanvas') } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    renderer.render(scene, camera);

}

function animate() {

    
    if(thismodel.model.currentTime < thismodel.controller.stopTime){
        simulation.mesh.material.map.needsUpdate = true;
        
    }
    controls.update();
    console.log("animating")
    
    renderer.render( scene, camera );
    
    requestAnimationFrame( animate );
}
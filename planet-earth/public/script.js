var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.z = 30;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var light = new THREE.AmbientLight(0xFFFFFF);
scene.add(light);

var geometry = new THREE.SphereGeometry(10, 32, 32)
var material = new THREE.MeshPhongMaterial();
material.map = new THREE.TextureLoader().load('./assets/earthmap4k.jpg');
var earthMesh = new THREE.Mesh(geometry, material);
scene.add(earthMesh)

var geometry2 = new THREE.IcosahedronGeometry(5, 1);
var material2 = new THREE.MeshPhongMaterial();
material2.map = new THREE.TextureLoader().load('./assets/candy.jpg');
var candyMesh = new THREE.Mesh(geometry2, material2); //, material
scene.add(candyMesh)


var geometry3 = new THREE.OctahedronGeometry(5, 0);
var material3 = new THREE.MeshPhongMaterial();
material3.map = new THREE.TextureLoader().load('./assets/strawberries.jpg');
var strawberryMesh = new THREE.Mesh(geometry3, material3); //, material
scene.add(strawberryMesh)

strawberryMesh.position.x = -20
earthMesh.position.c = 0;
candyMesh.position.x = 20

var orbit = new THREE.OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;

var render = function() {
    requestAnimationFrame(render);
    earthMesh.rotation.x += 0.005;
    earthMesh.rotation.y += 0.005;

    strawberryMesh.rotation.x -= 0.005;
    strawberryMesh.rotation.y -= 0.005;

    candyMesh.rotation.x -= 0.005;
    candyMesh.rotation.y -= 0.005;

    renderer.render(scene, camera);
};
render();

var imagePrefix = "./assets/";
var urls = [ 'space.jpg', 'space.jpg', 'space.jpg', 'space.jpg', 'space.jpg', 'space.jpg' ];
var skyBox = new THREE.CubeTextureLoader().setPath(imagePrefix).load(urls);
scene.background = skyBox;

var controls = new function() {
    this.textColor = 0xffae23;
    this.guiRotationX = 0.005;
    this.guiRotationY = 0.005;
}

var gui = new dat.GUI();
gui.add(controls, 'guiRotationX', 0, .2);
gui.add(controls, 'guiRotationY', 0, .2);
gui.addColor(controls, 'textColor').onChange(function (e) {
    textMesh.material.color = new THREE.Color(e);
})

earthMesh.rotation.x += controls.guiRotationX;
earthMesh.rotation.y += controls.guiRotationY;

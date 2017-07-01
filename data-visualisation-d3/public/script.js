var camera,
    scene,
    renderer;
var effect,
    controls;
var element,
    container;

var clock = new THREE.Clock();

var marginbottom = 4, chartwidth = 90, chartheight = 30; //3D units

init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer();
    element = renderer.domElement;
    container = document.getElementById('container');
    container.appendChild(element);

    // effect = new THREE.StereoEffect(renderer);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
    camera.position.set(0, 15, 50);
    scene.add(camera);

    controls = new THREE.OrbitControls(camera, element);
    controls.rotateUp(Math.PI / 4);
    controls.target.set(camera.position.x, camera.position.y + 0.1, camera.position.z - 0.1);
    controls.noZoom = true;
    controls.noPan = true;

    function setOrientationControls(e) {
        if (!e.alpha) {
            return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        element.addEventListener('click', fullscreen, false);

        window.removeEventListener('deviceorientation', setOrientationControls, true);
    }
    window.addEventListener('deviceorientation', setOrientationControls, true);

    var light = new THREE.HemisphereLight(0x478da3, 0xbea89f, 0.6);
    scene.add(light);

    var objlight = new THREE.PointLight(0xffffff, 0.7);
    objlight.position.set(0, 50, 70);
    scene.add(objlight);

    var texture = THREE.ImageUtils.loadTexture('textures/patterns/yellowchecker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(50, 50);
    texture.anisotropy = renderer.getMaxAnisotropy();

    spectexture = THREE.ImageUtils.loadTexture('textures/patterns/blacklinegrid.png');
    spectexture.wrapS = THREE.RepeatWrapping;
    spectexture.wrapT = THREE.RepeatWrapping;
    spectexture.repeat = new THREE.Vector2(50, 50);
    spectexture.anisotropy = renderer.getMaxAnisotropy();

    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 15,
        shading: THREE.FlatShading,
        map: texture,
        specularMap: spectexture
    });

    var geometry = new THREE.PlaneGeometry(1000, 1000);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);

    var title = createType({text: "U.S. Population By Age, January 2000 in millions"});
    title.position.set(-chartwidth/2, chartheight + 10, -5);
    scene.add(title);

    var xzerolabel = createType({text: "0 years old", size: 1.5});
    xzerolabel.position.set(-chartwidth/2 - 1, 2, 0);
    scene.add(xzerolabel);

    var x100label = createType({text: "100+ years old", size: 1.5});
    var xOffset = ( x100label.geometry.boundingBox.max.x -
            x100label.geometry.boundingBox.min.x );
    x100label.position.set(chartwidth/2 - xOffset, 2, 0);
    scene.add(x100label);


    var srctext = createType({text: "Sauce: U.S. Census", size: 1});
    var xOffset = 0.5 * ( x100label.geometry.boundingBox.max.x - x100label.geometry.boundingBox.min.x );
    srctext.position.set(0 - xOffset, 1, 0);
    scene.add(srctext);

    /////// START CONTENT HERE ////////

    d3.csv('data.csv', population, function(data) {
        var xscale = d3.scaleLinear().range([-chartwidth/2, chartwidth/2])
        yscale = d3.scaleLinear().range([0, chartheight]);
        /*drawing code*/
        xscale.domain([0, data.length - 1]);
        yscale.domain([0, d3.max(data, function(d){ return d.all; })]);
        var columnwidth = (chartwidth / data.length);
        columnwidth -= columnwidth * 0.1;
        var columnmaterial = new THREE.MeshPhongMaterial({
            color: "#00BFff"
        });
        data.forEach(function(d, i, a) {
            var colheight = yscale(d.all);
            var columngeo = new THREE.BoxGeometry(columnwidth, colheight, columnwidth);
            var columnmesh = new THREE.Mesh(columngeo, columnmaterial);
            columnmesh.position.set(xscale(i), colheight / 2 + marginbottom, 0);
            //Box geometry is positioned at its’ center,
            //so we need to move it up by half the height
            scene.add(columnmesh);
        });
        yscale.ticks(5).forEach(function(t, i, a){
            //Draw label
            var label = createType({text: "" + (t/1000000), size: 1.5});
            var xOffset = ( label.geometry.boundingBox.max.x - label.geometry.boundingBox.min.x );
            label.position.set(-chartwidth/2 - xOffset - 2.5, yscale(t) + marginbottom - 0.5, 0);
            scene.add(label);
            //Draw line
            var lineGeometry = new THREE.Geometry();
            var vertArray = lineGeometry.vertices;
            vertArray.push(
                new THREE.Vector3(-chartwidth/2 - 1.5, yscale(t) + marginbottom, 0),
                new THREE.Vector3(chartwidth/2, yscale(t) + marginbottom, 0)
            );
            lineGeometry.computeLineDistances();
            var lineMaterial = new THREE.LineBasicMaterial( { color: 0xaaaaaa } );
            var line = new THREE.Line( lineGeometry, lineMaterial );
            scene.add(line);
        });
    });

    function population(d) {
        d.all = +d.all;
        d.male = +d.male;
        d.female = +d.female;
        return d;
    }

}

function resize() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    // effect.setSize(width, height);
}

function update(dt) {
    resize();

    camera.updateProjectionMatrix();

    controls.update(dt);
}

function render(dt) {
    renderer.render(scene, camera);
}

function animate(t) {
    requestAnimationFrame(animate);

    update(clock.getDelta());
    render(clock.getDelta());
}

function fullscreen() {
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    }
}

function createType(options) {
    var height = options.height || 0.1,
        size = options.size || 3,
        material = new THREE.MeshFaceMaterial([
            new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.FlatShading}), // front
            new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.SmoothShading}) // side
        ]),
        text = options.text || "Test";

    var textGeo = new THREE.TextGeometry(text, {

        size: size,
        height: height,
        curveSegments: 4,

        font: "optimer",
        weight: "normal",
        style: "normal",

        bevelEnabled: false,

        material: 0,
        extrudeMaterial: 1

    });

    textGeo.computeBoundingBox();

    var textMesh1 = new THREE.Mesh(textGeo, material);

    return textMesh1;
}

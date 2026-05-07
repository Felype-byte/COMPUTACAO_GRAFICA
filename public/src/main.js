import * as THREE from 'three';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

console.log('main.js iniciado');

// Cena
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;

// Luz
const light = new THREE.DirectionalLight(0xffffff, 2);

light.position.set(5, 5, 5);

scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Textura
const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load(
  './assets/textures/earth_daymap.jpg'
);

// Globo
const geometry = new THREE.SphereGeometry(1.5, 64, 64);

const material = new THREE.MeshStandardMaterial({
  map: texture
});

const earth = new THREE.Mesh(geometry, material);

scene.add(earth);

// Resize
window.addEventListener('resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

});

// Animate
function animate() {

  requestAnimationFrame(animate);

  earth.rotation.y += 0.002;

  controls.update();

  renderer.render(scene, camera);

}

animate();
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

// Lua
const moonGeometry = new THREE.SphereGeometry(0.2, 64, 64);
const moonMaterial = new THREE.MeshStandardMaterial({
  color: 0xccccdd,
  roughness: 0.8,
  metalness: 0.05
});

const moonTexture = textureLoader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg');
moonMaterial.map = moonTexture;

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

let moonAngle = 0;
const orbitRadius = 2.8;
const moonSpeed = 0.01;

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
  
  //Fazendo a lua girar
  moonAngle += moonSpeed;

  if (moonAngle > Math.PI * 2) moonAngle -= Math.PI * 2;
  moon.position.x = Math.cos(moonAngle) * orbitRadius;
  moon.position.z = Math.sin(moonAngle) * orbitRadius;
  moon.rotation.y += 0.005;

}

animate();

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;

// Luz
// const light = new THREE.DirectionalLight(0xffffff, 2);
// light.position.set(5, 5, 5);
// scene.add(light);

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
earth.castShadow = true;
earth.receiveShadow = true;

scene.add(earth);

// Marcadores de continente
const continentMarkers = [];
const continentDefinitions = [
  { name: 'América do Norte', lat: 40, lon: -100 },
  { name: 'América do Sul', lat: -15, lon: -60 },
  { name: 'Europa', lat: 50, lon: 10 },
  { name: 'África', lat: 0, lon: 20 },
  { name: 'Ásia', lat: 40, lon: 100 },
  { name: 'Oceania', lat: -25, lon: 140 },
  { name: 'Antártica', lat: -75, lon: 0 }
];

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function createMarker(color) {
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.2
  });

  const pinGroup = new THREE.Group();

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), material);
  head.position.y = 0.16;
  pinGroup.add(head);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12), material);
  stem.position.y = 0.02;
  pinGroup.add(stem);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 12), material);
  tip.position.y = -0.11;
  tip.rotation.x = Math.PI;
  pinGroup.add(tip);

  return pinGroup;
}

for (const continent of continentDefinitions) {
  const position = latLonToVector3(continent.lat, continent.lon, 1.55);
  const marker = createMarker(0x00ffcc);
  marker.position.copy(position);
  marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize());
  marker.userData = { continent: continent.name };
  earth.add(marker);
  continentMarkers.push(marker);
}

// Sol
const sunGeometry = new THREE.SphereGeometry(2.0, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  emissive: 0xffff00,
  emissiveIntensity: 1.0
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(120, 0, 0); // Posiciona o sol mais distante no fundo
scene.add(sun);

// Luz direcional do sol
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.copy(sun.position).normalize(); // Direção da luz vindo do sol
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
scene.add(sunLight);

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
moon.castShadow = true;
moon.receiveShadow = true;
scene.add(moon);

let moonAngle = 0;
const orbitRadius = 2.8;
const moonSpeed = 0.01;
const earthRotationSpeed = 0.002;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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

// Controles do usuário
const checkIluminacao = document.getElementById('checkIluminacao');
const checkSombra = document.getElementById('checkSombra');
const statusContinent = document.getElementById('statusContinent');
const statusCondition = document.getElementById('statusCondition');

function updateStatus(continent, condition) {
  statusContinent.textContent = continent;
  statusCondition.textContent = condition;
}

function getIlluminationCondition(point) {
  if (!sunLight.visible) {
    return 'Não tem iluminação';
  }

  const normal = point.clone().normalize();
  const sunDirection = sunLight.position.clone().normalize().negate();
  const dot = normal.dot(sunDirection);
  const dayThreshold = Math.cos(70 * Math.PI / 180);
  const nightThreshold = Math.cos(110 * Math.PI / 180);

  if (dot >= dayThreshold) {
    return 'Noite';
  }

  if (dot <= nightThreshold) {
    return 'Dia';
  }

  const derivative = sunDirection.dot(new THREE.Vector3(normal.z, 0, -normal.x).multiplyScalar(earthRotationSpeed));
  return derivative >= 0 ? 'Anoitecendo' : 'Amanhecendo';
}

// Controlar iluminação do sol
checkIluminacao.addEventListener('change', (e) => {
  sunLight.visible = e.target.checked;
  console.log('Iluminação do sol:', e.target.checked ? 'ativada' : 'desativada');
});

// Controlar sombra
checkSombra.addEventListener('change', (e) => {
  sunLight.castShadow = e.target.checked;
  earth.receiveShadow = e.target.checked;
  moon.castShadow = e.target.checked;
  moon.receiveShadow = e.target.checked;
  console.log('Sombra:', e.target.checked ? 'ativada' : 'desativada');
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(continentMarkers, true);

  if (intersects.length > 0) {
    let marker = intersects[0].object;
    while (marker && !marker.userData.continent) {
      marker = marker.parent;
    }

    const continent = marker?.userData?.continent || 'Desconhecido';
    const condition = getIlluminationCondition(intersects[0].point);
    updateStatus(continent, condition);
  }
});

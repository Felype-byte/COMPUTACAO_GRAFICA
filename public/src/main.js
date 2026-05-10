// src/main.js

import * as THREE from 'three';

import { OrbitControls }
from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

//Adicionar modelo .glb
import { GLTFLoader }
from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

import { createUI }
from './ui/controls.js';

import {
  updateEarthRotation,
  getObserverTime
}
from './astronomy/time.js';

import {
  isMoonVisible
}
from './astronomy/visibility.js';

import {
  getObserverMoonPhase
}
from './astronomy/moonPhase.js';

import {
  createObserver,
  setupObserverControls
}
from './astronomy/observer.js';

// =====================================================
// Cena
// =====================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// =====================================================
// Camera
// =====================================================

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 3, 6);

// =====================================================
// Renderer
// =====================================================

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// =====================================================
// Controles
// =====================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// =====================================================
// Sol
// =====================================================

const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
sunLight.position.set(10, 0, 0);
sunLight.castShadow = true;

const d = 6.5;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.radius = 2;
sunLight.shadow.bias = -0.0005;

scene.add(sunLight);
scene.add(sunLight.target);

// =====================================================
// Luz ambiente
// =====================================================

const ambient = new THREE.AmbientLight(0xffffff, 0.03);
scene.add(ambient);

// =====================================================
// Luz hemisférica
// =====================================================

const hemi = new THREE.HemisphereLight(0x8899ff, 0x222222, 0.04);
scene.add(hemi);

// =====================================================
// Texturas
// =====================================================

const textureLoader = new THREE.TextureLoader();

//referente ao .glb
const gltfLoader = new GLTFLoader();

const earthTexture = textureLoader.load('./assets/textures/earth_daymap.jpg');
const moonTexture = textureLoader.load('./assets/textures/moon_map.jpg');

// =====================================================
// Terra
// =====================================================

const earthGeo = new THREE.SphereGeometry(1.5, 64, 64);

const earthMat = new THREE.MeshStandardMaterial({
  map: earthTexture,
  roughness: 1.0,
  metalness: 0.0
});

const earth = new THREE.Mesh(earthGeo, earthMat);
earth.receiveShadow = true;

// Inclinação axial
earth.rotation.z = 23.5 * (Math.PI / 180);

scene.add(earth);

// =====================================================
// Observador
// =====================================================

const observer = createObserver(earth);

// =====================================================
// Controle do observador
// =====================================================

setupObserverControls(observer, earth, camera, renderer);

// =====================================================
// Lua
// =====================================================

const moonGeo = new THREE.SphereGeometry(0.4, 64, 64);

const moonMat = new THREE.MeshStandardMaterial({
  map: moonTexture,
  roughness: 0.8,
  metalness: 0.0
});

const moon = new THREE.Mesh(moonGeo, moonMat);
moon.castShadow = true;
moon.receiveShadow = true;

scene.add(moon);

// =====================================================
// Satelite no modelo (.glb)
// =====================================================

gltfLoader.load(

  './assets/models/satelite.glb',

  (gltf) => {

    const satelite = gltf.scene;

    // Escala 
    satelite.scale.set(0.009, 0.009, 0.009);

    // Posição 
    satelite.position.set(0.5, 0.5, 2);

    // Sombras
    satelite.traverse((child) => {

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });
    // Satelite gira junto com a Terra
    earth.add(satelite);

  },

)

// =====================================================
// Sol aponta para Terra
// =====================================================

sunLight.target = earth;

// =====================================================
// HUD
// =====================================================

let faseEl = document.getElementById('fase');

if (!faseEl) {
  const el = document.createElement('div');
  el.id = 'fase';

  Object.assign(el.style, {
    position: 'absolute',
    top: '10px',
    left: '10px',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    background: 'rgba(0,0,0,0.35)',
    padding: '8px 12px',
    borderRadius: '6px',
    zIndex: 10,
    whiteSpace: 'pre-line'
  });

  document.body.appendChild(el);
  faseEl = el;
}

// =====================================================
// Simulação
// =====================================================

const simulation = {
  moonAngle: 0,
  moonSpeed: 0.00017,
  paused: false,
  orbitRadius: 6.0,
  earthRotationSpeed: 0.005,

  // Para desligar o sol e as sombras
  sunEnabled: true,
  shadowsEnabled: true
};

// =====================================================
// UI
// =====================================================

createUI(simulation, sunLight, renderer, earth, moon);

// =====================================================
// Resize
// =====================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================================================
// Animate
// =====================================================

function animate() {
  requestAnimationFrame(animate);

  if (!simulation.paused) {
    simulation.moonAngle += simulation.moonSpeed;
    updateEarthRotation(earth, simulation);
  }

  // Órbita da Lua
  moon.position.x = Math.cos(simulation.moonAngle) * simulation.orbitRadius;
  moon.position.z = Math.sin(simulation.moonAngle) * simulation.orbitRadius;

  // Travamento de maré
  moon.lookAt(earth.position);
  moon.rotateY(Math.PI);

  // Dados lunares
  const moonData = getObserverMoonPhase(observer, moon, sunLight);

  // Lua visível?
  const moonVisible = isMoonVisible(observer, moon);

  // Horário astronômico
  const observerTime = getObserverTime(observer, earth, sunLight);

  // HUD atualizado (sem horário, latitude e longitude)
  faseEl.innerText =
`
Período:
${observerTime.period}

Lua:
${moonVisible ? 'Visível' : 'Abaixo do horizonte'}
`;

  if (moonVisible) {
    faseEl.innerText += `

Fase:
${moonData.phaseName}

Iluminação:
${(moonData.illumination * 100).toFixed(1)}%
`;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// =====================================================
// Export
// =====================================================

export {
  simulation,
  moon
};

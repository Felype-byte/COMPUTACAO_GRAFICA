// src/main.js

import * as THREE from 'three';

import { OrbitControls }
from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader }
from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

import { EffectComposer }
from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';

import { RenderPass }
from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';

import { UnrealBloomPass }
from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

import { createUI }
from './ui/controls.js';

import { createAtmosphere }
from './atmosphere.js';

import { createSun }
from './sun.js';

import { createStarField } 
from './stars.js'; 

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

scene.background =
new THREE.Color(0x000000);

// =====================================================
// Céu estrelado (Agora importado do stars.js)
// =====================================================

const stars = createStarField();
scene.add(stars);

// =====================================================
// Cameras
// =====================================================

const camera =
new THREE.PerspectiveCamera(

  75,

  window.innerWidth /
  window.innerHeight,

  0.1,

  1000

);

camera.position.set(0, 3, 6);

// Câmera do Ponto de Vista do Observador (POV)
const observerCamera = 
new THREE.PerspectiveCamera(
  45, // Campo de visão natural humano
  1, 
  0.01, 
  5000
);
const observerWorldPosition = new THREE.Vector3(); 
const earthCenter = new THREE.Vector3(); // Para calcular a gravidade/normal

// =====================================================
// Renderer
// =====================================================

const renderer =
new THREE.WebGLRenderer({

  antialias: true

});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  window.devicePixelRatio || 1
);

renderer.outputColorSpace =
THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
THREE.PCFSoftShadowMap;

document.body.appendChild(
  renderer.domElement
);

// =====================================================
// Pós-processamento
// =====================================================

const composer =
new EffectComposer(renderer);

const renderPass =
new RenderPass(scene, camera);

composer.addPass(renderPass);

const bloomPass =
new UnrealBloomPass(

  new THREE.Vector2(
    window.innerWidth,
    window.innerHeight
  ),

  1.2,
  0.4,
  0.85

);

composer.addPass(bloomPass);

// =====================================================
// Controles
// =====================================================

const controls =
new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;

// =====================================================
// Sol
// =====================================================

const {
  sunLight,
  updateSun
} = createSun(scene);

// =====================================================
// Luz ambiente
// =====================================================

const ambient =
new THREE.AmbientLight(
  0xffffff,
  0.05
);

scene.add(ambient);

// =====================================================
// Luz hemisférica
// =====================================================

const hemi =
new THREE.HemisphereLight(
  0x8899ff,
  0x222222,
  0.08
);

scene.add(hemi);

// =====================================================
// Texturas
// =====================================================

const textureLoader =
new THREE.TextureLoader();

const gltfLoader =
new GLTFLoader();

const earthTexture =
textureLoader.load(
  './assets/textures/earth_daymap.jpg'
);

const moonTexture =
textureLoader.load(
  './assets/textures/moon_map.jpg'
);

// =====================================================
// Terra
// =====================================================

const earthGeo =
new THREE.SphereGeometry(
  1.5,
  64,
  64
);

const earthMat =
new THREE.MeshStandardMaterial({

  map: earthTexture,

  roughness: 1.0,

  metalness: 0.0

});

const earth =
new THREE.Mesh(
  earthGeo,
  earthMat
);

earth.receiveShadow = true;

earth.rotation.z =
23.5 * (Math.PI / 180);

scene.add(earth);

// =====================================================
// Atmosfera
// =====================================================

const atmosphere =
createAtmosphere(earth);

// =====================================================
// Observador
// =====================================================

const observer =
createObserver(earth);

setupObserverControls(
  observer,
  earth,
  camera,
  renderer
);

// =====================================================
// Lua
// =====================================================

const moonGeo =
new THREE.SphereGeometry(
  0.4,
  64,
  64
);

const moonMat =
new THREE.MeshStandardMaterial({

  map: moonTexture,

  roughness: 0.8,

  metalness: 0.0

});

const moon =
new THREE.Mesh(
  moonGeo,
  moonMat
);

moon.castShadow = true;

moon.receiveShadow = true;

scene.add(moon);

// =====================================================
// Satélites
// =====================================================

const satellites = [];

function createSatelliteOrbit(
  satellite,
  radius,
  speed,
  offsetY = 0
) {

  return {

    mesh: satellite,

    angle:
    Math.random() *
    Math.PI * 2,

    radius,

    speed,

    offsetY

  };

}

gltfLoader.load(

  './assets/models/satelite.glb',

  (gltf) => {

    const satellite1 =
    gltf.scene.clone();

    satellite1.scale.set(
      0.006,
      0.006,
      0.006
    );

    satellite1.traverse((child) => {

      if (child.isMesh) {

        child.castShadow = false;
        child.receiveShadow = false;

      }

    });

    scene.add(satellite1);

    satellites.push(

      createSatelliteOrbit(
        satellite1,
        2.1,
        0.01,
        0.75
      )

    );

    const satellite2 =
    gltf.scene.clone();

    satellite2.scale.set(
      0.005,
      0.005,
      0.005
    );

    satellite2.traverse((child) => {

      if (child.isMesh) {

        child.castShadow = false;
        child.receiveShadow = false;

      }

    });

    scene.add(satellite2);

    satellites.push(

      createSatelliteOrbit(
        satellite2,
        2.3,
        0.007,
        -0.35
      )

    );

  }

);

// =====================================================
// Sol aponta para Terra
// =====================================================

sunLight.target = earth;

// =====================================================
// HUD E MOLDURA DA CÂMERA
// =====================================================

// HUD principal
let faseEl =
document.getElementById('fase');

if (!faseEl) {

  const el =
  document.createElement('div');

  el.id = 'fase';

  Object.assign(el.style, {

    position: 'absolute',

    top: '10px',

    left: '10px',

    color: 'white',

    fontFamily:
    'Arial',

    background:
    'rgba(0,0,0,0.35)',

    padding: '8px 12px',

    borderRadius: '6px',

    zIndex: 10,

    whiteSpace: 'pre-line'

  });

  document.body.appendChild(el);

  faseEl = el;

}

// Moldura do Picture-in-Picture
let pipFrame = document.getElementById('pip-frame');

if (!pipFrame) {
  pipFrame = document.createElement('div');
  pipFrame.id = 'pip-frame';
  
  Object.assign(pipFrame.style, {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    width: '250px',
    height: '250px',
    border: '3px solid #4488ff',
    borderRadius: '12px',
    boxShadow: '0 0 15px rgba(68, 136, 255, 0.4), inset 0 0 20px rgba(0,0,0,0.8)',
    pointerEvents: 'none',
    zIndex: 10,
    boxSizing: 'border-box',
    overflow: 'hidden'
  });

  pipFrame.innerHTML = `
    <div style="
      background: rgba(68, 136, 255, 0.8); 
      color: white; 
      font-family: Arial, sans-serif; 
      font-size: 11px; 
      font-weight: bold;
      padding: 4px 8px; 
      display: inline-block;
      border-bottom-right-radius: 8px;
    ">Visão do Observador</div>
  `;

  document.body.appendChild(pipFrame);
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

  sunEnabled: true,

  shadowsEnabled: true

};

// =====================================================
// UI
// =====================================================

createUI(
  simulation,
  sunLight,
  ambient, 
  renderer,
  earth,
  moon
);

// =====================================================
// Resize
// =====================================================

window.addEventListener(
  'resize',
  () => {

    camera.aspect =
    window.innerWidth /
    window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    composer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);

// =====================================================
// Animate
// =====================================================

function animate() {

  requestAnimationFrame(animate);

  const time = Date.now();

  // APLICAÇÃO DA PAUSA UNIVERSAL
  if (!simulation.paused) {

    // 1. Terra
    updateEarthRotation(
      earth,
      simulation
    );

    // 2. Órbita da Lua
    simulation.moonAngle += simulation.moonSpeed;

    moon.position.x = Math.cos(simulation.moonAngle) * simulation.orbitRadius;
    moon.position.z = Math.sin(simulation.moonAngle) * simulation.orbitRadius;

    moon.lookAt(earth.position);
    moon.rotateY(Math.PI);

    // 3. Satélites
    satellites.forEach((satellite) => {
      satellite.angle += satellite.speed;

      satellite.mesh.position.x = Math.cos(satellite.angle) * satellite.radius;
      satellite.mesh.position.z = Math.sin(satellite.angle) * satellite.radius;
      satellite.mesh.position.y = satellite.offsetY;

      satellite.mesh.lookAt(earth.position);
    });

    // 4. Atmosfera / Nuvens
    if (atmosphere && atmosphere.updateClouds) {
        atmosphere.updateClouds();
    }

    // 5. Cintilação e rotação do Espaço (Novo do stars.js)
    if (stars && stars.updateStars) {
        stars.updateStars(time);
    }

  } // Fim do bloco Pausável

  // ===================================================
  // PONTO DE VISTA REAL (POV) DO OBSERVADOR
  // ===================================================
  
  if (observer && observer.isObject3D) {
      observer.getWorldPosition(observerWorldPosition);
      earth.getWorldPosition(earthCenter);
      
      const surfaceNormal = observerWorldPosition.clone().sub(earthCenter).normalize();
      
      observerCamera.position.copy(observerWorldPosition).add(surfaceNormal.clone().multiplyScalar(0.02));
      observerCamera.up.copy(surfaceNormal);
      observerCamera.lookAt(moon.position);
  }

  // ===================================================
  // Dados lunares (Atualiza sempre, mesmo pausado)
  // ===================================================

  const moonData = getObserverMoonPhase(observer, moon, sunLight);
  const moonVisible = isMoonVisible(observer, moon);
  const observerTime = getObserverTime(observer, earth, sunLight);

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

  // ===================================================
  // Sol e Controles
  // ===================================================

  updateSun(camera);
  controls.update();

  // ===================================================
  // Renderização Pipeline (Principal + POV)
  // ===================================================

  composer.render();

  renderer.clearDepth(); 
  renderer.setScissorTest(true);

  const pipSize = 250;
  const paddingX = window.innerWidth - pipSize - 20; 
  const paddingY = 20;

  renderer.setScissor(paddingX, paddingY, pipSize, pipSize);
  renderer.setViewport(paddingX, paddingY, pipSize, pipSize);

  renderer.setClearColor(0x020205); 
  renderer.clear(true, true, true); 

  renderer.render(scene, observerCamera);

  renderer.setScissorTest(false);
  renderer.setClearColor(0x000000); 
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

}

animate();

export {
  simulation,
  moon
};
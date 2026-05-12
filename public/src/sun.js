// src/sun.js

import * as THREE from 'three';

export function createSun(scene) {

  // ===================================================
  // Luz do Sol (Branca, intensa e sem atenuação atmosférica)
  // ===================================================

  const sunLight = new THREE.DirectionalLight(
    0xffffff,
    3.0 // Aumentei levemente a intensidade para simular o vácuo
  );

  sunLight.position.set(120, 15, -40);
  sunLight.castShadow = true;

  scene.add(sunLight);

  // ===================================================
  // Grupo do Sol
  // ===================================================

  const sunGroup = new THREE.Group();
  scene.add(sunGroup);
  sunGroup.position.copy(sunLight.position);

  // ===================================================
  // Textura radial procedural (Stark White Core)
  // ===================================================

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    256, 256, 0,
    256, 256, 256
  );

  // Núcleo denso e branco (a estrela em si)
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.05, 'rgba(255, 255, 255, 0.95)');
  
  // Fim abrupto da estrela, início do flare óptico da lente
  gradient.addColorStop(0.08, 'rgba(220, 230, 255, 0.3)'); 
  
  // Brilho difuso da lente (glow muito mais suave que na atmosfera)
  gradient.addColorStop(0.3, 'rgba(150, 180, 255, 0.05)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const sunTexture = new THREE.CanvasTexture(canvas);

  // ===================================================
  // Sprite principal do Sol (Núcleo)
  // ===================================================

  const sunMaterial = new THREE.SpriteMaterial({
    map: sunTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const sunSprite = new THREE.Sprite(sunMaterial);
  // Tamanho reduzido para parecer mais distante e definido
  sunSprite.scale.set(40, 40, 1); 
  sunGroup.add(sunSprite);

  // ===================================================
  // Flare Anamórfico (Efeito de câmera espacial / Streak horizontal)
  // ===================================================

  const streakMaterial = new THREE.SpriteMaterial({
    map: sunTexture,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const streak = new THREE.Sprite(streakMaterial);
  // Esticamos muito no eixo X e esmagamos no Y
  streak.scale.set(150, 2, 1); 
  sunGroup.add(streak);

  // ===================================================
  // Optical Glow Geral (Substitui o Halo e o Flare redondo)
  // ===================================================

  const glowMaterial = new THREE.SpriteMaterial({
    map: sunTexture,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const opticalGlow = new THREE.Sprite(glowMaterial);
  opticalGlow.scale.set(80, 80, 1);
  sunGroup.add(opticalGlow);

  // ===================================================
  // Atualização
  // ===================================================

  function updateSun() {
    // THREE.Sprite já olha para a câmera automaticamente!
    // Não precisamos chamar lookAt aqui, o que economiza processamento.
    
    // Se quiser adicionar rotação ao streak/flare com base no movimento da câmera, 
    // a lógica entraria aqui.
  }

  return {
    sunLight,
    updateSun
  };
}
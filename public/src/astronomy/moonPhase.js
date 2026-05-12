// src/astronomy/moonPhase.js

import * as THREE from 'three';

// =====================================================
// Calcula fase da Lua do ponto de vista do observador
// =====================================================

export function getObserverMoonPhase(
  observer,
  moon,
  sunLight
) {

  // =====================================================
  // Posição do observador
  // =====================================================

  const observerWorld = new THREE.Vector3();
  observer.getWorldPosition(observerWorld);

  // =====================================================
  // Vetor Lua -> Sol
  // =====================================================

  const moonToSun = sunLight.position
    .clone()
    .sub(moon.position)
    .normalize();

  // =====================================================
  // Vetor Lua -> Observador
  // =====================================================

  const moonToObserver = observerWorld
    .clone()
    .sub(moon.position)
    .normalize();

  // =====================================================
  // Ângulo de fase e Iluminação
  // =====================================================

  const phaseAngle = moonToSun.angleTo(moonToObserver);
  const illumination = (1 + Math.cos(phaseAngle)) / 2;

  // =====================================================
  // Crescente ou Minguante? (Sincronizado com controls.js)
  // =====================================================
  // Compara a posição angular da Lua em relação à posição do Sol no plano XZ.
  
  const sunAngle = Math.atan2(sunLight.position.z, sunLight.position.x);
  const moonAngle = Math.atan2(moon.position.z, moon.position.x);

  // Calcula a diferença de ângulo e normaliza para o intervalo entre 0 e 2π (360º)
  let angleDiff = moonAngle - sunAngle;
  while (angleDiff < 0) {
      angleDiff += Math.PI * 2;
  }
  angleDiff = angleDiff % (Math.PI * 2);

  // Se a diferença for maior que π (180º), a Lua já cruzou a metade da órbita
  // ou seja, já passou da Lua Cheia e está caminhando de volta para a Lua Nova.
  const isWaning = angleDiff > Math.PI;

  // =====================================================
  // Nome da fase
  // =====================================================

  let phaseName = '';

  if (illumination < 0.05) {
    phaseName = 'Lua Nova';
  } 
  else if (illumination > 0.95) {
    phaseName = 'Lua Cheia';
  } 
  else if (illumination >= 0.45 && illumination <= 0.55) {
    phaseName = isWaning ? 'Quarto Minguante' : 'Quarto Crescente';
  } 
  else if (illumination < 0.5) {
    phaseName = isWaning ? 'Minguante Côncava' : 'Crescente Côncava';
  } 
  else {
    phaseName = isWaning ? 'Gibosa Minguante' : 'Gibosa Crescente';
  }

  // =====================================================
  // Resultado
  // =====================================================

  return {
    illumination,
    phaseName,
    phaseAngle
  };
}
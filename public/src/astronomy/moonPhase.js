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
  // Crescente ou Minguante?
  // Baseado no plano orbital (XZ) onde o Sol está em +X.
  // Se Z > 0, está indo da Lua Nova para Cheia (Crescente).
  // Se Z < 0, está indo da Lua Cheia para Nova (Minguante).
  // =====================================================

  const isWaning = moon.position.z < 0;

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
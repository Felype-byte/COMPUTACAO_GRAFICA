// src/astronomy/visibility.js

import * as THREE from 'three';

// =====================================================
// Verifica se a Lua está visível
// =====================================================

export function isMoonVisible(
  observer,
  moon
) {

  // posição do observador no mundo

  const observerWorld =
    new THREE.Vector3();

  observer.getWorldPosition(
    observerWorld
  );

  // normal da superfície da Terra

  const surfaceNormal =
    observerWorld.clone()
    .normalize();

  // direção observador -> Lua

  const directionToMoon =
    moon.position.clone()
    .sub(observerWorld)
    .normalize();

  // produto escalar

  const dot =
    surfaceNormal.dot(
      directionToMoon
    );

  // acima do horizonte?

  return dot > 0;
}
// src/astronomy/time.js

import * as THREE from 'three';

import {
  vector3ToLatLon
}
from './coordinates.js';

// =====================================================
// Rotação da Terra
// =====================================================

export function updateEarthRotation(
  earth,
  simulation
) {

  earth.rotation.y +=
    simulation.earthRotationSpeed;
}

// =====================================================
// Intensidade solar
// =====================================================

function getSolarIntensity(
  observer,
  sunLight
) {

  const observerWorld =
    new THREE.Vector3();

  observer.getWorldPosition(
    observerWorld
  );

  // normal da superfície

  const surfaceNormal =
    observerWorld
      .clone()
      .normalize();

  // direção do Sol

  const toSun =
    sunLight.position
      .clone()
      .sub(observerWorld)
      .normalize();

  // dot product

  return surfaceNormal.dot(
    toSun
  );
}

// =====================================================
// Horário solar real
// =====================================================

export function getObserverTime(
  observer,
  earth,
  sunLight
) {

  const observerWorld =
    new THREE.Vector3();

  observer.getWorldPosition(
    observerWorld
  );

  // =====================================================
  // Coordenadas
  // =====================================================

  const coords =
    vector3ToLatLon(
      observerWorld
    );

  // =====================================================
  // Vetor observador
  // =====================================================

  const observerDir =
    observerWorld
      .clone()
      .normalize();

  // =====================================================
  // Vetor Sol
  // =====================================================

  const sunDir =
    sunLight.position
      .clone()
      .normalize();

  // =====================================================
  // Ângulo Sol ↔ observador
  // =====================================================

  const angle =
    Math.atan2(
      observerDir.z,
      observerDir.x
    )
    -
    Math.atan2(
      sunDir.z,
      sunDir.x
    );

  // normaliza

  let normalizedAngle =
    angle;

  while (normalizedAngle < 0) {
    normalizedAngle +=
      Math.PI * 2;
  }

  while (
    normalizedAngle >
    Math.PI * 2
  ) {
    normalizedAngle -=
      Math.PI * 2;
  }

  // =====================================================
  // Hora solar
  // =====================================================

  let localHours =
    (
      normalizedAngle /
      (Math.PI * 2)
    ) * 24;

  // ajusta:
  // Sol na frente = 12h

  localHours =
    (localHours + 12) % 24;

  // =====================================================
  // Horas/minutos
  // =====================================================

  const h =
    Math.floor(localHours);

  const m =
    Math.floor(
      (localHours - h) * 60
    );

  // =====================================================
  // Intensidade solar REAL
  // =====================================================

  const lightIntensity =
    getSolarIntensity(
      observer,
      sunLight
    );

  // =====================================================
  // Dia/noite
  // =====================================================

  const period =
    lightIntensity > 0
      ? 'Dia'
      : 'Noite';

  return {

    hour:
      h.toString()
      .padStart(2, '0'),

    minute:
      m.toString()
      .padStart(2, '0'),

    period,

    lightIntensity,

    latitude:
      coords.latitude,

    longitude:
      coords.longitude
  };
}
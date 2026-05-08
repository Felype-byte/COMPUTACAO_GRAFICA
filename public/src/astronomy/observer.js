// src/astronomy/observer.js

import * as THREE from 'three';

import {
  latLonToVector3
}
from './coordinates.js';

// =====================================================
// Cria observador
// =====================================================

export function createObserver(
  earth
) {

  const observerGeo =
    new THREE.SphereGeometry(
      0.05,
      16,
      16
    );

  const observerMat =
    new THREE.MeshBasicMaterial({
      color: 0xff0000
    });

  const observer =
    new THREE.Mesh(
      observerGeo,
      observerMat
    );

  // Brasil inicial

  observer.position.copy(

    latLonToVector3(
      -15.79,
      -47.88,
      1.52
    )
  );

  earth.add(observer);

  return observer;
}

// =====================================================
// Controle de clique na Terra
// =====================================================

export function setupObserverControls(
  observer,
  earth,
  camera,
  renderer
) {

  const raycaster =
    new THREE.Raycaster();

  const mouse =
    new THREE.Vector2();

  window.addEventListener(
    'click',
    (event) => {

      mouse.x =
        (event.clientX /
        window.innerWidth) * 2 - 1;

      mouse.y =
        -(event.clientY /
        window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(
        mouse,
        camera
      );

      const intersects =
        raycaster.intersectObject(
          earth
        );

      if (intersects.length > 0) {

        const point =
          intersects[0]
          .point
          .clone();

        earth.worldToLocal(point);

        point
          .normalize()
          .multiplyScalar(1.52);

        observer.position.copy(
          point
        );
      }
    }
  );
}
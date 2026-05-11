// src/ui/controls.js
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

export function createUI(simulation, sunLight, renderer,nearth, moon) {
  const gui = new GUI();

  // Controle de velocidade
  gui.add(simulation, 'moonSpeed', 0.001, 0.05).name('Velocidade da órbita');

  // Botão de pausa
  gui.add(simulation, 'paused').name('Pausar/Retomar');

  // Botões para fases específicas
  const phases = {
    'Lua Nova': 0,
    'Quarto Crescente': Math.PI / 2,
    'Lua Cheia': Math.PI,
    'Quarto Minguante': 3 * Math.PI / 2
  };

     // Botões para desligar sol e sombras
  gui.add(simulation, 'sunEnabled')
  .name('Sol')
  .onChange((value) => {

    sunLight.visible = value;

  });

gui.add(simulation, 'shadowsEnabled')
  .name('Sombras')
  .onChange((value) => {

    renderer.shadowMap.enabled = value;

    sunLight.castShadow = value;

    earth.receiveShadow = value;

    moon.castShadow = value;
    moon.receiveShadow = value;

  });

  Object.entries(phases).forEach(([label, angle]) => {
    gui.add({ go: () => { simulation.moonAngle = angle; } }, 'go').name(label);
  });

  return gui;
}

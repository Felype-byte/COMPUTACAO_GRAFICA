// src/ui/controls.js
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

export function createUI(simulation) {
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

  Object.entries(phases).forEach(([label, angle]) => {
    gui.add({ go: () => { simulation.moonAngle = angle; } }, 'go').name(label);
  });

  return gui;
}

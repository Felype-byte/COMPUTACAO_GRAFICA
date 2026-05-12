// src/ui/controls.js
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

export function createUI(simulation, sunLight, ambientLight, renderer, earth, moon) {
  const gui = new GUI({ title: 'Painel de Controle' });

  // ==========================================
  // TEMPO E MOVIMENTO
  // ==========================================
  const timeFolder = gui.addFolder('Tempo e Movimento');

  // Botão de pausa universal
  timeFolder.add(simulation, 'paused').name('Pausar Simulação');

  // Aceleradores independentes
  timeFolder.add(simulation, 'moonSpeed', 0.0001, 0.05).name('Velocidade da Lua');
  timeFolder.add(simulation, 'earthRotationSpeed', 0.001, 0.05).name('Velocidade da Terra');

  // ==========================================
  // ILUMINAÇÃO E VISUAL
  // ==========================================
  const lightFolder = gui.addFolder('Iluminação e Visual');

  // Alternar luz principal do Sol
  lightFolder.add(simulation, 'sunEnabled')
    .name('Luz do Sol (Direcional)')
    .onChange((value) => {
      sunLight.visible = value;
    });

  // Modo "3D Base" (Sem escuridão)
  const visualState = { base3D: false };
  lightFolder.add(visualState, 'base3D')
    .name('Modo 3D Base (Sem Escuridão)')
    .onChange((value) => {
      if (value) {
        // Preenche o mundo inteiro de luz branca para remover a escuridão do espaço
        ambientLight.intensity = 2.0; 
        ambientLight.color.setHex(0xffffff);
      } else {
        // Restaura a escuridão do espaço (valores originais do seu projeto)
        ambientLight.intensity = 0.05; 
      }
    });

  // ==========================================
  // NAVEGAÇÃO ESPACIAL (Sincronizada com o HUD)
  // ==========================================
  const phasesFolder = gui.addFolder('Saltar para Fase');
  
  // 1. Descobre o ângulo exato de onde a luz do Sol está vindo
  const sunAngle = Math.atan2(sunLight.position.z, sunLight.position.x);

  // 2. Define as fases com base na posição do Sol, não no eixo zero absoluto
  const phases = {
    'Lua Nova': sunAngle,
    'Quarto Crescente': sunAngle + (Math.PI / 2),
    'Lua Cheia': sunAngle + Math.PI,
    'Quarto Minguante': sunAngle + (3 * Math.PI / 2)
  };

  Object.entries(phases).forEach(([label, angle]) => {
    phasesFolder.add({ 
      go: () => { 
        // Atualiza a variável global da simulação
        simulation.moonAngle = angle; 
        
        // Se a simulação estiver pausada, forçamos a atualização da posição da lua
        // na hora do clique para que o modelo 3D e o HUD atualizem instantaneamente.
        if (simulation.paused) {
           moon.position.x = Math.cos(angle) * simulation.orbitRadius;
           moon.position.z = Math.sin(angle) * simulation.orbitRadius;
           moon.lookAt(earth.position);
           moon.rotateY(Math.PI);
        }
      } 
    }, 'go').name(label);
  });

  return gui;
}
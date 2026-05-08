// src/utils/phase.js
export function getMoonPhase(angle) {
  // Normaliza o ângulo entre 0 e 2π
  const normalized = angle % (2 * Math.PI);

  if (normalized < Math.PI / 8 || normalized > (15 * Math.PI) / 8) {
    return 'Lua Nova';
  } else if (normalized >= Math.PI / 8 && normalized < (3 * Math.PI) / 8) {
    return 'Crescente Inicial';
  } else if (normalized >= (3 * Math.PI) / 8 && normalized < (5 * Math.PI) / 8) {
    return 'Quarto Crescente';
  } else if (normalized >= (5 * Math.PI) / 8 && normalized < (7 * Math.PI) / 8) {
    return 'Crescente Gibosa';
  } else if (normalized >= (7 * Math.PI) / 8 && normalized < (9 * Math.PI) / 8) {
    return 'Lua Cheia';
  } else if (normalized >= (9 * Math.PI) / 8 && normalized < (11 * Math.PI) / 8) {
    return 'Minguante Gibosa';
  } else if (normalized >= (11 * Math.PI) / 8 && normalized < (13 * Math.PI) / 8) {
    return 'Quarto Minguante';
  } else {
    return 'Minguante Final';
  }
}

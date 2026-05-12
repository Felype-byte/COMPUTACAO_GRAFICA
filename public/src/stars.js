// src/stars.js
import * as THREE from 'three';

export function createStarField() {
  const group = new THREE.Group();
  
  // =====================================================
  // 1. ESTRELAS COM FÍSICA REALISTA (SHADER CUSTOMIZADO)
  // =====================================================
  const starCount = 20000; // Podemos usar muitas estrelas graças à otimização da GPU
  const starGeometry = new THREE.BufferGeometry();
  
  const positions = [];
  const colors = [];
  const sizes = [];
  const phases = [];       // Momento único de cintilação
  const twinkleSpeeds = []; // Velocidade da cintilação (estrelas menores piscam mais rápido)

  for (let i = 0; i < starCount; i++) {
    const radius = 450 + Math.random() * 80; 
    
    // Distribuição Galáctica Orgânica
    let phi;
    if (Math.random() > 0.45) {
        // Faixa da Via Láctea: Curva Gaussiana concentra estrelas suavemente no equador
        const gaussianOffset = (Math.random() + Math.random() + Math.random() - 1.5) * 0.4;
        phi = (Math.PI / 2) + gaussianOffset; 
    } else {
        // Fundo do universo
        phi = Math.acos((Math.random() * 2) - 1);
    }
    
    const theta = Math.random() * Math.PI * 2;

    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );

    // =====================================================
    // CLASSIFICAÇÃO ESTELAR (Hertzsprung-Russell)
    // =====================================================
    const randClass = Math.random();
    let starColor = new THREE.Color();
    let sizeMultiplier = 1.0;

    if (randClass < 0.03) { 
        // 3% Gigantes Azuis (Muito grandes, muito quentes)
        starColor.setHex(0x9bb2ff);
        sizeMultiplier = 2.8;
    } else if (randClass < 0.15) { 
        // 12% Estrelas Brancas (Grandes)
        starColor.setHex(0xffffff);
        sizeMultiplier = 1.8;
    } else if (randClass < 0.45) { 
        // 30% Estrelas Amarelas (Tipo o nosso Sol, tamanho médio)
        starColor.setHex(0xfff4ea);
        sizeMultiplier = 1.2;
    } else { 
        // 55% Anãs Vermelhas/Laranjas (Pequenas, frias e muito comuns)
        starColor.setHex(0xffaa88);
        sizeMultiplier = 0.6;
    }

    colors.push(starColor.r, starColor.g, starColor.b);

    // Magnitude: Escala exponencial para garantir muitas estrelas minúsculas e poucas enormes
    const baseSize = Math.pow(Math.random(), 4.0) * 2.0 + 0.2; 
    const finalSize = baseSize * sizeMultiplier;
    sizes.push(finalSize);

    // Dinâmica da luz
    phases.push(Math.random() * Math.PI * 2);
    // Estrelas menores sofrem mais distorção (piscam mais rápido)
    twinkleSpeeds.push(0.001 + (1.0 / finalSize) * 0.002);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  starGeometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
  starGeometry.setAttribute('twinkleSpeed', new THREE.Float32BufferAttribute(twinkleSpeeds, 1));

  const starUniforms = {
    uTime: { value: 0 }
  };

  const starMaterial = new THREE.ShaderMaterial({
    uniforms: starUniforms,
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      attribute float phase;
      attribute float twinkleSpeed;
      
      varying vec3 vColor;
      uniform float uTime;
      
      void main() {
        vColor = color;
        
        // Cintilação com velocidade variável baseada no tamanho da estrela
        float twinkle = 0.6 + 0.4 * sin(uTime * twinkleSpeed + phase);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * twinkle * (500.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float dist = length(xy);
        
        if (dist > 0.5) discard; // Arredonda a estrela
        
        // EFEITO CORE-GLOW: O centro é super-exposto (branco), a cor real fica na borda
        float coreIntensity = 1.0 - (dist * 2.0); // 1 no centro, 0 na borda
        coreIntensity = pow(coreIntensity, 2.5);  // Deixa o centro branco mais concentrado
        
        vec3 finalColor = mix(vColor, vec3(1.0), coreIntensity);
        
        // Suavização das bordas para mesclar com o espaço
        float alpha = smoothstep(0.5, 0.0, dist);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  group.add(stars);

  // =====================================================
  // 2. DISCO DE POEIRA GALÁCTICA ORGÂNICO
  // =====================================================
  
  // Criamos uma textura de fumaça procedural com Canvas HTML5 para não depender de imagens externas
  function createNebulaTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(canvas);
  }

  const nebulaTexture = createNebulaTexture();
  const nebulaCount = 14;

  for (let i = 0; i < nebulaCount; i++) {
    const nebulaMat = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      transparent: true,
      opacity: 0.012, // Extremamente sutil, atua como neblina
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      color: new THREE.Color().setHSL(Math.random() * 0.15 + 0.55, 0.6, 0.1) // Tons frios de azul
    });

    const nebulaGeo = new THREE.SphereGeometry(440 - i * 5, 32, 32);
    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    
    // Achata a esfera para criar um disco e varia os eixos para criar "bolsões" irregulares de gás
    nebulaMesh.scale.set(1.0 + Math.random() * 0.2, 0.15 + Math.random() * 0.1, 1.0 + Math.random() * 0.2);
    
    nebulaMesh.rotation.set(
        (Math.random() - 0.5) * 0.3, 
        Math.random() * Math.PI * 2, 
        (Math.random() - 0.5) * 0.3  
    );
    
    group.add(nebulaMesh);
  }

  // =====================================================
  // 3. MOTOR DE ANIMAÇÃO
  // =====================================================
  group.updateStars = function(time) {
    starUniforms.uTime.value = time;
    group.rotation.y += 0.00001; // Rotação da galáxia de fundo
    group.rotation.x += 0.000005; 
  };

  return group;
}
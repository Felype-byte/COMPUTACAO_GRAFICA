import * as THREE from 'three';

export function createAtmosphere(earth) {
  // =================================================
  // ATMOSFERA AZUL (Camada fina e rente)
  // =================================================
  const atmosphereGeo = new THREE.SphereGeometry(1.506, 128, 128);
  const atmosphereMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      void main() {
        float fresnel = max(0.0, 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)));
        float intensity = pow(fresnel, 5.0);
        vec3 sunDirection = normalize(vec3(120.0, 15.0, -40.0));
        float dayNight = dot(vWorldNormal, sunDirection);
        float lightMask = smoothstep(-0.1, 0.25, dayNight);
        gl_FragColor = vec4(0.2, 0.5, 1.0, intensity * lightMask * 0.75);
      }
    `
  });

  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  earth.add(atmosphere);

  // =================================================
  // HALO EXTERNO
  // =================================================
  const glowGeo = new THREE.SphereGeometry(1.54, 128, 128);
  const glowMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: atmosphereMat.vertexShader,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      void main() {
        float fresnel = max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
        float intensity = pow(fresnel, 7.0);
        vec3 sunDirection = normalize(vec3(120.0, 15.0, -40.0));
        float dayNight = dot(vWorldNormal, sunDirection);
        float lightMask = smoothstep(-0.1, 0.2, dayNight);
        gl_FragColor = vec4(0.2, 0.4, 1.0, 1.0) * intensity * lightMask * 0.4;
      }
    `
  });

  const glow = new THREE.Mesh(glowGeo, glowMat);
  earth.add(glow);

  // =================================================
  // GERAÇÃO DE TEXTURA DE NUVENS PROCEDURAL (Perlin-like)
  // =================================================
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  function generateNaturalClouds() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Criar uma estrutura de "névoa" base usando múltiplos tamanhos
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 25 + 5;
      const alpha = Math.random() * 0.08;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    // Adicionar frentes de nuvens mais densas e esticadas (ventos latitudinais)
    for (let j = 0; j < 40; j++) {
      const centerY = Math.random() * canvas.height;
      const startX = Math.random() * canvas.width;
      const length = Math.random() * 1000 + 500;

      for (let k = 0; k < 100; k++) {
        const x = (startX + Math.random() * length) % canvas.width;
        const y = centerY + (Math.random() - 0.5) * 150;
        const radius = Math.random() * 40 + 20;
        const alpha = Math.random() * 0.12;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
  }

  generateNaturalClouds();
  const cloudTexture = new THREE.CanvasTexture(canvas);
  cloudTexture.wrapS = THREE.RepeatWrapping;

  // =================================================
  // CAMADA DAS NUVENS COM SHADER CUSTOMIZADO
  // =================================================
  const cloudGeo = new THREE.SphereGeometry(1.503, 128, 128);
  
  const cloudMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTexture: { value: cloudTexture },
      uSunDirection: { value: new THREE.Vector3(120.0, 15.0, -40.0).normalize() }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      void main() {
        vUv = uv;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform vec3 uSunDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;

      void main() {
        vec4 cloudData = texture2D(uTexture, vUv);
        float cloudAlpha = cloudData.r; // Usamos o canal vermelho como densidade

        float dotNL = dot(vWorldNormal, uSunDirection);
        
        // Simula o espalhamento da luz: nuvens são brilhantes no dia e sombrias no terminador
        float lightFactor = smoothstep(-0.2, 0.4, dotNL);
        
        // No lado escuro, as nuvens devem sumir quase totalmente (apenas silhueta sutil)
        float finalAlpha = cloudAlpha * lightFactor * 0.9;

        // Cor levemente azulada nas bordas finas das nuvens
        vec3 cloudColor = mix(vec3(0.8, 0.85, 1.0), vec3(1.0), lightFactor);

        gl_FragColor = vec4(cloudColor, finalAlpha);
      }
    `
  });

  const clouds = new THREE.Mesh(cloudGeo, cloudMat);
  earth.add(clouds);

  function updateClouds() {
    clouds.rotation.y += 0.00015;
  }

  return { atmosphere, glow, clouds, updateClouds };
}
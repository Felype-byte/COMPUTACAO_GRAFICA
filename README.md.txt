GloboTerrestre3D/
│
├── public/                  # Arquivos estáticos
│   ├── index.html           # Página principal
│   ├── styles.css           # Estilos globais
│   └── assets/              # Recursos visuais
│       ├── textures/        # Texturas da Terra (dia/noite, atmosfera)
│       ├── models/          # Modelos externos (.glb/.gltf) - satélite
│       └── icons/           # Ícones do menu retrátil
│
├── src/                     # Código-fonte principal
│   ├── main.js              # Ponto de entrada (inicializa cena, câmera, render)
│   ├── scene.js             # Configuração da cena 3D
│   ├── lights.js            # Configuração da iluminação (sol + ambiente)
│   ├── globe.js             # Criação do globo, materiais e texturas
│   ├── markers.js           # Marcadores clicáveis nos continentes
│   ├── controls.js          # OrbitControls e interações de câmera
│   ├── satellite.js         # Importação e animação do satélite externo
│   ├── ui/                  # Interface gráfica (menu retrátil)
│   │   ├── menu.js          # Lógica do menu (abrir/fechar, eventos)
│   │   └── sliders.js       # Controle de velocidade, alternar dia/noite etc.
│   └── utils/               # Funções auxiliares (cálculo de posição, helpers)
│
├── package.json             # Dependências do projeto
└── README.md                # Documentação e instruções de uso

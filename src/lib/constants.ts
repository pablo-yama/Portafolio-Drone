export const EASE = {
  smooth: 'power3.out',
  smoother: 'power4.out',
  snappy: 'back.out(1.4)',
  elastic: 'elastic.out(1, 0.5)',
  cinematic: 'power2.inOut',
} as const;

export const DURATION = {
  fast: 0.4,
  normal: 0.8,
  slow: 1.2,
  cinematic: 1.8,
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const SITE_NAME = 'Pablo Aerial';

export const NAV_LINKS = [
  { label: 'Sobre Mí', href: '#about' },
  { label: 'Portafolio', href: '#work' },
  { label: 'Servicios', href: '#services' },

  { label: 'Contacto', href: '#contact' },
] as const;

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/the_pym_project', icon: 'instagram' },
  { label: 'Adobe Stock', href: 'https://stock.adobe.com/es/contributor/211067778/Pablo', icon: 'adobe' },
] as const;

export const STATS = [
  { value: 300, suffix: 'h', label: 'Horas de Vuelo' },
  { value: 10, suffix: '', label: 'Clientes' },
  { value: 10, suffix: '', label: 'Años Volando' },
  { value: 10, suffix: '+', label: 'Proyectos Realizados' },
] as const;

export const SERVICES = [
  {
    title: 'Fotografía & Video Aéreo',
    description: 'Capturo imágenes y video cinematográfico en 4K desde el aire para eventos, marcas y proyectos que necesitan una perspectiva diferente. Cada toma está compuesta para impactar.',
    slug: 'fotografia-video',
    hasVideo: false,
  },
  {
    title: 'Cobertura de Eventos',
    description: 'Deportes, conciertos, bodas y eventos corporativos capturados desde el aire. Momentos épicos que solo se ven desde las alturas.',
    slug: 'eventos',
    hasVideo: false,
  },
  {
    title: 'Inspección de Infraestructura',
    description: 'Inspección segura y eficiente de paneles solares, torres, edificios y estructuras de difícil acceso. Sin riesgo, con precisión.',
    slug: 'inspeccion',
    hasVideo: false,
  },
] as const;

/**
 * Work grid items — 2 hyperlapses + 2 photos
 * position: controls grid placement in the editorial layout
 */
export const PROJECTS = [
  {
    title: 'Hyperlapse Reforma',
    category: 'Ciudad',
    location: 'CDMX, Paseo de la Reforma',
    slug: 'hyperlapse-reforma',
    type: 'video' as const,
    video: 'videos/reforma.mov',
    image: 'reforma-amanecer.jpg',
    position: 'hero' as const,
  },
  {
    title: 'Imayina',
    category: 'Arquitectura',
    location: 'CDMX',
    slug: 'imayina',
    type: 'foto' as const,
    image: 'imayina.jpg',
    position: 'portrait-right' as const,
  },
  {
    title: 'Vista Aérea',
    category: 'Arquitectura',
    location: 'CDMX',
    slug: 'vista-aerea',
    type: 'foto' as const,
    image: 'DJI_0633.jpg',
    position: 'portrait-left' as const,
  },
  {
    title: 'Bosques Hyperlapse',
    category: 'Ciudad',
    location: 'CDMX, Bosques de las Lomas',
    slug: 'bosques-hyperlapse',
    type: 'video' as const,
    video: 'videos/bosques.mov',
    image: 'DJI_0633.jpg',
    position: 'wide' as const,
  },
] as const;

export const SERVICE_PACKAGES = [
  {
    slug: 'fotografia-video',
    title: 'Fotografía & Video Aéreo',
    subtitle: 'Perspectivas que impactan',
    description:
      'Capturo imágenes y video cinematográfico en 4K desde el aire para marcas, inmobiliarias y proyectos que necesitan una perspectiva única.',
    features: [
      'Fotografía aérea en alta resolución',
      'Video cinematográfico 4K',
      'Color grading profesional',
      'Entrega en formatos optimizados',
    ],
    tiers: [
      {
        name: 'Básico',
        price: 4500,
        currency: 'MXN',
        description: '1 ubicación, sesión de 1 hora',
        deliverables: [
          '10-15 fotos editadas en alta resolución',
          'Entrega digital en 5 días hábiles',
          'Edición y retoque básico de color',
        ],
        popular: false,
      },
      {
        name: 'Estándar',
        price: 12000,
        currency: 'MXN',
        description: '2 ubicaciones, sesión de medio día',
        deliverables: [
          '25-30 fotos editadas + retoque avanzado',
          'Video aéreo editado de 2-3 min en 4K',
          'Color grading cinematográfico',
          'Banda sonora curada',
          'Entrega en 5 días hábiles',
        ],
        popular: true,
      },
      {
        name: 'Premium',
        price: 25000,
        currency: 'MXN',
        description: 'Día completo, múltiples ubicaciones',
        deliverables: [
          '50+ fotos editadas con retoque premium',
          'Video cinematográfico de 5+ min en 4K',
          'Color grading + motion graphics',
          'Versiones para redes sociales',
          'Entrega express en 3 días hábiles',
          'Archivos RAW incluidos',
        ],
        popular: false,
      },
    ],
  },
  {
    slug: 'eventos',
    title: 'Cobertura de Eventos',
    subtitle: 'Momentos desde las alturas',
    description:
      'Deportes, conciertos, bodas y eventos corporativos capturados desde el aire. Tomas épicas que solo se ven desde arriba.',
    features: [
      'Cobertura en tiempo real',
      'Fotografía y video aéreo simultáneo',
      'Coordinación con equipo de producción',
      'Entrega rápida post-evento',
    ],
    tiers: [
      {
        name: 'Básico',
        price: 6000,
        currency: 'MXN',
        description: 'Cobertura de 2 horas',
        deliverables: [
          '15-20 fotos aéreas editadas',
          'Clip highlight de 1 min',
          'Entrega digital en 5 días',
        ],
        popular: false,
      },
      {
        name: 'Estándar',
        price: 15000,
        currency: 'MXN',
        description: 'Medio día de cobertura (4-5 hrs)',
        deliverables: [
          '40+ fotos aéreas editadas',
          'Video resumen de 3-4 min en 4K',
          'Color grading cinematográfico',
          'Clips verticales para redes sociales',
          'Entrega en 5 días hábiles',
        ],
        popular: true,
      },
      {
        name: 'Premium',
        price: 35000,
        currency: 'MXN',
        description: 'Día completo de cobertura (8+ hrs)',
        deliverables: [
          '80+ fotos editadas con retoque premium',
          'Video completo de 5-8 min en 4K',
          'Highlight reel de 60s para redes',
          'Transmisión en vivo disponible',
          'Entrega express en 3 días',
          'Archivos RAW incluidos',
        ],
        popular: false,
      },
    ],
  },
  {
    slug: 'inspeccion',
    title: 'Inspección de Infraestructura',
    subtitle: 'Precisión sin riesgo',
    description:
      'Inspección segura y eficiente de paneles solares, torres, edificios y estructuras de difícil acceso. Sin riesgo, con la máxima precisión.',
    features: [
      'Inspección visual en alta resolución',
      'Detección de anomalías',
      'Reporte técnico detallado',
      'Mapeo y documentación',
    ],
    tiers: [
      {
        name: 'Básico',
        price: 8000,
        currency: 'MXN',
        description: 'Inspección visual estándar',
        deliverables: [
          'Fotos de alta resolución de la estructura',
          'Video de inspección completo',
          'Reporte básico con hallazgos',
          'Entrega en 5 días hábiles',
        ],
        popular: false,
      },
      {
        name: 'Estándar',
        price: 18000,
        currency: 'MXN',
        description: 'Inspección detallada + reporte técnico',
        deliverables: [
          'Fotografía detallada de alta resolución',
          'Video documentación completo en 4K',
          'Reporte técnico con análisis de hallazgos',
          'Ortomosaico de la estructura',
          'Entrega en 5 días hábiles',
        ],
        popular: true,
      },
      {
        name: 'Premium',
        price: 40000,
        currency: 'MXN',
        description: 'Inspección avanzada con termografía',
        deliverables: [
          'Inspección visual + termográfica',
          'Modelo 3D de la estructura',
          'Reporte técnico ejecutivo detallado',
          'Ortomosaico con mediciones',
          'Seguimiento y comparativa temporal',
          'Entrega express en 3 días',
        ],
        popular: false,
      },
    ],
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: '¿Cómo planeas cada vuelo?',
    answer:
      'Antes de cada sesión reviso el sitio, el clima, la ventana de luz y las condiciones aéreas. Coordinamos horarios, accesos y un plan B por si el día del vuelo cambia el escenario, para que llegues con un resultado previsible en lugar de improvisar en campo.',
  },
  {
    question: '¿Qué pasa si tengo requerimientos operativos propios?',
    answer:
      'Si tu sitio, predio o evento exige protocolos adicionales (aviso a seguridad privada, coordinación con producción, ventanas específicas), los integro al plan de vuelo desde la cotización. Me adapto a tus tiempos y a las reglas que aplican a tu operación.',
  },
  {
    question: '¿Qué pasa si hay mal clima el día del vuelo?',
    answer:
      'La seguridad es prioridad. Si las condiciones climáticas no son óptimas (viento fuerte, lluvia, visibilidad reducida), reprogramamos sin costo adicional. Monitoreo el clima constantemente y te aviso con anticipación.',
  },
  {
    question: '¿Cuál es el tiempo de entrega del material?',
    answer:
      'El tiempo estándar es de 5 días hábiles para edición y entrega. Los paquetes Premium incluyen entrega express en 3 días. Si necesitas material urgente el mismo día, podemos coordinarlo con un costo adicional.',
  },
  {
    question: '¿En qué formatos entregas el material?',
    answer:
      'Fotos en JPEG de alta resolución y RAW (en paquetes Premium). Video en MP4 4K (H.265/H.264), con versiones optimizadas para redes sociales. Puedo adaptar formatos según tus necesidades específicas.',
  },
  {
    question: '¿Cuál es tu zona de cobertura?',
    answer:
      'Mi base es la Ciudad de México y zona metropolitana. Viajo a cualquier parte de la República Mexicana con un ajuste por viáticos. También he trabajado en proyectos internacionales.',
  },
  {
    question: '¿Puedes volar de noche?',
    answer:
      'Sí, realizo vuelos nocturnos cuando el proyecto lo pide: hora azul, eventos al cierre del día o tomas urbanas con luces encendidas. Estos vuelos requieren una planeación adicional y coordinación con el sitio, lo cual incluyo como parte del servicio.',
  },
  {
    question: '¿Cuánto dura una sesión de vuelo típica?',
    answer:
      'Una sesión básica es de 1-2 horas en locación. Llevo múltiples baterías para garantizar el tiempo de vuelo necesario. Sesiones de medio día o día completo disponibles según el paquete elegido.',
  },
] as const;

export const ABOUT = {
  name: 'Pablo',
  role: 'Piloto de Drones & Fotógrafo Aéreo',
  bio: [
    'Desde la primera vez que vi el mundo desde arriba, supe que esta era mi forma de contar historias. Llevo una decada pilotando drones, capturando perspectivas que revelan la belleza oculta de cada lugar.',
    'Me especializo en fotografía y video aéreo cinematográfico, hyperlapses, real estate, cobertura de eventos e inspección de infraestructura. Cada vuelo es una oportunidad para crear algo que impacte.',
  ],
} as const;

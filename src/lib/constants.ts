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
    longDescription:
      'La fotografía y el video aéreo transforman la manera en que un proyecto se comunica. ' +
      'Desde una perspectiva de 120 metros el espectador entiende la escala, el entorno y la propuesta de valor de un inmueble o marca en segundos, algo que ninguna toma en tierra puede lograr con la misma eficiencia. ' +
      'Con el DJI Mavic 3 Pro y su sensor CMOS de 4/3 con sistema óptico Hasselblad, capturo hasta 24 megapíxeles en RAW con rango dinámico de 12.8 stops, suficiente para impresión editorial de gran formato o producción audiovisual de alto nivel. ' +
      'El flujo de trabajo completo — desde la planeación del vuelo y la gestión de permisos AFAC, hasta el color grading en DaVinci Resolve con LUTs cinematográficos propios — está diseñado para que el cliente reciba archivos listos para publicar sin necesidad de postproducción adicional.',
    regulatory:
      'Todas las operaciones se realizan bajo registro AFAC vigente con seguro de responsabilidad civil. ' +
      'Para proyectos en zonas cercanas al AICM o AIFA se tramitan las autorizaciones correspondientes sin costo extra para el cliente.',
    applications: [
      'Inmobiliarias y desarrolladoras de vivienda: renders en obra y entrega final para portafolios de ventas',
      'Agencias de arquitectura y diseño: documentación de proyectos terminados para premios y publicaciones',
      'Marcas y empresas: contenido para campañas digitales, sitio web y redes sociales',
      'Productoras y agencias creativas: material B-roll cinematográfico en 4K para producciones de alto nivel',
    ],
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
    longDescription:
      'Los eventos son efímeros y las tomas aéreas los convierten en íconos. ' +
      'Cuando el dron sobrevuela una boda en Coyoacán al atardecer, una apertura corporativa en Santa Fe o un evento deportivo en el Estadio GNP de Guerrero, captura la escala humana del acontecimiento de una manera que las cámaras en tierra no pueden replicar. ' +
      'Coordino con el equipo de producción desde la preproducción: defino ventanas de vuelo que no interrumpan el programa, comunico con seguridad del recinto, y me sincronizo con el fotógrafo en tierra para que las perspectivas se complementen. ' +
      'El resultado es un set de imágenes y video que narra el evento completo — la llegada, los momentos clave, la vista panorámica del espacio lleno — listo para publicación en redes sociales, prensa y archivo corporativo.',
    regulatory:
      'Los eventos masivos en espacios públicos de CDMX requieren aviso a la Secretaría de Seguridad Ciudadana. ' +
      'Los recintos privados exigen coordinación con seguridad interna. Gestiono ambos trámites como parte del servicio.',
    applications: [
      'Bodas y eventos sociales: tomas de la llegada de invitados, ceremonia y festejo desde perspectiva cenital',
      'Eventos corporativos y lanzamientos de producto: cobertura aérea para comunicados de prensa y contenido institucional',
      'Competencias deportivas y torneos: tomas del estadio lleno, recorridos del campo y momentos clave del evento',
      'Festivales y conciertos: vistas panorámicas del espacio y la audiencia para producción documental',
    ],
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
    longDescription:
      'La inspección con drones elimina la necesidad de andamios, escaleras industriales o trabajos en altura que exponen a tu equipo a riesgos innecesarios y generan costos logísticos elevados. ' +
      'Con el Mavic 3 Pro y zoom óptico 7x puedo inspeccionar a distancia segura sin comprometer la resolución: paneles solares en azoteas de edificios corporativos, fachadas de vidrio en torres de Santa Fe, estructuras de concreto en zonas de difícil acceso o antenas en inmuebles con restricciones de acceso. ' +
      'El reporte final incluye fotografías georreferenciadas de cada hallazgo, video de inspección completo, y un PDF ejecutivo con los defectos detectados clasificados por criticidad. ' +
      'Para proyectos de seguimiento de obra, el servicio de monitoreo mensual permite generar comparativas timelapse que documentan el avance del proyecto semana a semana.',
    regulatory:
      'Las inspecciones en instalaciones industriales o cerca del AICM requieren permisos específicos. ' +
      'Tramito las autorizaciones AFAC necesarias y coordino con el responsable de seguridad de la instalación antes de cada operación.',
    applications: [
      'Desarrolladoras y constructoras: seguimiento de obra en tiempo real con comparativas mensuales para reportes a inversores',
      'Empresas de energía solar: inspección de parques fotovoltaicos para detección de paneles dañados o sucios',
      'Administradoras de inmuebles: revisión de azoteas, fachadas y sistemas de impermeabilización sin andamios',
      'Aseguradoras y peritos: documentación fotográfica y video de daños estructurales para expedientes de siniestro',
    ],
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
      'Cada vuelo empieza con un reconocimiento del sitio: reviso la ubicación en Google Maps y, cuando es posible, en persona. Analizo la ventana de luz óptima (hora dorada, hora azul o luz plana según el objetivo), consulto los pronósticos de viento y lluvia de al menos tres fuentes, y verifico restricciones de espacio aéreo en la zona. Con esa información armo un plan de vuelo con ruta, altitud máxima y puntos de interés jerarquizados. Coordinamos horarios, accesos, contactos de seguridad del edificio o evento, y siempre definimos un plan B por si el clima cambia el día de la operación. El resultado es predecible desde antes de despegar, no una improvisación en campo.',
  },
  {
    question: '¿Qué pasa si tengo requerimientos operativos propios?',
    answer:
      'Trabajo con desarrolladores inmobiliarios, productoras de cine y corporativos que tienen protocolos internos bien definidos, y me adapto a todos ellos. Si tu proyecto requiere aviso previo a seguridad privada, coordinación con un director de fotografía en tierra, ventanas horarias específicas por ruido o por contrato de locación, o transmisión en vivo del feed de la cámara al equipo de producción, todo eso va incluido en la planeación desde la cotización. No cobro extra por complejidad operativa estándar: si el requerimiento es parte del proyecto, es parte del servicio. Los protocolos extraordinarios los discutimos antes de firmar.',
  },
  {
    question: '¿Qué pasa si hay mal clima el día del vuelo?',
    answer:
      'La seguridad del vuelo y la calidad del resultado siempre son prioridad. En CDMX el clima cambia rápido, especialmente entre mayo y octubre cuando las lluvias vespertinas son frecuentes en alcaldías como Tlalpan, Xochimilco y Coyoacán. Monitoreo las condiciones con 48 horas de anticipación y te aviso si preveo que el vuelo debe moverse. Los criterios de cancelación son viento sostenido mayor a 30 km/h, lluvia activa, visibilidad reducida por neblina o presencia de tormentas eléctricas en un radio de 20 km. Las reprogramaciones por clima no tienen costo adicional y normalmente encontramos una nueva fecha en menos de 72 horas.',
  },
  {
    question: '¿Cuál es el tiempo de entrega del material?',
    answer:
      'El tiempo estándar de edición y entrega es de cinco días hábiles contados a partir del día del vuelo. Esto incluye selección de las mejores tomas, edición de color, corrección de exposición y entrega en la resolución y formato acordados. Los paquetes Premium tienen entrega express en tres días hábiles sin costo adicional. Si necesitas material mismo día para publicación inmediata en redes o cobertura de prensa, puedo entregar un set reducido de 5-10 imágenes editadas en el mismo día con un cargo adicional según el volumen. Los proyectos de video con color grading cinematográfico tienen un plazo de 7 días hábiles.',
  },
  {
    question: '¿En qué formatos entregas el material?',
    answer:
      'Las fotografías se entregan en JPEG de alta resolución a 300 DPI, listas para impresión o digital. Los paquetes Premium incluyen los archivos RAW en DNG para que tu equipo de edición tenga control total sobre el procesado final. Los videos se entregan en MP4 4K (H.265 como principal, H.264 como compatible), con versiones optimizadas para Instagram Reels, YouTube y TikTok si el proyecto lo requiere. Para proyectos de inspección o topografía, el material incluye ortomosaicos en formato TIFF georreferenciado y nube de puntos en LAS/LAZ cuando aplica. Entrego todo vía enlace de descarga seguro con vigencia de 30 días, más respaldo en la nube por un año.',
  },
  {
    question: '¿Cuál es tu zona de cobertura?',
    answer:
      'Mi base operativa es la Ciudad de México, con cobertura completa de las 16 alcaldías: desde Gustavo A. Madero al norte hasta Milpa Alta al sur, y desde Cuajimalpa al poniente hasta Iztapalapa al oriente. También trabajo regularmente en la Zona Metropolitana (Naucalpan, Tlalnepantla, Ecatepec, Texcoco). Para proyectos fuera del Valle de México, viajo a cualquier estado de la República con ajuste por viáticos que se cotiza por separado. He realizado proyectos en Morelos, Guerrero, Jalisco y Querétaro. Los vuelos internacionales se coordinan con anticipación según los reglamentos de aviación civil del país destino.',
  },
  {
    question: '¿Puedes volar de noche?',
    answer:
      'Sí, realizo vuelos nocturnos y en hora azul cuando el proyecto lo requiere. Las tomas nocturnas de la Ciudad de México son algunas de mis favoritas: el contraste entre las luces del Paseo de la Reforma, los ejes viales y las zonas residenciales produce imágenes que no tienen equivalente de día. Los vuelos nocturnos requieren planeación adicional: verificación de iluminación del espacio aéreo, coordinación con el sitio para asegurar acceso y señalización, y configuración específica del sensor para minimizar ruido digital. El Mavic 3 Pro con su CMOS de 4/3 captura excelente detalle en condiciones de baja luz. Los vuelos nocturnos tienen un suplemento que se indica en la cotización.',
  },
  {
    question: '¿Cuánto dura una sesión de vuelo típica?',
    answer:
      'Una sesión básica en una ubicación toma entre una y dos horas en locación, incluyendo el montaje del equipo, los vuelos efectivos y el desmontaje. Llevo entre seis y ocho baterías cargadas al 100%, lo que garantiza entre 45 y 60 minutos de tiempo de vuelo efectivo sin apuros. Para proyectos de medio día (2-3 ubicaciones), reservo de cuatro a cinco horas. Los proyectos de día completo o con múltiples locaciones se planifican por separado. El tiempo en locación no incluye desplazamientos entre puntos; si el proyecto implica movimiento entre colonias o alcaldías, lo contemplamos en la logística desde la cotización.',
  },
  {
    question: '¿Pablo Yamamoto tiene licencia AFAC para drones comerciales?',
    answer:
      'Sí. Opero bajo la normativa de la Agencia Federal de Aviación Civil (AFAC) vigente en México para sistemas de aeronaves pilotadas a distancia (RPAS) de uso comercial. Esto incluye el registro del equipo ante la AFAC, cobertura con seguro de responsabilidad civil para operaciones aéreas, y cumplimiento de las restricciones de espacio aéreo establecidas en el AIP México. Para operaciones en zonas de influencia del Aeropuerto Internacional Felipe Ángeles (AIFA), el Aeropuerto Internacional de la Ciudad de México (AICM) o la Base Aérea de Santa Lucía, tramito las autorizaciones correspondientes con anticipación. Puedo proporcionar copia del registro y seguro a clientes corporativos que lo requieran para sus expedientes internos.',
  },
  {
    question: '¿Qué regulaciones aplican para drones comerciales en CDMX?',
    answer:
      'En México, los drones comerciales de más de 250 gramos deben registrarse ante la AFAC y operar bajo las reglas de la Circular Obligatoria CO AV-23/10 R3. En la Ciudad de México aplican restricciones adicionales: no se permite volar sobre multitudes sin autorización, se prohíbe el vuelo sobre infraestructura crítica (plantas de energía, instalaciones militares, hospitales) y existen zonas de exclusión permanente alrededor del AICM y el NAIM con radios de 5 km y 8 km respectivamente. Para eventos masivos en el Zócalo, el Estadio Azteca o el Estadio GNP se requieren permisos específicos de la Secretaría de Seguridad Ciudadana y la AFAC. Gestiono todos estos trámites como parte del servicio sin costo extra para el cliente.',
  },
  {
    question: '¿Has tenido incidentes o accidentes en operación?',
    answer:
      'No. En más de 10 años de operación y 300+ horas de vuelo registradas en bitácora, no he tenido ningún accidente, pérdida de aeronave ni incidente con personas o infraestructura. Esto no es casualidad: cada vuelo se planifica con margen de seguridad, nunca opero con equipo sin revisar, y tengo protocolos de aborto de misión ante cualquier anomalía en vuelo. El seguro de responsabilidad civil cubre hasta un millón de pesos en caso de daños a terceros, y está vigente en toda operación comercial. Para clientes institucionales que requieren un historial de seguridad para sus procesos de contratación, puedo proporcionar una declaración de operaciones limpia.',
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

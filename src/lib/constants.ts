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
  { label: 'Showreel', href: '#showreel' },
  { label: 'Contacto', href: '#contact' },
] as const;

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/the_pym_project', icon: 'instagram' },
  { label: 'Adobe Stock', href: 'https://stock.adobe.com/es/contributor/211067778/Pablo', icon: 'adobe' },
] as const;

export const STATS = [
  { value: 2000, suffix: '+', label: 'Horas de Vuelo' },
  { value: 10, suffix: '+', label: 'Clientes Felices' },
  { value: 10, suffix: '', label: 'Años Volando' },
  { value: 20, suffix: '+', label: 'Proyectos Realizados' },
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
    video: '/videos/reforma.mov',
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
    video: '/videos/bosques.mov',
    image: 'DJI_0633.jpg',
    position: 'wide' as const,
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

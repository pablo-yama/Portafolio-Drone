const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL ?? '';

export const getMediaUrl = (path: string) =>
  BLOB_URL ? `${BLOB_URL}/${path}` : `/${path}`;

export const media = {
  images: {
    heroReforma: getMediaUrl('img/reforma-noche.jpg'),
    arcos: getMediaUrl('img/arcos.jpg'),
    padel: getMediaUrl('img/padel-1.jpg'),
    paneles: getMediaUrl('img/paneles.jpg'),
    imayina: getMediaUrl('img/imayina.jpg'),
    dji0633: getMediaUrl('img/DJI_0633.jpg'),
    pablo: getMediaUrl('img/Pablo.jpg'),
  },
  videos: {
    reforma: getMediaUrl('videos/reforma.mov'),
    bosques: getMediaUrl('videos/bosques.mov'),
    cu: getMediaUrl('videos/cu.mov'),
  },
} as const;

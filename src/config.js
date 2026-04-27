// Reads from Vite env (VITE_*) with safe placeholder defaults.
// Override via .env (see .env.example).

const env = import.meta.env;

export const config = {
  groom: {
    nameKo: env.VITE_GROOM_NAME_KO || '박지훈',
    nameEn: env.VITE_GROOM_NAME_EN || 'Jihoon',
    father: env.VITE_GROOM_FATHER || '박영수',
    mother: env.VITE_GROOM_MOTHER || '이미경',
    account: env.VITE_GROOM_ACCOUNT || '신한은행 110-123-456789 박지훈'
  },
  bride: {
    nameKo: env.VITE_BRIDE_NAME_KO || '김서연',
    nameEn: env.VITE_BRIDE_NAME_EN || 'Seoyeon',
    father: env.VITE_BRIDE_FATHER || '김상철',
    mother: env.VITE_BRIDE_MOTHER || '정혜진',
    account: env.VITE_BRIDE_ACCOUNT || '국민은행 123-45-6789-012 김서연'
  },
  wedding: {
    datetime: env.VITE_WEDDING_DATETIME || '2026-10-17T13:00:00+09:00',
    venueName: env.VITE_VENUE_NAME || '그랜드 하얏트 서울 그랜드볼룸',
    venueAddress: env.VITE_VENUE_ADDRESS || '서울특별시 용산구 소월로 322',
    lat: parseFloat(env.VITE_VENUE_LAT) || 37.541533,
    lng: parseFloat(env.VITE_VENUE_LNG) || 126.984085
  },
  keys: {
    kakaoMap: env.VITE_KAKAO_MAP_KEY || '',
    kakaoShare: env.VITE_KAKAO_SHARE_KEY || '',
    naverMap: env.VITE_NAVER_MAP_CLIENT_ID || ''
  }
};

// Demo gallery — Unsplash CC images, replace with real photos later.
export const galleryImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1606490194859-07c18c9f0968?auto=format&fit=crop&w=900&q=80'
];

export const couplePhotos = {
  groom: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  bride: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  together: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1800&q=85'
};

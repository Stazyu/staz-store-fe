export const gamesList = [
  {
    id: 'mobile-legends',
    title: 'Mobile Legends',
    image: '/images/mlbb.png',
    category: ['MOBA'],
    type: 'game',
    isPopular: true,
    description: 'Mobile Legends: Bang Bang adalah permainan MOBA yang dirancang untuk ponsel. Kedua tim lawan berjuang untuk mencapai dan menghancurkan markas musuh sambil mempertahankan markas mereka sendiri untuk mengendalikan jalan setapak.',
    topUpOptions: [
      { id: 1, diamonds: 5, price: 1000, bonus: 0 },
      { id: 2, diamonds: 12, price: 2000, bonus: 0 },
      { id: 3, diamonds: 28, price: 4000, bonus: 2 },
      { id: 4, diamonds: 36, price: 5000, bonus: 4 },
      { id: 5, diamonds: 50, price: 7000, bonus: 8 },
      { id: 6, diamonds: 70, price: 9000, bonus: 12 },
      { id: 7, diamonds: 100, price: 12000, bonus: 16 },
      { id: 8, diamonds: 150, price: 18000, bonus: 24 },
      { id: 9, diamonds: 200, price: 25000, bonus: 32 },
      { id: 10, diamonds: 250, price: 32000, bonus: 40 },
      { id: 11, diamonds: 300, price: 40000, bonus: 48 },
      { id: 12, diamonds: 350, price: 48000, bonus: 56 },
      { id: 13, diamonds: 400, price: 56000, bonus: 64 },
      { id: 14, diamonds: 450, price: 64000, bonus: 72 },
      { id: 15, diamonds: 500, price: 72000, bonus: 80 },
    ]
  },
  {
    id: 'pubg-mobile',
    title: 'PUBG Mobile',
    image: '/images/pubg.png',
    category: ['Battle Royale'],
    type: 'game',
    isPopular: true,
    description: 'PUBG MOBILE adalah game battle royale terbaik yang menampilkan pertempuran 100 pemain, mode bermain yang beragam, teman yang luar biasa, dan pembaruan yang konsisten.',
    topUpOptions: [
      { id: 1, uc: 60, price: 10000, bonus: 0, flashSale: true },
      { id: 2, uc: 325, price: 50000, bonus: 0, flashSale: false },
      { id: 3, uc: 660, price: 100000, bonus: 60, flashSale: true },
      { id: 4, uc: 1800, price: 250000, bonus: 200, flashSale: false },
      { id: 5, uc: 2500, price: 350000, bonus: 300, flashSale: false },
      { id: 6, uc: 5000, price: 500000, bonus: 500, flashSale: false },
    ]
  },
  {
    id: 'genshin-impact',
    title: 'Genshin Impact',
    image: '/images/genshin.png',
    category: ['RPG', 'Open World'],
    type: 'game',
    isPopular: false,
    description: 'Genshin Impact adalah game aksi RPG dunia terbuka di mana kamu bisa mengeksplorasi dunia fantasi Teyvat yang luas dan memikat.',
    topUpOptions: [
      { id: 1, crystals: 60, price: 15000, bonus: 0 },
      { id: 2, crystals: 300, price: 75000, bonus: 0 },
      { id: 3, crystals: 980, price: 240000, bonus: 110 },
      { id: 4, crystals: 1980, price: 480000, bonus: 260 },
      { id: 5, crystals: 3280, price: 800000, bonus: 600 },
    ]
  },
  {
    id: 'free-fire',
    title: 'Free Fire',
    image: '/images/free-fire.png',
    category: ['Battle Royale'],
    type: 'game',
    isPopular: true,
    description: 'Free Fire adalah game battle royale yang menantang di mana pemain bertarung untuk menjadi yang terakhir bertahan di medan perang yang penuh aksi.',
    topUpOptions: [
      { id: 1, diamonds: 5, price: 1000, bonus: 0 },
      { id: 2, diamonds: 53, price: 10000, bonus: 0 },
      { id: 3, diamonds: 106, price: 20000, bonus: 5 },
      { id: 4, diamonds: 270, price: 50000, bonus: 20 },
      { id: 5, diamonds: 560, price: 100000, bonus: 60 },
    ]
  },
  {
    id: 'valorant',
    title: 'Valorant',
    image: '/images/valorant.png',
    category: ['FPS'],
    type: 'game',
    isPopular: false,
    description: 'VALORANT adalah penembak taktis 5v5 berbasis karakter di mana taktik bertemu dengan bakat dalam pertempuran intensif.',
    topUpOptions: [
      { id: 1, points: 125, price: 15000, bonus: 0 },
      { id: 2, points: 420, price: 50000, bonus: 0 },
      { id: 3, points: 700, price: 80000, bonus: 50 },
      { id: 4, points: 1375, price: 150000, bonus: 125 },
      { id: 5, points: 2400, price: 250000, bonus: 300 },
    ]
  },
  {
    id: 'wuthering-waves',
    title: 'Wuthering Waves',
    image: '/images/wuthering-waves.png',
    category: ['Open World'],
    type: 'game',
    isPopular: true,
    description: 'Wuthering Waves adalah game petualangan yang menampilkan petualangan di dunia yang luas dan memikat.',
    topUpOptions: [
      { id: 1, lunites: 60, price: 10000, bonus: 0 },
      { id: 2, lunites: 300, price: 20000, bonus: 60 },
      { id: 3, lunites: 980, price: 50000, bonus: 110 },
      { id: 4, lunites: 1980, price: 100000, bonus: 260 },
      { id: 5, lunites: 3280, price: 150000, bonus: 600 },
      { id: 6, lunites: 6480, price: 250000, bonus: 1600 }
    ]
  }
];

export const voucherList = [
  {
    "id": "steam-001",
    "title": "Steam Wallet",
    "image": "/images/vouchers/steam.png",
    "category": ['Game'],
    "type": 'voucher',
    "isPopular": true,
    "description": "Top up saldo Steam Wallet untuk membeli game dan item favoritmu.",
    "topUpOptions": [
      { "amount": 50000, "price": 53000, "bonus": 0 },
      { "amount": 100000, "price": 105000, "bonus": 0 },
      { "amount": 200000, "price": 210000, "bonus": 0 }
    ]
  },
  {
    "id": "googleplay-001",
    "title": "Google Play Gift Card",
    "image": "/images/vouchers/google-play.png",
    "category": ['App'],
    "type": 'voucher',
    "isPopular": true,
    "description": "Isi saldo Google Play dan beli aplikasi, game, buku, dan lainnya.",
    "topUpOptions": [
      { "amount": 50000, "price": 52000, "bonus": 0 },
      { "amount": 100000, "price": 102000, "bonus": 0 }
    ]
  },
  {
    "id": "spotify-001",
    "title": "Spotify Premium",
    "image": "/images/vouchers/spotify.png",
    "category": ['Music'],
    "type": 'voucher',
    "isPopular": false,
    "description": "Langganan Spotify Premium untuk mendengarkan musik tanpa iklan.",
    "topUpOptions": [
      { "amount": 1, "price": 49900, "bonus": 0 },
      { "amount": 3, "price": 149000, "bonus": 0 }
    ]
  },
  {
    "id": "playstation-001",
    "title": "PlayStation Network Card",
    "image": "/images/vouchers/psn.png",
    "category": ['Game'],
    "type": 'voucher',
    "isPopular": false,
    "description": "Isi saldo PSN untuk membeli game, DLC, dan keanggotaan PS Plus.",
    "topUpOptions": [
      { "amount": 100000, "price": 105000, "bonus": 0 },
      { "amount": 250000, "price": 260000, "bonus": 0 }
    ]
  }
];

export const getGameById = (id: string) => {
  return gamesList.find(game => game.id === id);
};

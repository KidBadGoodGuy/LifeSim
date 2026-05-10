export const LIFE_STAGES = [
  { id: 'prenatal', label: 'Prenatal', min: -1, max: -1 },
  { id: 'infancy', label: 'Infancy', min: 0, max: 1 },
  { id: 'toddler', label: 'Toddler Years', min: 2, max: 4 },
  { id: 'childhood', label: 'Childhood', min: 5, max: 10 },
  { id: 'preteen', label: 'Preteen Years', min: 11, max: 12 },
  { id: 'teenage', label: 'Teenage Years', min: 13, max: 17 },
  { id: 'young_adult', label: 'Young Adulthood', min: 18, max: 29 },
  { id: 'adulthood', label: 'Adulthood', min: 30, max: 44 },
  { id: 'middle_age', label: 'Middle Age', min: 45, max: 64 },
  { id: 'elder', label: 'Elder Years', min: 65, max: 130 },
  { id: 'legacy', label: 'Legacy Continuation', min: 131, max: Infinity }
];

export const COUNTRIES = [
  { id: 'usa', name: 'United States', culture: 'individualist', economy: 86, stability: 71, healthcare: 62, inequality: 41, religions: ['Christianity', 'Judaism', 'Islam', 'Hinduism', 'Buddhism', 'Atheism'], cities: ['New York', 'Los Angeles', 'Chicago', 'Austin', 'Seattle'] },
  { id: 'japan', name: 'Japan', culture: 'collectivist', economy: 82, stability: 84, healthcare: 88, inequality: 24, religions: ['Shinto', 'Buddhism', 'Christianity', 'Atheism'], cities: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo'] },
  { id: 'brazil', name: 'Brazil', culture: 'expressive', economy: 58, stability: 52, healthcare: 55, inequality: 53, religions: ['Christianity', 'Spiritism', 'Atheism'], cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'] },
  { id: 'nigeria', name: 'Nigeria', culture: 'communal', economy: 49, stability: 46, healthcare: 39, inequality: 35, religions: ['Christianity', 'Islam', 'Traditional Faiths'], cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan'] },
  { id: 'india', name: 'India', culture: 'pluralist', economy: 67, stability: 60, healthcare: 48, inequality: 36, religions: ['Hinduism', 'Islam', 'Christianity', 'Sikhism', 'Buddhism', 'Jainism'], cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai'] }
];

export const CAREER_TRACKS = [
  { id: 'medicine', name: 'Medicine', fields: ['Nurse', 'Surgeon', 'Psychiatrist', 'Epidemiologist', 'Hospital Director'], skills: ['science', 'empathy', 'discipline'], prestige: 86, demand: 82 },
  { id: 'law', name: 'Law', fields: ['Paralegal', 'Attorney', 'Judge', 'Human Rights Counsel', 'Supreme Court Justice'], skills: ['logic', 'charisma', 'ethics'], prestige: 80, demand: 64 },
  { id: 'engineering', name: 'Engineering', fields: ['Civil Engineer', 'Robotics Engineer', 'Aerospace Engineer', 'AI Safety Architect'], skills: ['logic', 'creativity', 'discipline'], prestige: 76, demand: 88 },
  { id: 'crime', name: 'Criminal Enterprise', fields: ['Pickpocket', 'Fraudster', 'Hacker', 'Smuggler', 'Syndicate Boss'], skills: ['stealth', 'charisma', 'nerve'], prestige: 22, demand: 47 },
  { id: 'entertainment', name: 'Entertainment', fields: ['Actor', 'Musician', 'Director', 'Streamer', 'Global Icon'], skills: ['creativity', 'charisma', 'resilience'], prestige: 74, demand: 69 },
  { id: 'politics', name: 'Politics', fields: ['Organizer', 'Mayor', 'Governor', 'Diplomat', 'Head of State'], skills: ['charisma', 'strategy', 'ethics'], prestige: 89, demand: 52 },
  { id: 'space', name: 'Space Exploration', fields: ['Astronaut Candidate', 'Mission Specialist', 'Commander', 'Mars Governor'], skills: ['fitness', 'logic', 'discipline'], prestige: 94, demand: 41 },
  { id: 'trades', name: 'Skilled Trades', fields: ['Apprentice', 'Electrician', 'Master Builder', 'Union Leader'], skills: ['craft', 'discipline', 'social'], prestige: 57, demand: 77 },
  { id: 'athletics', name: 'Professional Sports', fields: ['Prospect', 'Minor League Player', 'Starter', 'All Star', 'Hall of Famer'], skills: ['fitness', 'discipline', 'charisma'], prestige: 83, demand: 50 },
  { id: 'military', name: 'Military', fields: ['Recruit', 'Officer', 'Specialist', 'Commander', 'Chief of Staff'], skills: ['fitness', 'discipline', 'strategy'], prestige: 71, demand: 58 },
  { id: 'entrepreneurship', name: 'Entrepreneurship', fields: ['Founder', 'Operator', 'Venture CEO', 'Serial Founder', 'Industry Titan'], skills: ['strategy', 'charisma', 'risk'], prestige: 78, demand: 73 },
  { id: 'academia', name: 'Science & Academia', fields: ['Research Assistant', 'Scientist', 'Professor', 'Institute Director', 'Nobel Laureate'], skills: ['logic', 'writing', 'discipline'], prestige: 81, demand: 62 }
];

export const EDUCATION_PATHS = [
  'daycare', 'preschool', 'elementary', 'middle_school', 'high_school', 'boarding_school',
  'homeschool', 'military_school', 'trade_school', 'community_college', 'university',
  'ivy_league', 'graduate_school', 'online_education', 'international_exchange'
];

export const EVENT_TAGS = [
  'family', 'school', 'career', 'health', 'crime', 'fame', 'business', 'military', 'religion',
  'politics', 'technology', 'housing', 'travel', 'sports', 'creative', 'pets', 'world'
];


export const MENU_DEFINITIONS = [
  { id: 'activities', label: 'Activities', icon: '✨', unlockAge: 3, children: ['mind-body', 'clubs', 'vacations', 'gambling', 'pets'] },
  { id: 'relationships', label: 'Relationships', icon: '💞', unlockAge: 0, children: ['family', 'friends', 'romance', 'rivals', 'mentors'] },
  { id: 'career', label: 'Career', icon: '💼', unlockAge: 14, children: ['jobs', 'coworkers', 'workplace-politics', 'retirement'] },
  { id: 'finance', label: 'Finance', icon: '🏦', unlockAge: 16, children: ['banking', 'loans', 'taxes', 'investments', 'crypto'] },
  { id: 'education', label: 'Education', icon: '🎓', unlockAge: 3, children: ['schools', 'grades', 'clubs', 'scholarships', 'student-debt'] },
  { id: 'crime', label: 'Crime', icon: '🕶️', unlockAge: 12, children: ['petty-crime', 'organized-crime', 'court', 'prison', 'rehab'] },
  { id: 'health', label: 'Health', icon: '🫀', unlockAge: 0, children: ['doctors', 'fitness', 'mental-health', 'addiction', 'medication'] },
  { id: 'fame', label: 'Fame', icon: '🌟', unlockAge: 13, children: ['publicist', 'scandals', 'fans', 'media'] },
  { id: 'assets', label: 'Assets', icon: '🏠', unlockAge: 16, children: ['real-estate', 'vehicles', 'heirlooms', 'collectibles'] },
  { id: 'travel', label: 'Travel', icon: '✈️', unlockAge: 12, children: ['vacations', 'migration', 'citizenship', 'study-abroad'] },
  { id: 'politics', label: 'Politics', icon: '🏛️', unlockAge: 18, children: ['campaigns', 'policies', 'elections', 'diplomacy'] },
  { id: 'military', label: 'Military', icon: '🎖️', unlockAge: 18, children: ['enlist', 'deployments', 'veterans', 'command'] },
  { id: 'business', label: 'Business', icon: '📈', unlockAge: 18, children: ['startup', 'hiring', 'markets', 'acquisitions'] },
  { id: 'social', label: 'Social Media', icon: '📱', unlockAge: 10, children: ['posts', 'followers', 'platforms', 'controversies'] },
  { id: 'legacy', label: 'Legacy', icon: '🧬', unlockAge: 0, children: ['lineage', 'inheritance', 'will', 'family-office'] },
  { id: 'religion', label: 'Religion', icon: '🕊️', unlockAge: 5, children: ['beliefs', 'community', 'conversion', 'pilgrimage'] },
  { id: 'creativity', label: 'Creativity', icon: '🎨', unlockAge: 4, children: ['writing', 'music', 'games', 'film'] },
  { id: 'sports', label: 'Sports', icon: '🏆', unlockAge: 5, children: ['school-sports', 'training', 'leagues', 'injuries'] },
  { id: 'settings', label: 'Settings', icon: '⚙️', unlockAge: -1, children: ['saves', 'accessibility', 'themes', 'mods', 'debug'] }
];

export const ASSET_CLASSES = [
  { id: 'stocks', label: 'Equities', risk: 67 },
  { id: 'bonds', label: 'Bonds', risk: 24 },
  { id: 'real_estate', label: 'Real Estate', risk: 45 },
  { id: 'crypto', label: 'Cryptocurrency', risk: 94 },
  { id: 'private_business', label: 'Private Business', risk: 78 }
];

export const BUSINESS_SECTORS = [
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'software', label: 'Software' },
  { id: 'media', label: 'Media' },
  { id: 'construction', label: 'Construction' },
  { id: 'food', label: 'Food & Hospitality' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'defense', label: 'Defense' },
  { id: 'space', label: 'Space Industry' }
];

export const MODDING_API = {
  version: '0.2.0',
  extensionPoints: ['eventProvider', 'careerPack', 'countryPack', 'npcBehavior', 'economyModel', 'uiMenu', 'saveAdapter'],
  contentContract: 'All packs export deterministic factories that accept { world, character, rng } and return serializable data.'
};

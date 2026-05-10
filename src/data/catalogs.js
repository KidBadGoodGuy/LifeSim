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
  { id: 'medicine', name: 'Medicine', fields: ['Nurse', 'Surgeon', 'Psychiatrist', 'Epidemiologist', 'Hospital Director'], skills: ['science', 'empathy', 'discipline'], prestige: 86 },
  { id: 'law', name: 'Law', fields: ['Paralegal', 'Attorney', 'Judge', 'Human Rights Counsel', 'Supreme Court Justice'], skills: ['logic', 'charisma', 'ethics'], prestige: 80 },
  { id: 'engineering', name: 'Engineering', fields: ['Civil Engineer', 'Robotics Engineer', 'Aerospace Engineer', 'AI Safety Architect'], skills: ['logic', 'creativity', 'discipline'], prestige: 76 },
  { id: 'crime', name: 'Criminal Enterprise', fields: ['Pickpocket', 'Fraudster', 'Hacker', 'Smuggler', 'Syndicate Boss'], skills: ['stealth', 'charisma', 'nerve'], prestige: 22 },
  { id: 'entertainment', name: 'Entertainment', fields: ['Actor', 'Musician', 'Director', 'Streamer', 'Global Icon'], skills: ['creativity', 'charisma', 'resilience'], prestige: 74 },
  { id: 'politics', name: 'Politics', fields: ['Organizer', 'Mayor', 'Governor', 'Diplomat', 'Head of State'], skills: ['charisma', 'strategy', 'ethics'], prestige: 89 },
  { id: 'space', name: 'Space Exploration', fields: ['Astronaut Candidate', 'Mission Specialist', 'Commander', 'Mars Governor'], skills: ['fitness', 'logic', 'discipline'], prestige: 94 },
  { id: 'trades', name: 'Skilled Trades', fields: ['Apprentice', 'Electrician', 'Master Builder', 'Union Leader'], skills: ['craft', 'discipline', 'social'], prestige: 57 }
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

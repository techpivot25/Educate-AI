import { CurriculumItem, DBSubject, DBTopic, EducationBoard, StudentGradeGrowth } from '../types';

export const ALL_EDUCATION_BOARDS: EducationBoard[] = [
  'CBSE',
  'ICSE',
  'IB',
  'IGCSE',
  'PSEB',
  'GSEB',
  'MSBSHSE',
  'KSEEB',
  'BSEAP/TOSS',
  'WBBSE',
  'Tamil Nadu State Board',
];

export const BOARD_LABELS: Record<EducationBoard, string> = {
  CBSE: 'CBSE (National NCERT)',
  ICSE: 'ICSE / CISCE',
  IB: 'IB (MYP & DP)',
  IGCSE: 'Cambridge IGCSE / A-Level',
  PSEB: 'PSEB (Punjab)',
  GSEB: 'GSEB (Gujarat)',
  MSBSHSE: 'MSBSHSE (Maharashtra)',
  KSEEB: 'KSEEB (Karnataka)',
  'BSEAP/TOSS': 'BSEAP / TOSS (AP & Telangana)',
  WBBSE: 'WBBSE (West Bengal)',
  'Tamil Nadu State Board': 'Tamil Nadu State Board (TNSCERT)',
};

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी' },
  { value: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { value: 'mr', label: 'Marathi', native: 'मराठी' },
  { value: 'bn', label: 'Bengali', native: 'বাংলা' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు' },
  { value: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { value: 'ml', label: 'Malayalam', native: 'മലയാളം' },
] as const;

export const BOARD_REGIONAL_LANGUAGE_NAME: Record<EducationBoard, string> = {
  CBSE: 'Regional Language (State / Heritage Elective)',
  ICSE: 'Regional Language (Second / Third Language)',
  IB: 'Regional Language (Language Acquisition)',
  IGCSE: 'Regional Language (Modern Regional)',
  PSEB: 'Regional Language (Punjabi)',
  GSEB: 'Regional Language (Gujarati)',
  MSBSHSE: 'Regional Language (Marathi)',
  KSEEB: 'Regional Language (Kannada)',
  'BSEAP/TOSS': 'Regional Language (Telugu)',
  WBBSE: 'Regional Language (Bengali)',
  'Tamil Nadu State Board': 'Regional Language (Tamil)',
};

export const getLocalizedSubjectName = (
  subjectName: string,
  board?: EducationBoard | 'ALL' | string
): string => {
  if (!subjectName) return '';
  if (subjectName.trim().toLowerCase() === 'regional language' && board && board !== 'ALL') {
    return BOARD_REGIONAL_LANGUAGE_NAME[board as EducationBoard] || subjectName;
  }
  return subjectName;
};

export const parseEnrolledCourseEntry = (entry: string): { name: string; code: string } => {
  const trimmed = (entry || '').trim();
  const match = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { name: match[1].trim(), code: match[2].trim() };
  }
  return { name: trimmed, code: '' };
};

export const formatEnrolledCourseEntry = (subjectName: string, code?: string): string => {
  const cleanName = subjectName.trim();
  return code ? `${cleanName} (${code})` : cleanName;
};

export const isSubjectEnrolled = (
  subject: { name: string; code?: string },
  enrolledCourses?: string[],
  board?: EducationBoard | 'ALL' | string
): boolean => {
  if (!enrolledCourses || enrolledCourses.length === 0) return false;
  const normSubName = subject.name.toLowerCase().trim();
  const normLocalized = getLocalizedSubjectName(subject.name, board).toLowerCase().trim();
  const normSubCode = (subject.code || '').toLowerCase().trim();

  return enrolledCourses.some((entry) => {
    const parsed = parseEnrolledCourseEntry(entry);
    const normEntryName = parsed.name.toLowerCase();
    const normEntryCode = parsed.code.toLowerCase();
    if (normSubCode && normEntryCode && normSubCode === normEntryCode) return true;
    if (normEntryName === normSubName || normEntryName === normLocalized) return true;
    // Handle common legacy course aliases like "Algebra I" / "Mathematics" or "Physics II"
    if (normSubName === 'mathematics' && (normEntryName.includes('math') || normEntryName.includes('algebra'))) return true;
    if (normSubName === 'physics' && normEntryName.startsWith('physics')) return true;
    if (normSubName === 'chemistry' && normEntryName.startsWith('chemistry')) return true;
    if (normSubName === 'biology' && normEntryName.startsWith('biology')) return true;
    if (normSubName === 'history & civics' && (normEntryName.includes('history') || normEntryName.includes('civics'))) return true;
    if (normSubName === 'computer science' && normEntryName.includes('computer')) return true;
    return false;
  });
};

interface SubjectTemplate {
  key: string;
  name: string;
  codePrefix: string;
  category: 'STEM' | 'Language Arts' | 'Humanities' | 'Arts & Electives';
  minGrade?: number;
  maxGrade?: number;
  board?: EducationBoard | 'ALL'; // 'ALL' = shared across all 11 boards (single canonical entry per grade)
  descriptionByStage: (grade: number) => string;
  topicsByStage: (grade: number) => { title: string; description: string }[];
}

const CORE_SUBJECT_TEMPLATES: SubjectTemplate[] = [
  // 1. ENGLISH LANGUAGE ARTS
  {
    key: 'eng-lit',
    name: 'English Literature',
    codePrefix: 'ENL',
    category: 'Language Arts',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} prose, poetry, drama, character critique & literary devices across CBSE, ICSE, IB, IGCSE & State Boards.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Short Stories, Fables & Narrative Devices', description: 'Plot structure, characterization, imagery & theme' },
            { title: 'Lyric & Narrative Poetry Appreciation', description: 'Rhyme scheme, metaphor, personification & stanza analysis' },
          ]
        : g <= 10
        ? [
            { title: 'Classical & Modern Prose Analysis', description: 'Authorial intent, symbolism, irony & thematic essays' },
            { title: 'Shakespearean Drama & Poetic Forms', description: 'Tragic structure, dramatic irony & close textual reading' },
          ]
        : [
            { title: 'World Literature & Critical Literary Theory', description: 'Post-colonial, modernist prose & comparative analysis' },
            { title: 'Dramatic Tragedy & Metaphysical Poetry', description: 'Close stylistic commentary & long-form textual synthesis' },
          ],
  },
  {
    key: 'eng-lang',
    name: 'English Language',
    codePrefix: 'ENG',
    category: 'Language Arts',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} grammar mechanics, unseen comprehension, formal composition & rhetoric.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Applied Grammar, Tenses & Voice', description: 'Clauses, active/passive voice, direct-indirect speech' },
            { title: 'Paragraph, Letter & Descriptive Writing', description: 'Cohesive structuring, formal/informal registers' },
          ]
        : g <= 10
        ? [
            { title: 'Comprehension Synthesis & Precis Writing', description: 'Inference extraction, vocabulary & concise summarizing' },
            { title: 'Argumentative Essays & Notice/Report Writing', description: 'Persuasive thesis building & formal correspondence' },
          ]
        : [
            { title: 'Rhetorical Analysis & Synthesis Composition', description: 'Aristotelian appeals, logical fallacies & academic tone' },
            { title: 'Advanced Discourse & Editorial Writing', description: 'Formal reports, debate transcripts & critical editing' },
          ],
  },

  // 2. HINDI LANGUAGE ARTS
  {
    key: 'hin-lit',
    name: 'Hindi Literature',
    codePrefix: 'HNL',
    category: 'Language Arts',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Hindi Sahitya — Gadya (Prose), Kavya (Poetry), Ekanki & classical/modern authors.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Gadya Khand: Kahani aur Jeevani', description: 'Hindi prose comprehension, moral themes & character study' },
            { title: 'Kavya Khand: Dohe aur Bal Kavita', description: 'Kabir, Rahim & modern poets — bhavarth & poetic beauty' },
          ]
        : g <= 10
        ? [
            { title: 'Adhunik Hindi Gadya aur Premchand Katha', description: 'Social realism, Premchand stories & critical evaluation' },
            { title: 'Bhaktikal aur Chhayavad Kavya', description: 'Surdas, Tulsidas, Nirala & Prasad poetic interpretation' },
          ]
        : [
            { title: 'Hindi Sahitya ka Itihas & Alochana', description: 'Adikal to Adhunik kal literary movements & critique' },
            { title: 'Upanyas, Natak aur Nibandh Sahitya', description: 'Advanced Hindi drama, novel characterization & essays' },
          ],
  },
  {
    key: 'hin-lang',
    name: 'Hindi Language',
    codePrefix: 'HIN',
    category: 'Language Arts',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Hindi Vyakaran, Vakya Rachna, Muhavare, Patra & Nibandh Lekhan.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Hindi Vyakaran: Sandhi, Samas & Kaal', description: 'Word formation, tense transformations & karak usage' },
            { title: 'Apathit Gadyansh & Patra Lekhan', description: 'Unseen passage comprehension & formal/informal letters' },
          ]
        : g <= 10
        ? [
            { title: 'Vachya, Alankar & Pad Parichay', description: 'Figures of speech, syntactic parsing & sentence synthesis' },
            { title: 'Nibandh, Vigyapan aur Samvad Lekhan', description: 'Structured Hindi essays, notices & creative dialogue' },
          ]
        : [
            { title: 'Prayojanmulak Hindi & Patrakarita', description: 'Media writing, feature articles & administrative terminology' },
            { title: 'Bhasha Vigyan & Rachnatmak Anuvad', description: 'Academic translation & advanced stylistic composition' },
          ],
  },

  // 3. SANSKRIT, REGIONAL & FOREIGN LANGUAGES
  {
    key: 'sanskrit',
    name: 'Sanskrit',
    codePrefix: 'SKT',
    category: 'Language Arts',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Sanskrit Vyakaran (Shabdarupa, Dhaturupa, Sandhi), Subhashitani & classical prose.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Shabdarupa, Dhaturupa & Karak Vibhakti', description: 'Declensions, verb conjugations & case endings' },
            { title: 'Subhashitani & Nitishloka Interpretation', description: 'Meter recitation, anvaya & moral meaning' },
          ]
        : [
            { title: 'Paninian Sandhi, Samas & Pratyaya', description: 'Vowel/consonant sandhi rules & compound formation' },
            { title: 'Sanskrit Gadya-Padya & Anuvad Abhyasa', description: 'Classical prose translation & verse comprehension' },
          ],
  },
  {
    key: 'regional-lang',
    name: 'Regional Language',
    codePrefix: 'REG',
    category: 'Language Arts',
    board: 'ALL',
    descriptionByStage: (g) =>
      `Grade ${g} State & Heritage Regional Language track (Punjabi, Gujarati, Marathi, Kannada, Telugu, Bengali, Tamil).`,
    topicsByStage: () => [
      { title: 'Regional Grammar, Orthography & Idioms', description: 'Script mastery, syntax, proverbs & structured writing' },
      { title: 'Regional Sahitya, Poetry & Essay Composition', description: 'Heritage prose/poetry appreciation & functional letters' },
    ],
  },
  {
    key: 'foreign-lang',
    name: 'Foreign Language',
    codePrefix: 'FRL',
    category: 'Language Arts',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} modern foreign language acquisition (French / German / Spanish / Mandarin).`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Conversational Phonetics & Everyday Vocabulary', description: 'Greetings, family, school life & present tense verbs' },
            { title: 'Basic Grammar & Cultural Etiquette', description: 'Articles, gender agreement, dialogues & short paragraphs' },
          ]
        : [
            { title: 'Intermediate Tenses & Narrative Comprehension', description: 'Past/future forms, subordinating conjunctions & emails' },
            { title: 'Global Culture, Media & Oral Fluency', description: 'Role-plays, reading authentic articles & structured essays' },
          ],
  },

  // 4. CORE MATHEMATICS & SCIENCES (STEM)
  {
    key: 'math',
    name: 'Mathematics',
    codePrefix: 'MTH',
    category: 'STEM',
    board: 'ALL',
    descriptionByStage: (g) =>
      g <= 8
        ? `Grade ${g} Arithmetic, Ratios, Algebraic Expressions, Geometry & Data Handling.`
        : g <= 10
        ? `Grade ${g} Quadratics, Coordinate Geometry, Trigonometry, Mensuration & Statistics.`
        : `Grade ${g} Sets, Relations, Calculus (Limits/Derivatives/Integrals), Vectors & Probability.`,
    topicsByStage: (g) =>
      g === 6
        ? [
            { title: 'Fractions, Decimals, Ratios & Percentages', description: 'Proportional reasoning & commercial arithmetic basics' },
            { title: 'Basic Geometrical Ideas & Algebra Intro', description: 'Angles, polygons, variables & simple equations' },
          ]
        : g === 7
        ? [
            { title: 'Integers, Rational Numbers & Exponents', description: 'Laws of exponents & operations on signed numbers' },
            { title: 'Simple Linear Equations & Triangle Congruence', description: 'Solving single-variable equations & SSS/SAS congruence' },
          ]
        : g === 8
        ? [
            { title: 'Linear Equations, Factorisation & Identities', description: 'Algebraic identities & linear equation applications' },
            { title: 'Mensuration, Quadrilaterals & Data Graphs', description: 'Surface area, volume & frequency histograms' },
          ]
        : g === 9
        ? [
            { title: 'Number Systems, Polynomials & Coordinate Plane', description: 'Irrational numbers, remainder theorem & Cartesian graphs' },
            { title: 'Euclidean Geometry, Circles & Heron Formula', description: 'Triangle theorems, chords & surface areas' },
          ]
        : g === 10
        ? [
            { title: 'Quadratic Equations & Arithmetic Progressions', description: 'Quadratic formula, discriminant & nth-term sums' },
            { title: 'Trigonometry Ratios, Circles & Statistics', description: 'Heights & distances, tangent theorems & mean/median/mode' },
          ]
        : g === 11
        ? [
            { title: 'Sets, Relations, Functions & Trigonometry', description: 'Compound angles, radian measure & trigonometric equations' },
            { title: 'Complex Numbers, Limits & Conic Sections', description: 'Argand plane, parabola/ellipse/hyperbola & derivatives' },
          ]
        : [
            { title: 'Differential & Integral Calculus', description: 'Chain rule, maxima-minima, definite integrals & differential equations' },
            { title: 'Vectors, 3D Geometry & Conditional Probability', description: 'Dot/cross products, Bayes theorem & linear programming' },
          ],
  },
  {
    key: 'physics',
    name: 'Physics',
    codePrefix: 'PHY',
    category: 'STEM',
    board: 'ALL',
    descriptionByStage: (g) =>
      g <= 8
        ? `Grade ${g} foundational mechanics, light, sound, heat, force & pressure.`
        : g <= 10
        ? `Grade ${g} Kinematics, Newton's Laws, Optics, Electricity (Ohm's Law) & Electromagnetism.`
        : `Grade ${g} Rotational Dynamics, Thermodynamics, Electrostatics, EM Waves & Quantum Physics.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Motion, Force, Friction & Pressure', description: 'Speed graphs, contact/non-contact forces & fluid pressure' },
            { title: 'Light Reflection, Sound & Simple Circuits', description: 'Plane mirrors, pitch/loudness & electrical cells' },
          ]
        : g <= 10
        ? [
            { title: "Newton's Laws, Gravitation & Work-Energy", description: 'F=ma, momentum conservation, potential/kinetic energy' },
            { title: "Ray Optics, Ohm's Law & Magnetic Effects", description: 'Lens/mirror formula, series/parallel resistors & motors' },
          ]
        : g === 11
        ? [
            { title: '2D Kinematics, Rotational Inertia & Gravitation', description: 'Projectile motion, torque, angular momentum & Kepler laws' },
            { title: 'Thermodynamics, Oscillations & Mechanical Waves', description: 'Carnot cycle, SHM & standing wave harmonics' },
          ]
        : [
            { title: "Electrostatics, Gauss's Law & Current Circuits", description: 'Electric potential, capacitance & Kirchhoff laws' },
            { title: 'Electromagnetic Induction, Optics & Modern Physics', description: 'Faraday law, wave interference, photoelectric effect & nuclei' },
          ],
  },
  {
    key: 'chemistry',
    name: 'Chemistry',
    codePrefix: 'CHM',
    category: 'STEM',
    board: 'ALL',
    descriptionByStage: (g) =>
      g <= 8
        ? `Grade ${g} states of matter, elements, compounds, acids/bases & physical/chemical changes.`
        : g <= 10
        ? `Grade ${g} Atomic Structure, Periodic Table, Chemical Bonding, Stoichiometry & Carbon Compounds.`
        : `Grade ${g} Quantum Orbitals, Thermodynamics, Chemical Equilibrium, Electrochemistry & Organic Synthesis.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Matter, Mixtures, Elements & Compounds', description: 'Separation techniques, symbols & chemical equations' },
            { title: 'Acids, Bases, Metals & Combustion', description: 'Indicators, reactivity series & oxidation basics' },
          ]
        : g <= 10
        ? [
            { title: 'Atomic Structure, Bohr Model & Periodic Trends', description: 'Valency, electronegativity & atomic radius patterns' },
            { title: 'Chemical Reactions, Acids-Bases & Organic Intro', description: 'Balanced equations, pH scale & IUPAC hydrocarbons' },
          ]
        : g === 11
        ? [
            { title: 'Mole Concept, Quantum Orbitals & VSEPR Bonding', description: 'Stoichiometry, hybridization & molecular geometry' },
            { title: 'Chemical Thermodynamics, Equilibrium & Hydrocarbons', description: 'Enthalpy, Le Chatelier principle, alkanes/alkenes/alkynes' },
          ]
        : [
            { title: 'Electrochemistry, Kinetics & Solutions', description: 'Nernst equation, reaction order & colligative properties' },
            { title: 'Coordination Compounds & Functional Organic Chemistry', description: 'Aldehydes, ketones, carboxylic acids, amines & biomolecules' },
          ],
  },
  {
    key: 'biology',
    name: 'Biology',
    codePrefix: 'BIO',
    category: 'STEM',
    board: 'ALL',
    descriptionByStage: (g) =>
      g <= 8
        ? `Grade ${g} cell foundations, microorganisms, plant nutrition, ecosystems & human body systems.`
        : g <= 10
        ? `Grade ${g} Cell Organelles, Photosynthesis, Life Processes, Genetics & Evolution.`
        : `Grade ${g} Molecular Biology, DNA Replication, Human Physiology, Biotechnology & Ecology.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Plant & Animal Cell Structure & Microorganisms', description: 'Organelles, friendly/harmful microbes & nitrogen cycle' },
            { title: 'Nutrition, Respiration & Ecosystem Conservation', description: 'Digestive/respiratory organs & biodiversity preservation' },
          ]
        : g <= 10
        ? [
            { title: 'Photosynthesis, Respiration & Circulatory Transport', description: 'Chloroplast reactions, ATP generation & nephron/heart function' },
            { title: 'Heredity, Mendelian Genetics & Evolution', description: 'Monohybrid/dihybrid crosses, DNA traits & natural selection' },
          ]
        : g === 11
        ? [
            { title: 'Biological Classification, Cell Cycle & Biomolecules', description: 'Mitosis/meiosis, enzymes & protein/lipid structure' },
            { title: 'Plant Physiology & Human Neural/Endocrine Control', description: 'C3/C4 pathways, synaptic transmission & hormones' },
          ]
        : [
            { title: 'Molecular Basis of Inheritance & Gene Regulation', description: 'DNA replication, transcription, translation & lac operon' },
            { title: 'Biotechnology, Immunology & Population Ecology', description: 'Recombinant DNA, PCR, antibody defense & biomes' },
          ],
  },
  {
    key: 'gen-science',
    name: 'General Science (Integrated)',
    codePrefix: 'SCI',
    category: 'STEM',
    minGrade: 6,
    maxGrade: 10,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} integrated Physical, Chemical & Life Science inquiry & laboratory skills.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Scientific Inquiry & Measurement Lab', description: 'SI units, experimental variables & observation records' },
            { title: 'Matter, Energy & Living Organisms Overview', description: 'Cross-disciplinary physical & biological systems' },
          ]
        : [
            { title: 'Integrated Physical & Chemical Processes', description: 'Energy conservation, stoichiometry & reaction rates' },
            { title: 'Biosphere Systems & Sustainable Technology', description: 'Human environmental impact & green energy' },
          ],
  },
  {
    key: 'computer',
    name: 'Computer Science',
    codePrefix: 'CSC',
    category: 'STEM',
    board: 'ALL',
    descriptionByStage: (g) =>
      g <= 8
        ? `Grade ${g} Computer Fundamentals, HTML/CSS, Scratch/Python logic & Cyber Safety.`
        : g <= 10
        ? `Grade ${g} Python/Java Programming, Control Flow, Relational Databases & Web Technologies.`
        : `Grade ${g} Data Structures, Algorithms, SQL, Computer Networks & Object-Oriented Engineering.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Computer Architecture, OS & Binary Systems', description: 'CPU/memory fundamentals, binary conversion & cloud tools' },
            { title: 'Algorithmic Flowcharts & Intro Python/HTML', description: 'Variables, loops, conditionals & basic web pages' },
          ]
        : g <= 10
        ? [
            { title: 'Structured Programming (Python / Java)', description: 'Functions, arrays/lists, string manipulation & OOP basics' },
            { title: 'Database Basics (SQL) & Cyber Ethics', description: 'Tables, SELECT queries, encryption & digital citizenship' },
          ]
        : [
            { title: 'Data Structures, Recursion & Algorithmic Complexity', description: 'Stacks, queues, trees, sorting & searching analysis' },
            { title: 'Relational DBMS, SQL Joins & Network Protocols', description: 'Normalization, TCP/IP, HTTP & full-stack connectivity' },
          ],
  },
  {
    key: 'evs',
    name: 'Environmental Science (EVS)',
    codePrefix: 'ENV',
    category: 'STEM',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Ecology, Biodiversity Conservation, Climate Change & Renewable Energy.`,
    topicsByStage: () => [
      { title: 'Ecosystem Energetics & Biodiversity Hotspots', description: 'Food webs, biogeochemical cycles & species conservation' },
      { title: 'Renewable Energy & Sustainable Resource Policy', description: 'Solar/wind systems, watershed management & carbon footprint' },
    ],
  },
  {
    key: 'ai-robotics',
    name: 'Artificial Intelligence & Robotics',
    codePrefix: 'AIR',
    category: 'STEM',
    minGrade: 8,
    maxGrade: 12,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} AI Problem Solving, Data Literacy, Sensors, Machine Learning & Ethics.`,
    topicsByStage: (g) =>
      g <= 10
        ? [
            { title: 'AI Project Cycle & Data Exploration', description: 'Problem scoping, data acquisition & ethical AI principles' },
            { title: 'Computer Vision & Sensor Automation Intro', description: 'Image recognition basics & microcontroller logic' },
          ]
        : [
            { title: 'Machine Learning, Neural Networks & Transformers', description: 'Regression, classification, backpropagation & attention' },
            { title: 'Autonomous Robotics Kinematics & Control', description: 'PID loops, path planning & embedded sensor fusion' },
          ],
  },

  // 5. HUMANITIES & SOCIAL SCIENCES
  {
    key: 'social-science',
    name: 'Social Science',
    codePrefix: 'SSC',
    category: 'Humanities',
    minGrade: 6,
    maxGrade: 10,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} unified History, Social & Political Life (Civics), Geography & Economic Foundations.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Heritage Civilizations & Local Self-Governance', description: 'Early societies, Panchayati Raj, municipal governance & diversity' },
            { title: 'Our Environment, Resources & Markets', description: 'Natural ecosystems, agriculture & neighborhood economic chains' },
          ]
        : [
            { title: 'Democratic Politics, Federalism & Rights', description: 'Constitutional framework, elections, judiciary & power sharing' },
            { title: 'Economic Development, Sectors & Globalization', description: 'GDP indicators, money & credit, consumer rights' },
          ],
  },
  {
    key: 'history-civics',
    name: 'History & Civics',
    codePrefix: 'HIS',
    category: 'Humanities',
    board: 'ALL',
    descriptionByStage: (g) =>
      g <= 8
        ? `Grade ${g} Ancient, Medieval & Early Modern History alongside Civic Institutions & Constitution.`
        : g <= 10
        ? `Grade ${g} Modern History, Indian Freedom Movement (1857–1947), World Wars & Parliamentary Civics.`
        : `Grade ${g} World History, Historiography, Constitutional Jurisprudence & Comparative Governance.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Indus Valley, Classical Empires & Medieval Kingdoms', description: 'Harappan urban planning, Mauryas, Guptas & Sultanate/Mughals' },
            { title: 'Indian Constitution, Fundamental Rights & Duties', description: 'Secularism, rule of law & civic responsibilities' },
          ]
        : g <= 10
        ? [
            { title: 'Indian National Movement (1857–1947)', description: '1857 Uprising, Non-Cooperation, Civil Disobedience & Independence' },
            { title: 'Union Legislature, Executive & Supreme Judiciary', description: 'Lok Sabha, Rajya Sabha, Prime Minister & judicial review' },
          ]
        : [
            { title: 'Industrialization, World Revolutions & Cold War', description: 'Enlightenment, industrial transformation & global geopolitics' },
            { title: 'Constitutional Debates & Source Historiography', description: 'Primary archive evaluation & comparative political institutions' },
          ],
  },
  {
    key: 'geography',
    name: 'Geography',
    codePrefix: 'GEO',
    category: 'Humanities',
    board: 'ALL',
    descriptionByStage: (g) =>
      g <= 8
        ? `Grade ${g} Earth Landforms, Lithosphere, Atmosphere, Maps & Global Resources.`
        : g <= 10
        ? `Grade ${g} Topographical Maps, Indian Monsoon Climate, Drainage Basins, Minerals & Transport.`
        : `Grade ${g} Geomorphology, Climatology, Human Geography, GIS & Spatial Economics.`,
    topicsByStage: (g) =>
      g <= 8
        ? [
            { title: 'Motions of the Earth, Domains & Landforms', description: 'Latitudes/longitudes, plate boundaries, mountains & rivers' },
            { title: 'Natural Vegetation, Water & Mineral Resources', description: 'Resource conservation & conventional/non-conventional energy' },
          ]
        : [
            { title: 'Topographic Map Reading & Drainage Systems', description: 'Contours, grid references, Himalayan & Peninsular rivers' },
            { title: 'Monsoon Dynamics, Soils & Economic Geography', description: 'Agro-climatic zones, industrial corridors & GIS basics' },
          ],
  },
  {
    key: 'moral-science',
    name: 'Moral Science & Value Education',
    codePrefix: 'VAL',
    category: 'Humanities',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Ethics, Empathy, Civic Integrity, Emotional Intelligence & Life Skills.`,
    topicsByStage: (g) =>
      g <= 9
        ? [
            { title: 'Integrity, Empathy & Respect for Diversity', description: 'Ethical decision-making, compassion & community harmony' },
            { title: 'Digital Responsibility, Discipline & Resilience', description: 'Online ethics, stress management & leadership values' },
          ]
        : [
            { title: 'Applied Ethics, Social Justice & Sustainability', description: 'Moral reasoning dilemmas, civic service & environmental stewardship' },
            { title: 'Emotional Intelligence & Purposeful Leadership', description: 'Conflict resolution, teamwork & lifelong self-reflection' },
          ],
  },
  {
    key: 'economics',
    name: 'Economics',
    codePrefix: 'ECO',
    category: 'Humanities',
    minGrade: 9,
    maxGrade: 12,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Microeconomics, Demand & Supply, National Income, Banking & Macroeconomics.`,
    topicsByStage: (g) =>
      g <= 10
        ? [
            { title: 'Factors of Production, Demand & Markets', description: 'Consumer choice, agricultural/industrial sectors & poverty alleviation' },
            { title: 'Money, Banking & Global Trade Foundations', description: 'Central banking, credit systems & globalization impact' },
          ]
        : [
            { title: 'Consumer Equilibrium, Elasticity & Market Forms', description: 'Utility analysis, indifference curves, monopoly & oligopoly' },
            { title: 'Macroeconomics: National Income, GDP & Fiscal Policy', description: 'Aggregate demand/supply, RBI monetary tools & balance of payments' },
          ],
  },

  // 6. SENIOR SECONDARY STREAM SUBJECTS
  {
    key: 'accountancy',
    name: 'Accountancy',
    codePrefix: 'ACC',
    category: 'Humanities',
    minGrade: 11,
    maxGrade: 12,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Double-Entry Bookkeeping, Ledger Trial Balance, Partnership & Corporate Finance.`,
    topicsByStage: (g) =>
      g === 11
        ? [
            { title: 'Accounting Principles, Journal, Ledger & BRS', description: 'GAAP conventions, cash books & bank reconciliation statements' },
            { title: 'Depreciation & Financial Statements', description: 'Trading, Profit & Loss account and Balance Sheet preparation' },
          ]
        : [
            { title: 'Partnership Accounting & Share Capital', description: 'Goodwill valuation, admission/retirement & company debentures' },
            { title: 'Cash Flow Statements & Ratio Analysis', description: 'Liquidity, solvency & profitability ratios' },
          ],
  },
  {
    key: 'business-studies',
    name: 'Business Studies',
    codePrefix: 'BST',
    category: 'Humanities',
    minGrade: 9,
    maxGrade: 12,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Forms of Business Organization, Entrepreneurship, Management Principles & Marketing.`,
    topicsByStage: (g) =>
      g <= 10
        ? [
            { title: 'Commercial Organizations & Trade Systems', description: 'Sole proprietorship, partnerships, banking & e-commerce' },
            { title: 'Consumer Protection & Budgeting Basics', description: 'Marketing mix & ethical business conduct' },
          ]
        : [
            { title: 'Principles of Management & Organizational Design', description: 'Planning, organizing, staffing, directing & controlling' },
            { title: 'Financial Markets, Marketing Mix & Entrepreneurship', description: 'Capital markets, branding & startup strategy' },
          ],
  },
  {
    key: 'political-science',
    name: 'Political Science',
    codePrefix: 'POL',
    category: 'Humanities',
    minGrade: 11,
    maxGrade: 12,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Political Theory, Constitutional Design, Comparative Politics & International Relations.`,
    topicsByStage: () => [
      { title: 'Political Theory: Liberty, Equality & Justice', description: 'Rights frameworks, citizenship & democratic theory' },
      { title: 'Contemporary World Politics & Foreign Policy', description: 'United Nations, regional blocs & multilateral diplomacy' },
    ],
  },
  {
    key: 'psychology',
    name: 'Psychology',
    codePrefix: 'PSY',
    category: 'Humanities',
    minGrade: 11,
    maxGrade: 12,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Cognitive Processes, Human Development, Learning, Personality & Psychological Well-Being.`,
    topicsByStage: () => [
      { title: 'Perception, Memory, Learning & Motivation', description: 'Cognitive information processing, conditioning & emotions' },
      { title: 'Personality Theories & Mental Health Inquiry', description: 'Psychometric assessment, stress coping & social behavior' },
    ],
  },
  {
    key: 'sociology',
    name: 'Sociology',
    codePrefix: 'SOC',
    category: 'Humanities',
    minGrade: 11,
    maxGrade: 12,
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Social Institutions, Stratification, Cultural Change & Sociological Research Methods.`,
    topicsByStage: () => [
      { title: 'Social Structure, Institutions & Stratification', description: 'Family, kinship, education & social mobility' },
      { title: 'Social Change, Urbanization & Field Research', description: 'Qualitative/quantitative methods & cultural transformation' },
    ],
  },

  // 7. ARTS & PHYSICAL EDUCATION
  {
    key: 'visual-arts',
    name: 'Visual Arts & Design',
    codePrefix: 'ART',
    category: 'Arts & Electives',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Drawing, Color Theory, Perspective, Art History & Digital Design.`,
    topicsByStage: () => [
      { title: 'Perspective Drawing, Composition & Color Theory', description: 'Two-point perspective, shading & color harmony' },
      { title: 'Digital Illustration & Cultural Art Heritage', description: 'Vector composition & classical/folk art traditions' },
    ],
  },
  {
    key: 'phe',
    name: 'Physical & Health Education',
    codePrefix: 'PHE',
    category: 'Arts & Electives',
    board: 'ALL',
    descriptionByStage: (g) => `Grade ${g} Sports Science, Yoga, Kinesiology, Nutrition & Athletic Conditioning.`,
    topicsByStage: () => [
      { title: 'Fitness, Yoga Asanas & Sports Physiology', description: 'Cardiovascular endurance, flexibility & injury prevention' },
      { title: 'Balanced Nutrition, Team Rules & Mental Wellness', description: 'Macronutrient balance, sportsmanship & active lifestyle' },
    ],
  },

  // 8. BOARD-SPECIFIC SIGNATURE COURSES (only tagged to their specific board, zero clutter)
  {
    key: 'ib-design',
    name: 'IB MYP Design Technology',
    codePrefix: 'DES',
    category: 'Arts & Electives',
    minGrade: 6,
    maxGrade: 10,
    board: 'IB',
    descriptionByStage: (g) => `IB MYP Grade ${g} Design Cycle — Inquiring, Developing Ideas, Creating Solutions & Evaluating Impact.`,
    topicsByStage: () => [
      { title: 'The Design Cycle & Human-Centered Prototyping', description: 'User research, design specifications & iterative prototyping' },
      { title: 'Digital Fabrication, Sustainability & Product Testing', description: 'CAD modeling, material selection & solution evaluation' },
    ],
  },
  {
    key: 'ib-tok',
    name: 'Theory of Knowledge (TOK)',
    codePrefix: 'TOK',
    category: 'Humanities',
    minGrade: 11,
    maxGrade: 12,
    board: 'IB',
    descriptionByStage: (g) => `IB DP Grade ${g} Epistemology — Knowledge Frameworks, Areas of Knowledge & TOK Exhibition/Essay.`,
    topicsByStage: () => [
      { title: 'Knowledge & the Knower: Scope & Perspectives', description: 'Evaluating bias, evidence, certainty & justification' },
      { title: 'Areas of Knowledge: Natural Sciences, History & Ethics', description: 'Methodological synthesis across academic disciplines' },
    ],
  },
  {
    key: 'igcse-gp',
    name: 'Global Perspectives & Research',
    codePrefix: 'GPR',
    category: 'Humanities',
    minGrade: 9,
    maxGrade: 12,
    board: 'IGCSE',
    descriptionByStage: (g) => `Cambridge Grade ${g} Cross-Curricular Research, Source Evaluation & Global Critical Reasoning.`,
    topicsByStage: () => [
      { title: 'Evaluating Arguments, Bias & Global Evidence', description: 'Source credibility, statistical claims & counter-perspectives' },
      { title: 'Individual Research Report & Team Collaboration', description: 'Cross-cultural problem framing & evidence synthesis' },
    ],
  },
];

function generateDefaultCurriculumDB(): {
  subjects: DBSubject[];
  topics: DBTopic[];
  curriculumItems: CurriculumItem[];
} {
  const subjects: DBSubject[] = [];
  const topics: DBTopic[] = [];
  const curriculumItems: CurriculumItem[] = [];
  const grades = [6, 7, 8, 9, 10, 11, 12];

  // Store 1 canonical record per (Grade, SubjectTemplate) with board='ALL' for universal subjects,
  // or explicit board ('IB', 'IGCSE') for board-exclusive subjects -> Zero repeated subjects!
  for (const grade of grades) {
    for (const tpl of CORE_SUBJECT_TEMPLATES) {
      if (tpl.minGrade && grade < tpl.minGrade) continue;
      if (tpl.maxGrade && grade > tpl.maxGrade) continue;

      const board: EducationBoard | 'ALL' = tpl.board || 'ALL';
      const subjectId = `subj-g${grade}-${tpl.key}`;
      const courseCode = `${tpl.codePrefix}-${grade}01`;
      const description = tpl.descriptionByStage(grade);

      subjects.push({
        id: subjectId,
        name: tpl.name,
        grade_level: grade,
        board,
        category: tpl.category,
        code: courseCode,
        description,
        status: 'ACTIVE',
        created_at: '2026-01-10',
      });

      const tplTopics = tpl.topicsByStage(grade);
      const sampleTopics: string[] = [];

      tplTopics.forEach((t, idx) => {
        sampleTopics.push(t.title);
        topics.push({
          id: `top-g${grade}-${tpl.key}-${idx + 1}`,
          subject_id: subjectId,
          title: t.title,
          description: t.description,
          status: 'ACTIVE',
          created_at: '2026-01-10',
        });
      });

      curriculumItems.push({
        id: `curr-g${grade}-${tpl.key}`,
        grade,
        gradeLabel: `Grade ${grade}`,
        board,
        category: tpl.category,
        subjectName: tpl.name,
        code: courseCode,
        description,
        sampleTopics,
      });
    }
  }

  return { subjects, topics, curriculumItems };
}

const DEFAULT_DB = generateDefaultCurriculumDB();

export const DEFAULT_SUBJECTS_DB: DBSubject[] = DEFAULT_DB.subjects;
export const DEFAULT_TOPICS_DB: DBTopic[] = DEFAULT_DB.topics;
export const COMPREHENSIVE_CURRICULUM_6_12: CurriculumItem[] = DEFAULT_DB.curriculumItems;

// Student Alex R. Grades 6-12 Academic Growth Progress Record
export const SAMPLE_STUDENT_ACADEMIC_GROWTH: StudentGradeGrowth[] = [
  {
    gradeLabel: 'Grade 9',
    gradeNumber: 9,
    status: 'Completed',
    courses: [
      { name: 'Mathematics', completed: true, progress: 100 },
      { name: 'Biology', completed: true, progress: 100 },
      { name: 'History & Civics', completed: true, progress: 100 },
    ],
  },
  {
    gradeLabel: 'Grade 10',
    gradeNumber: 10,
    status: 'Current',
    courses: [
      { name: 'Physics', progress: 75, completed: false, statusBadge: '75%' },
      { name: 'English Literature', progress: 60, completed: false, statusBadge: '60%' },
      { name: 'Chemistry', progress: 100, completed: true, statusBadge: 'Completed' },
    ],
  },
  {
    gradeLabel: 'Grade 11',
    gradeNumber: 11,
    status: 'Enrolled',
    courses: [
      { name: 'Mathematics', completed: false, statusBadge: 'Enrolled' },
      { name: 'Computer Science', completed: false, statusBadge: 'Enrolled' },
    ],
  },
  {
    gradeLabel: 'Grade 12',
    gradeNumber: 12,
    status: 'Upcoming',
    courses: [
      { name: 'English Literature', completed: false, statusBadge: 'Upcoming' },
      { name: 'Physics', completed: false, statusBadge: 'Upcoming' },
    ],
  },
];

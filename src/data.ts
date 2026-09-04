import { Resource, Notice } from './types';

export const notices: Notice[] = [
  {
    id: '1',
    title: 'Welcome to Tejashwi 23 Official Website',
    content: 'This portal will be used for sharing all class lectures, reference books, and important batch announcements. Save this link for future reference!',
    date: '2026-09-03',
    isImportant: true,
  },
  {
    id: '2',
    title: 'Term Exam Starting Soon',
    content: 'The Term Examination will officially start from 13th September. Please prepare accordingly.',
    date: '2026-09-03',
    isImportant: true,
  },
  {
    id: '3',
    title: 'Complete Integrated Teaching Assignment',
    content: 'Please ensure to complete your integrated teaching assignment before the term exam begins.',
    date: '2026-09-03',
    isImportant: true,
  }
];

export const resources: Resource[] = [
  // ANATOMY - 1st Term (Card 1 & Card 2)
  {
    id: 'l-ana-c1-1',
    title: 'Anatomy - Superior Extremity / Upper Limb Osteology',
    description: 'Clavicle, Scapula, Humerus, Radius, Ulna & typical hand bones with muscle attachments.',
    date: '2026-08-15',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.4 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'l-ana-c1-2',
    title: 'Anatomy - Brachial Plexus & Axilla Dissection',
    description: 'Axillary artery branches, cords and branches of brachial plexus, axillary lymph nodes.',
    date: '2026-08-20',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '5.8 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'l-ana-c2-1',
    title: 'Anatomy - Inferior Extremity / Femoral Triangle & Gluteal Region',
    description: 'Femoral sheath, femoral canal, femoral hernia, sciatic nerve course & clinical correlations.',
    date: '2026-08-28',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '7.2 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'l-ana-c2-2',
    title: 'Anatomy - Knee Joint & Popliteal Fossa',
    description: 'Cruciate ligaments, menisci, locking & unlocking mechanism, popliteal boundaries & contents.',
    date: '2026-09-01',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '4.9 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '1st Term',
    card: '2nd Card'
  },

  // ANATOMY - 2nd Term (Card 3 & Card 4)
  {
    id: 'l-ana-c3-1',
    title: 'Anatomy - Thoracic Wall, Pleura & Lungs',
    description: 'Intercostal spaces, bronchopulmonary segments, pleural recesses, mechanics of respiration.',
    date: '2026-09-02',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '8.1 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '2nd Term',
    card: '3rd Card'
  },
  {
    id: 'l-ana-c3-2',
    title: 'Anatomy - Heart & Mediastinum',
    description: 'External features, interior of right atrium, coronary circulation & conducting system.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '9.5 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '2nd Term',
    card: '3rd Card'
  },
  {
    id: 'l-ana-c4-1',
    title: 'Anatomy - Anterior Abdominal Wall & Inguinal Canal',
    description: 'Rectus sheath formation, layers of inguinal canal, direct vs indirect inguinal hernia.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.7 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '2nd Term',
    card: '4th Card'
  },
  {
    id: 'l-ana-c4-2',
    title: 'Anatomy - Stomach, Liver & Portal Circulation',
    description: 'Peritoneal attachments, blood supply, portosystemic anastomoses and liver segments.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '8.3 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '2nd Term',
    card: '4th Card'
  },

  // ANATOMY - 3rd Term (Card 5 & Card 6)
  {
    id: 'l-ana-c5-1',
    title: 'Anatomy - Triangles of Neck & Thyroid Gland',
    description: 'Anterior & posterior triangles, carotid sheath, thyroid capsule, relations and arterial supply.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '7.8 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '3rd Term',
    card: '5th Card'
  },
  {
    id: 'l-ana-c6-1',
    title: 'Anatomy - Brainstem & Circle of Willis (Neuroanatomy)',
    description: 'Medulla, pons, midbrain cross sections, ventricular system & arterial supply of cerebrum.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '11.2 MB',
    phase: '1st Phase',
    subject: 'Anatomy',
    term: '3rd Term',
    card: '6th Card'
  },

  // PHYSIOLOGY - 1st Term (Card 1 & Card 2)
  {
    id: 'l-phy-c1-1',
    title: 'Physiology - General Physiology & Transport Across Cell Membrane',
    description: 'Primary & secondary active transport, resting membrane potential & action potential.',
    date: '2026-08-16',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '5.1 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'l-phy-c1-2',
    title: 'Physiology - Blood & Immunity (Erythropoiesis & Hemostasis)',
    description: 'RBC maturation factors, blood grouping, coagulation cascade and platelets function.',
    date: '2026-08-22',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.9 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'l-phy-c2-1',
    title: 'Physiology - Cardiovascular System (Cardiac Cycle & ECG)',
    description: 'Phases of cardiac cycle, pressure-volume loops, normal ECG waves, vectors and intervals.',
    date: '2026-08-30',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '8.4 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'l-phy-c2-2',
    title: 'Physiology - Blood Pressure Regulation & Shock',
    description: 'Baroreceptors, chemoreceptors, RAAS pathway, microcirculation and pathophysiology of shock.',
    date: '2026-09-02',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '5.9 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '2nd Card'
  },

  // PHYSIOLOGY - 2nd Term (Card 3 & Card 4)
  {
    id: 'l-phy-c3-1',
    title: 'Physiology - Respiratory System (Mechanics & Gas Exchange)',
    description: 'Lung compliance, surfactant, ventilation-perfusion ratio, oxygen-hemoglobin dissociation curve.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '7.5 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '2nd Term',
    card: '3rd Card'
  },
  {
    id: 'l-phy-c4-1',
    title: 'Physiology - Gastrointestinal Tract (Secretions & Motility)',
    description: 'Gastric acid secretion mechanism, pancreatic juice, bile formation and intestinal motility.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.3 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '2nd Term',
    card: '4th Card'
  },

  // PHYSIOLOGY - 3rd Term (Card 5 & Card 6)
  {
    id: 'l-phy-c5-1',
    title: 'Physiology - Renal Physiology (GFR & Countercurrent Mechanism)',
    description: 'Glomerular filtration rate determinants, tubular reabsorption, and urine concentration mechanism.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '8.7 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '3rd Term',
    card: '5th Card'
  },
  {
    id: 'l-phy-c6-1',
    title: 'Physiology - Endocrine System (Pituitary & Thyroid Axis)',
    description: 'Feedback mechanisms, synthesis of thyroid hormones, parathyroid regulation of calcium.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '7.1 MB',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '3rd Term',
    card: '6th Card'
  },

  // BIOCHEMISTRY - 1st Term (Card 1 & Card 2)
  {
    id: 'l-bio-c1-1',
    title: 'Biochemistry - Biomolecules & Cell Biology',
    description: 'Structure and classification of carbohydrates, lipids, amino acids and nucleic acids.',
    date: '2026-08-18',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '5.2 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'l-bio-c1-2',
    title: 'Biochemistry - Enzymes & Clinical Enzymology',
    description: 'Michaelis-Menten kinetics, enzyme inhibition (reversible/irreversible), diagnostic enzyme markers.',
    date: '2026-08-25',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.0 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'l-bio-c2-1',
    title: 'Biochemistry - Carbohydrate Metabolism (Glycolysis & TCA Cycle)',
    description: 'Stepwise regulation of glycolysis, energetic yield, feeder pathways and Krebs cycle.',
    date: '2026-08-30',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '7.8 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'l-bio-c2-2',
    title: 'Biochemistry - Glycogenesis, Glycogenolysis & Gluconeogenesis',
    description: 'Hormonal regulation (insulin vs glucagon), G6PD deficiency and glycogen storage disorders.',
    date: '2026-09-02',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.2 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },

  // BIOCHEMISTRY - 2nd Term (Card 3 & Card 4)
  {
    id: 'l-bio-c3-1',
    title: 'Biochemistry - Lipid Metabolism & Beta Oxidation',
    description: 'Fatty acid activation, carnitine shuttle, beta oxidation energetics, ketone body metabolism.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.8 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '2nd Term',
    card: '3rd Card'
  },
  {
    id: 'l-bio-c4-1',
    title: 'Biochemistry - Protein Metabolism & Urea Cycle',
    description: 'Transamination, deamination, urea cycle enzymes, hyperammonemia and inborn errors of metabolism.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '5.9 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '2nd Term',
    card: '4th Card'
  },

  // BIOCHEMISTRY - 3rd Term (Card 5 & Card 6)
  {
    id: 'l-bio-c5-1',
    title: 'Biochemistry - Acid-Base Balance & Arterial Blood Gases (ABG)',
    description: 'Henderson-Hasselbalch equation, buffer systems, respiratory & metabolic acidosis and alkalosis.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '6.4 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '3rd Term',
    card: '5th Card'
  },
  {
    id: 'l-bio-c6-1',
    title: 'Biochemistry - Molecular Biology (Replication, Transcription & Translation)',
    description: 'DNA replication forks, RNA polymerase, genetic code, post-transcriptional processing & PCR basics.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '9.1 MB',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '3rd Term',
    card: '6th Card'
  },

  // TEXTBOOKS
  {
    id: 'b-1',
    title: 'BD Chaurasia\'s Human Anatomy - Volume 1 (Upper Limb & Thorax)',
    description: '8th Edition Regional and Applied Dissection and Clinical Anatomy.',
    date: '2026-08-10',
    type: 'book',
    fileUrl: '#',
    fileSize: '85 MB',
    phase: '1st Phase',
    subject: 'Anatomy'
  },
  {
    id: 'b-2',
    title: 'Guyton and Hall Textbook of Medical Physiology',
    description: '14th Edition PDF textbook for comprehensive physiology study.',
    date: '2026-08-10',
    type: 'book',
    fileUrl: '#',
    fileSize: '112 MB',
    phase: '1st Phase',
    subject: 'Physiology'
  },
  {
    id: 'b-3',
    title: 'Harper\'s Illustrated Biochemistry',
    description: '32nd Edition PDF for molecular biology and biochemical pathways.',
    date: '2026-08-15',
    type: 'book',
    fileUrl: '#',
    fileSize: '65 MB',
    phase: '1st Phase',
    subject: 'Biochemistry'
  }
];

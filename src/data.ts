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
  // BMDC Curriculums (Subject level - not in any term folder)
  {
    id: 'curriculum-biochemistry',
    title: 'Biochemistry BMDC Curriculum',
    description: 'Official Bangladesh Medical and Dental Council (BMDC) curriculum for 1st Phase MBBS Biochemistry.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://www.bmdc.org.bd/docs/curriculum/2021/5.Biochemistry.pdf',
    phase: '1st Phase',
    subject: 'Biochemistry'
  },
  {
    id: 'curriculum-anatomy',
    title: 'Anatomy BMDC Curriculum',
    description: 'Official Bangladesh Medical and Dental Council (BMDC) curriculum for 1st Phase MBBS Anatomy.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://www.bmdc.org.bd/docs/curriculum/2021/3.Anatomy.pdf',
    phase: '1st Phase',
    subject: 'Anatomy'
  },
  {
    id: 'curriculum-physiology',
    title: 'Physiology BMDC Curriculum',
    description: 'Official Bangladesh Medical and Dental Council (BMDC) curriculum for 1st Phase MBBS Physiology.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://www.bmdc.org.bd/docs/curriculum/2021/4.Physiology.pdf',
    phase: '1st Phase',
    subject: 'Physiology'
  },
  // BMDC Curriculums for Medical Textbooks section
  {
    id: 'book-curriculum-biochemistry',
    title: 'Biochemistry BMDC Curriculum',
    description: 'Official Bangladesh Medical and Dental Council (BMDC) curriculum for 1st Phase MBBS Biochemistry.',
    date: '2026-09-03',
    type: 'book',
    fileUrl: 'https://www.bmdc.org.bd/docs/curriculum/2021/5.Biochemistry.pdf',
    phase: '1st Phase',
    subject: 'Biochemistry'
  },
  {
    id: 'book-curriculum-anatomy',
    title: 'Anatomy BMDC Curriculum',
    description: 'Official Bangladesh Medical and Dental Council (BMDC) curriculum for 1st Phase MBBS Anatomy.',
    date: '2026-09-03',
    type: 'book',
    fileUrl: 'https://www.bmdc.org.bd/docs/curriculum/2021/3.Anatomy.pdf',
    phase: '1st Phase',
    subject: 'Anatomy'
  },
  {
    id: 'book-curriculum-physiology',
    title: 'Physiology BMDC Curriculum',
    description: 'Official Bangladesh Medical and Dental Council (BMDC) curriculum for 1st Phase MBBS Physiology.',
    date: '2026-09-03',
    type: 'book',
    fileUrl: 'https://www.bmdc.org.bd/docs/curriculum/2021/4.Physiology.pdf',
    phase: '1st Phase',
    subject: 'Physiology'
  },

  // 1st Term Card 01 Lectures
  {
    id: 'bio-t1-c1-item01',
    title: 'Item 01',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/4',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-item02',
    title: 'Item 02',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/5',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-item03',
    title: 'Item 03',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/6',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-item04',
    title: 'Item 04',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/7',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-item05',
    title: 'Item 05',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/8',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-item06',
    title: 'Item 06',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/9',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-item07',
    title: 'Item 07',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/10',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-item08',
    title: 'Item 08',
    description: 'Biochemistry 1st Term Card-01 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/11',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-written',
    title: 'Card written questions',
    description: 'Biochemistry 1st Term Card-01 written questions and question bank.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/13',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'bio-t1-c1-viva',
    title: 'Card viva questions',
    description: 'Biochemistry 1st Term Card-01 viva questions and examiner high-yield topics.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem1ewmc/14',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '1st Card'
  },

  // 1st Term Card 02 Lectures
  {
    id: 'bio-t1-c2-item01',
    title: 'Item 01',
    description: 'Biochemistry 1st Term Card-02 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/2',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'bio-t1-c2-item02',
    title: 'Item 02',
    description: 'Biochemistry 1st Term Card-02 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/3',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'bio-t1-c2-item03',
    title: 'Item 03',
    description: 'Biochemistry 1st Term Card-02 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/4',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'bio-t1-c2-item04',
    title: 'Item 04',
    description: 'Biochemistry 1st Term Card-02 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/5',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'bio-t1-c2-item05',
    title: 'Item 05',
    description: 'Biochemistry 1st Term Card-02 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/6',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'bio-t1-c2-item06',
    title: 'Item 06',
    description: 'Biochemistry 1st Term Card-02 lecture material & item study resources.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/7',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'bio-t1-c2-viva',
    title: 'Card viva questions',
    description: 'Biochemistry 1st Term Card-02 viva questions and examiner high-yield topics.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/8',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },
  {
    id: 'bio-t1-c2-written',
    title: 'Card written questions',
    description: 'Biochemistry 1st Term Card-02 written questions and question bank.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/biochem2ewmc/9',
    phase: '1st Phase',
    subject: 'Biochemistry',
    term: '1st Term',
    card: '2nd Card'
  },

  // PHYSIOLOGY - 1st Term Card 01 Lectures
  {
    id: 'phy-t1-c1-homeostasis',
    title: 'Homeostasis',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Homeostasis.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/2',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-cell',
    title: 'Cell',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Cell physiology.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/3',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-membrane-potential',
    title: 'Membrane potential',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Resting & Action Membrane Potential.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/4',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-membrane-transport',
    title: 'Membrane transport',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Membrane Transport mechanisms.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/5',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-blood',
    title: 'Blood',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Blood composition & functions.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/6',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-rbc',
    title: 'RBC',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Red Blood Cells & Erythropoiesis.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/7',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-wbc',
    title: 'WBC',
    description: 'Physiology 1st Term Card-01 lecture material & notes on White Blood Cells & Leukopoiesis.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/8',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-platelet',
    title: 'Platelet',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Platelets & Hemostasis.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/9',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-anemia',
    title: 'Anemia',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Anemia classification & pathophysiology.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/10',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-nmj',
    title: 'Neuromuscular junction',
    description: 'Physiology 1st Term Card-01 lecture material & notes on Neuromuscular Junction transmission.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/11',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  },
  {
    id: 'phy-t1-c1-blood-grouping',
    title: 'Blood grouping',
    description: 'Physiology 1st Term Card-01 lecture material & notes on ABO & Rh Blood Grouping.',
    date: '2026-09-03',
    type: 'lecture',
    fileUrl: 'https://t.me/physiology1ewmc/12',
    phase: '1st Phase',
    subject: 'Physiology',
    term: '1st Term',
    card: '1st Card'
  }
];


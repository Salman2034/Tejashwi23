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
  {
    id: '1',
    title: 'Anatomy - Upper Limb Notes',
    description: 'Handwritten notes and presentation slides covering the upper limb.',
    date: '2026-08-28',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '4.2 MB',
    phase: '1st Phase',
    subject: 'Anatomy'
  },
  {
    id: '2',
    title: 'Physiology - Cardiovascular System',
    description: 'Detailed slides on CVS and hemodynamics.',
    date: '2026-08-25',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '8.1 MB',
    phase: '1st Phase',
    subject: 'Physiology'
  },
  {
    id: '3',
    title: 'Biochemistry - Carbohydrate Metabolism',
    description: 'Lecture notes covering glycolysis, Krebs cycle, and related pathways.',
    date: '2026-08-20',
    type: 'lecture',
    fileUrl: '#',
    fileSize: '5.5 MB',
    phase: '1st Phase',
    subject: 'Biochemistry'
  },
  {
    id: '4',
    title: 'Guyton and Hall Textbook of Medical Physiology',
    description: '14th Edition PDF for reference.',
    date: '2026-08-10',
    type: 'book',
    fileUrl: '#',
    fileSize: '112 MB',
    phase: '1st Phase',
    subject: 'Physiology'
  },
  {
    id: '5',
    title: 'BD Chaurasia\'s Human Anatomy',
    description: 'Volume 1 - Upper Limb & Thorax',
    date: '2026-08-10',
    type: 'book',
    fileUrl: '#',
    fileSize: '85 MB',
    phase: '1st Phase',
    subject: 'Anatomy'
  },
  {
    id: '6',
    title: 'Harper\'s Illustrated Biochemistry',
    description: '32nd Edition PDF for reference.',
    date: '2026-08-15',
    type: 'book',
    fileUrl: '#',
    fileSize: '65 MB',
    phase: '1st Phase',
    subject: 'Biochemistry'
  }
];

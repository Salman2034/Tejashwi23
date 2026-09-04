import { Phase, GalleryGroup, GalleryImage } from '../types';

export type { GalleryGroup, GalleryImage };

export const galleryGroups: GalleryGroup[] = [
  {
    id: 'freshers',
    title: "Fresher's Reception",
    description: 'Welcome ceremony for the 23rd Batch',
    coverImage: '/gallery/FB_IMG_1788480064015.jpg',
    phase: '1st Phase',
    images: [
      { id: 'f1', src: '/gallery/FB_IMG_1788480064015.jpg', alt: "Fresher's Reception - Image 1", caption: 'Welcome Ceremony' },
      { id: 'f2', src: '/gallery/FB_IMG_1788480061444.jpg', alt: "Fresher's Reception - Image 2", caption: 'Batch Group Photo' },
      { id: 'f3', src: '/gallery/FB_IMG_1788480058096.jpg', alt: "Fresher's Reception - Image 3", caption: "Fresher's Event" }
    ]
  },
  {
    id: 'integrated-teaching',
    title: 'Integrated Teaching',
    description: 'Integrated teaching sessions and clinical discussions',
    coverImage: '/gallery/IMG_20260904_062500_582.jpg',
    phase: '1st Phase',
    images: [
      { id: 'it1', src: '/gallery/IMG_20260904_062500_582.jpg', alt: 'Integrated Teaching Session 1', caption: 'Integrated Teaching Session' },
      { id: 'it2', src: '/gallery/IMG_20260904_062505_469.jpg', alt: 'Integrated Teaching Session 2', caption: 'Interactive Discussion' },
      { id: 'it3', src: '/gallery/IMG_20260904_062512_591.jpg', alt: 'Integrated Teaching Session 3', caption: 'Batch Presentation' },
      { id: 'it4', src: '/gallery/IMG_20260904_062519_366.jpg', alt: 'Integrated Teaching Session 4', caption: 'Clinical Case Analysis' },
      { id: 'it5', src: '/gallery/IMG_20260904_062527_589.jpg', alt: 'Integrated Teaching Session 5', caption: 'Classroom Lecture' },
      { id: 'it6', src: '/gallery/IMG_20260904_062547_220.jpg', alt: 'Integrated Teaching Session 6', caption: 'Faculty & Student Discussion' },
      { id: 'it7', src: '/gallery/IMG_20260904_062608_398.jpg', alt: 'Integrated Teaching Session 7', caption: 'Topic Deliberation' },
      { id: 'it8', src: '/gallery/IMG_20260904_062646_312.jpg', alt: 'Integrated Teaching Session 8', caption: 'Group Review' },
      { id: 'it9', src: '/gallery/IMG_20260904_062658_519.jpg', alt: 'Integrated Teaching Session 9', caption: 'Session Highlights' },
      { id: 'it10', src: '/gallery/IMG_20260904_062717_550.jpg', alt: 'Integrated Teaching Session 10', caption: 'Academic Session' },
      { id: 'it11', src: '/gallery/IMG_20260904_062723_682.jpg', alt: 'Integrated Teaching Session 11', caption: 'Classroom Interaction' },
      { id: 'it12', src: '/gallery/IMG_20260904_062729_846.jpg', alt: 'Integrated Teaching Session 12', caption: 'Student Participation' },
      { id: 'it13', src: '/gallery/IMG_20260904_062821_748.jpg', alt: 'Integrated Teaching Session 13', caption: 'Integrated Learning' }
    ]
  }
];

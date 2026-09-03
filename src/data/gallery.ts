export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryGroup {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  images: GalleryImage[];
}

export const galleryGroups: GalleryGroup[] = [
  {
    id: 'clinical',
    title: 'Clinical Skills Lab',
    description: 'Practicing fundamental medical procedures',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?auto=format&fit=crop&q=80',
    images: [
      { id: 'c1', src: 'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?auto=format&fit=crop&q=80', alt: 'Students in lab', caption: 'Anatomy Lab' },
      { id: 'c2', src: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80', alt: 'Medical equipment', caption: 'Microscopes' },
      { id: 'c3', src: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80', alt: 'Lab setup', caption: 'Biochemistry Practical' }
    ]
  },
  {
    id: 'hospital',
    title: 'Hospital Postings',
    description: 'Real-world experience in the wards',
    coverImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80',
    images: [
      { id: 'h1', src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80', alt: 'Hospital Ward', caption: 'Morning Ward Round' },
      { id: 'h2', src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80', alt: 'Hospital Corridor', caption: 'Emergency Duty' }
    ]
  },
  {
    id: 'study',
    title: 'Study Sessions',
    description: 'Late nights and library days',
    coverImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80',
    images: [
      { id: 's1', src: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80', alt: 'Stethoscope and notes', caption: 'Group Study' },
      { id: 's2', src: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80', alt: 'Library', caption: 'Central Library' }
    ]
  },
  {
    id: 'events',
    title: 'Campus Events',
    description: 'Cultural programs and celebrations',
    coverImage: 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&q=80',
    images: [
      { id: 'e1', src: 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&q=80', alt: 'Event audience', caption: 'Cultural Night' },
      { id: 'e2', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80', alt: 'Auditorium', caption: 'Fresher Reception' }
    ]
  }
];

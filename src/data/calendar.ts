export type EventType = 'exam' | 'holiday' | 'academic' | 'other';

export interface CalendarEvent {
  id: string;
  date: number; // approximate start day for sorting
  displayDate: string; // The exact string from the image, e.g., "4th week of May, 2026"
  title: string;
  type: EventType;
  description?: string;
}

export interface MonthCalendar {
  monthIndex: number;
  monthName: string;
  year: number;
  events: CalendarEvent[];
}

export const academicCalendar: MonthCalendar[] = [
  { year: 2026, monthIndex: 4, monthName: 'May', events: [
      { id: '1', date: 3, displayDate: '3rd May, 2026', title: "Fresher's reception", type: 'other' },
      { id: '2', date: 5, displayDate: '5th May, 2026', title: "Class start", type: 'academic' },
      { id: '3', date: 5, displayDate: '5th May, 2026 to 4th week of September, 2026', title: "1st Term", type: 'academic' },
      { id: '4', date: 8, displayDate: '2nd & 3rd Week of May, 2026', title: "Generic topics", type: 'academic' },
      { id: '5', date: 22, displayDate: '4th week of May, 2026', title: "Eid-Ul-Azha", type: 'holiday' }
  ]},
  { year: 2026, monthIndex: 5, monthName: 'June', events: [
      { id: '6', date: 23, displayDate: '23rd June, 2026 to 2nd July, 2026', title: "1st card final", type: 'exam' }
  ]},
  { year: 2026, monthIndex: 6, monthName: 'July', events: [
      { id: '7', date: 5, displayDate: '5th July, 2026 to 7th July, 2026', title: "Feedback Classes of 1st card", type: 'academic' },
      { id: '8', date: 8, displayDate: '8th & 9th July, 2026', title: "Integrated teaching", type: 'academic' },
      { id: '9', date: 26, displayDate: '26th July, 2026', title: "Ashura", type: 'holiday' }
  ]},
  { year: 2026, monthIndex: 7, monthName: 'August', events: [
      { id: '10', date: 5, displayDate: '5th August, 2026', title: "July Mass uprising day", type: 'holiday' },
      { id: '11', date: 12, displayDate: '12th & 13th August, 2026', title: "Integrated teaching", type: 'academic' },
      { id: '12', date: 26, displayDate: '26th August, 2026', title: "Eid-E-Milad-Un-Nobi", type: 'holiday' },
      { id: '13', date: 29, displayDate: '29th August to 31st August 2026', title: "2nd card final", type: 'exam' }
  ]},
  { year: 2026, monthIndex: 8, monthName: 'September', events: [
      { id: '14', date: 1, displayDate: '1st September to 3rd September, 2026', title: "Feedback class of 2nd card", type: 'academic' },
      { id: '15', date: 4, displayDate: '4th September, 2026', title: "Srikrishna Janmashtami", type: 'holiday' },
      { id: '16', date: 4, displayDate: '4th September to 11th September, 2026', title: "Preparatory leave for 1st term", type: 'holiday' },
      { id: '17', date: 12, displayDate: '12th September to 26th September, 2026', title: "1st term final examination", type: 'exam' },
      { id: '18', date: 27, displayDate: '27th September to 3rd October, 2026', title: "Post term leave", type: 'holiday' }
  ]},
  { year: 2026, monthIndex: 9, monthName: 'October', events: [
      { id: '19', date: 1, displayDate: '1st week of October, 2026 to 2nd week of April, 2027', title: "2nd Term", type: 'academic' },
      { id: '20', date: 4, displayDate: '4th October to 6th October, 2026', title: "Feedback Class of 1st term exam", type: 'academic' },
      { id: '21', date: 17, displayDate: '17th October, 2026', title: "Parents meeting", type: 'other' },
      { id: '22', date: 20, displayDate: '20th October & 21st October, 2026', title: "Durga puja", type: 'holiday' }
  ]},
  { year: 2026, monthIndex: 10, monthName: 'November', events: [
      { id: '23', date: 10, displayDate: '10th & 11th November, 2026', title: "Integrated teaching", type: 'academic' }
  ]},
  { year: 2026, monthIndex: 11, monthName: 'December', events: [
      { id: '24', date: 16, displayDate: '16th December, 2026', title: "Victory day", type: 'holiday' },
      { id: '25', date: 25, displayDate: '25th December, 2026', title: "Christmas day", type: 'holiday' }
  ]},
  { year: 2027, monthIndex: 0, monthName: 'January', events: [
      { id: '26', date: 2, displayDate: '2nd January to 4th January, 2027', title: "3rd card final", type: 'exam' },
      { id: '27', date: 9, displayDate: '9th January to 11th January, 2027', title: "Feedback Class of 3rd card", type: 'academic' },
      { id: '28', date: 24, displayDate: '24th January, 2027', title: "Sab-e-barat", type: 'holiday' }
  ]},
  { year: 2027, monthIndex: 1, monthName: 'February', events: [
      { id: '29', date: 2, displayDate: '2nd & 3rd February, 2027', title: "Integrated teaching", type: 'academic' },
      { id: '30', date: 21, displayDate: '21st February, 2027', title: "Mothers Language Day", type: 'holiday' }
  ]},
  { year: 2027, monthIndex: 2, monthName: 'March', events: [
      { id: '31', date: 1, displayDate: '1st March to 3rd March, 2027', title: "4th card final", type: 'exam' },
      { id: '32', date: 3, displayDate: '1st week of March to 2nd week of March, 2027', title: "Eid-Ul-Fitor", type: 'holiday' },
      { id: '33', date: 14, displayDate: '14th March to 16th March, 2027', title: "Feedback Class of 4th Card", type: 'academic' },
      { id: '34', date: 17, displayDate: '17th March to 23rd March, 2027', title: "Preparatory leave for 2nd term", type: 'holiday' },
      { id: '35', date: 24, displayDate: '24th March to 8th April, 2027', title: "2nd term final examination", type: 'exam' }
  ]},
  { year: 2027, monthIndex: 3, monthName: 'April', events: [
      { id: '36', date: 9, displayDate: '9th April to 16th April, 2027', title: "Post term leave", type: 'holiday' },
      { id: '37', date: 15, displayDate: '3rd week of April to 4th week of September, 2027', title: "3rd term", type: 'academic' },
      { id: '38', date: 17, displayDate: '17th April to 19th April, 2027', title: "Feedback Class of 2nd term exam", type: 'academic' },
      { id: '39', date: 24, displayDate: '24th April, 2027', title: "Parents meeting", type: 'other' },
      { id: '40', date: 24, displayDate: '24th April to 30th April, 2027', title: "Cultural week", type: 'other' }
  ]},
  { year: 2027, monthIndex: 4, monthName: 'May', events: [
      { id: '41', date: 1, displayDate: '1st May, 2027', title: "May Dibosh", type: 'holiday' },
      { id: '42', date: 8, displayDate: '2nd & 3rd week of May, 2027', title: "Eid-Ul-Azha", type: 'holiday' }
  ]},
  { year: 2027, monthIndex: 5, monthName: 'June', events: [
      { id: '43', date: 8, displayDate: '8th, 9th, 29th & 30th June, 2027', title: "Integrated teaching", type: 'academic' },
      { id: '44', date: 15, displayDate: '15th June, 2027', title: "Ashura", type: 'holiday' }
  ]},
  { year: 2027, monthIndex: 6, monthName: 'July', events: [
      { id: '45', date: 3, displayDate: '3rd July to 5th July, 2027', title: "5th Card final", type: 'exam' },
      { id: '46', date: 12, displayDate: '12th July to 14th July, 2027', title: "Feedback Class of 5th card", type: 'academic' }
  ]},
  { year: 2027, monthIndex: 7, monthName: 'August', events: [
      { id: '47', date: 5, displayDate: '5th August, 2027', title: "July Mass uprising day", type: 'holiday' },
      { id: '48', date: 15, displayDate: '15th August, 2027', title: "Eid-E-Milad-Un-Nobi", type: 'holiday' },
      { id: '49', date: 24, displayDate: '24th August, 2027', title: "Srikrishna Janmashtami", type: 'holiday' },
      { id: '50', date: 29, displayDate: '29th August to 31st August, 2027', title: "6th card final", type: 'exam' }
  ]},
  { year: 2027, monthIndex: 8, monthName: 'September', events: [
      { id: '51', date: 1, displayDate: '1st week of September, 2027', title: "Preparatory leave for 3rd term", type: 'holiday' },
      { id: '52', date: 8, displayDate: '2nd & 3rd week of September, 2027', title: "3rd term final examination", type: 'exam' },
      { id: '53', date: 26, displayDate: '26th September to 28th September, 2027', title: "Feedback Class of 3rd term exam", type: 'academic' },
      { id: '54', date: 30, displayDate: '30th September, 2027', title: "Parents meeting", type: 'other' }
  ]},
  { year: 2027, monthIndex: 9, monthName: 'October', events: [
      { id: '55', date: 1, displayDate: '1st week of October, 2027', title: "Clearance for 1st professional exam", type: 'academic' },
      { id: '56', date: 1, displayDate: '1st to 31st October, 2027', title: "Preparatory leave for 1st professional exam", type: 'holiday' },
      { id: '57', date: 10, displayDate: '10th October, 2027', title: "Durga Puja", type: 'holiday' }
  ]},
  { year: 2027, monthIndex: 10, monthName: 'November', events: [
      { id: '58', date: 1, displayDate: 'November - December, 2027', title: "1st professional exam", type: 'exam' }
  ]}
];

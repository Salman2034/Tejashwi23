export type PeriodType = 'lecture' | 'tutorial' | 'break';

export interface BatchDetail {
  batch: string;
  details: string;
}

export interface Period {
  id: string;
  time: string;
  type: PeriodType;
  title?: string; // For lectures
  teacher?: string; // For lectures
  location?: string; // For lectures
  batches?: BatchDetail[]; // For tutorials
}

export interface DayRoutine {
  day: string;
  isHoliday: boolean;
  periods: Period[];
}

export const weeklyRoutine: DayRoutine[] = [
  {
    day: 'Saturday',
    isHoliday: false,
    periods: [
      {
        id: 'sat-1',
        time: '08.00 am to 10.00 am',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Histology /Tut./Lab.-401' },
          { batch: 'B', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'C', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'D', details: 'Ana.Demo/Diss-2/Tut.-406' },
          { batch: 'E', details: 'Ana.Demo/ Diss/museum-407' }
        ]
      },
      {
        id: 'sat-2',
        time: '10.00 am to 11.00 am',
        type: 'lecture',
        title: 'Anatomy',
        teacher: 'Dr. Zannatul Ferdous',
        location: 'Gallery - 01'
      },
      {
        id: 'sat-3',
        time: '11.00 am to 12.00 noon',
        type: 'lecture',
        title: 'Physiology',
        teacher: 'Prof. Dr. Fayeza Karim',
        location: 'Gallery - 01'
      },
      {
        id: 'sat-4',
        time: '12.00 noon to 12.30 pm',
        type: 'break',
        title: 'Break'
      },
      {
        id: 'sat-5',
        time: '12.30 pm to 2.30 pm',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Physiology Tut.-08' },
          { batch: 'B', details: 'Biochemistry Tut.-09' },
          { batch: 'C', details: 'Physiology Tut.- 10' },
          { batch: 'D', details: 'Biochemistry Pract. Lab-517' },
          { batch: 'E', details: 'Physiology Prac. Lab-418' }
        ]
      }
    ]
  },
  {
    day: 'Sunday',
    isHoliday: false,
    periods: [
      {
        id: 'sun-1',
        time: '08.00 am to 10.00 am',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Biochemistry Tut.-08' },
          { batch: 'B', details: 'Physiology Tut.-09' },
          { batch: 'C', details: 'Biochemistry Tut.-10' },
          { batch: 'D', details: 'Physiology Lab.-418' },
          { batch: 'E', details: 'Biochemistry Lab.-517' }
        ]
      },
      {
        id: 'sun-2',
        time: '10.00 am to 11.00 am',
        type: 'lecture',
        title: 'Biochemistry',
        teacher: 'Dr. Nazma Akther',
        location: 'Gallery - 01'
      },
      {
        id: 'sun-3',
        time: '11.00 am to 12.00 noon',
        type: 'lecture',
        title: 'Anatomy',
        teacher: 'Prof. Dr. Rubina Qusim',
        location: 'Gallery - 01'
      },
      {
        id: 'sun-4',
        time: '12.00 noon to 12.30 pm',
        type: 'break',
        title: 'Break'
      },
      {
        id: 'sun-5',
        time: '12.30 pm to 2.30 pm',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Ana.Demo/Diss-1/Tut.405' },
          { batch: 'B', details: 'Histology /Tut./Lab.-401' },
          { batch: 'C', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'D', details: 'Ana.Demo/Diss-2/Tut.-406' },
          { batch: 'E', details: 'Ana.Demo/ Diss/museum-407' }
        ]
      }
    ]
  },
  {
    day: 'Monday',
    isHoliday: false,
    periods: [
      {
        id: 'mon-1',
        time: '08.00 am to 10.00 am',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Ana. Demo./Lab.-401' },
          { batch: 'B', details: 'Ana.Demo/Diss-1/Tut.405' },
          { batch: 'C', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'D', details: 'Ana.Demo/Diss-2/Tut.-406' },
          { batch: 'E', details: 'Ana.Demo/ Diss/museum-407' }
        ]
      },
      {
        id: 'mon-2',
        time: '10.00 am to 11.00 am',
        type: 'lecture',
        title: 'Biochemistry',
        teacher: 'Prof. Dr. Farzana Shirin',
        location: 'Gallery - 01'
      },
      {
        id: 'mon-3',
        time: '11.00 am to 12.00 noon',
        type: 'lecture',
        title: 'Anatomy',
        teacher: 'Prof. Dr. Hasna Hena',
        location: 'Gallery - 01'
      },
      {
        id: 'mon-4',
        time: '12.00 noon to 12.30 pm',
        type: 'break',
        title: 'Break'
      },
      {
        id: 'mon-5',
        time: '12.30 pm to 2.30 pm',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Physiology Lab.-418' },
          { batch: 'B', details: 'Biochemistry Prac.Lab-517' },
          { batch: 'C', details: 'Physiology Tut.-08' },
          { batch: 'D', details: 'Biochemistry Tut.-09' },
          { batch: 'E', details: 'Physiology Tut.-10' }
        ]
      }
    ]
  },
  {
    day: 'Tuesday',
    isHoliday: false,
    periods: [
      {
        id: 'tue-1',
        time: '08.00 am to 10.00 am',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Biochemistry Lab.-517' },
          { batch: 'B', details: 'Physiology Lab.-418' },
          { batch: 'C', details: 'Biochemistry Tut.-08' },
          { batch: 'D', details: 'Physiology Tut.-09' },
          { batch: 'E', details: 'Biochemistry Tut-10' }
        ]
      },
      {
        id: 'tue-2',
        time: '10.00 am to 11.00 am',
        type: 'lecture',
        title: 'Biochemistry',
        teacher: 'Prof. Dr. Sonia Ishrat',
        location: 'Gallery - 01'
      },
      {
        id: 'tue-3',
        time: '11.00 am to 12.00 noon',
        type: 'lecture',
        title: 'Physiology',
        teacher: 'Dr. Afreen Ferdous',
        location: 'Gallery - 01'
      },
      {
        id: 'tue-4',
        time: '12.00 noon to 12.30 pm',
        type: 'break',
        title: 'Break'
      },
      {
        id: 'tue-5',
        time: '12.30 pm to 2.30 pm',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'B', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'C', details: 'Histology /Tut./Lab.-401' },
          { batch: 'D', details: 'Ana.Demo/Diss-2/Tut.-406' },
          { batch: 'E', details: 'Ana.Demo/ Diss/museum-407' }
        ]
      }
    ]
  },
  {
    day: 'Wednesday',
    isHoliday: false,
    periods: [
      {
        id: 'wed-1',
        time: '08.00 am to 10.00 am',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Ana.Demo/Diss-2/Tut.-406' },
          { batch: 'B', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'C', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'D', details: 'Histology /Tut./Lab.-401' },
          { batch: 'E', details: 'Ana.Demo/ Diss/museum-407' }
        ]
      },
      {
        id: 'wed-2',
        time: '10.00 am to 11.00 am',
        type: 'lecture',
        title: 'Physiology',
        teacher: 'Prof. Dr. Fayeza Karim',
        location: 'Gallery - 01'
      },
      {
        id: 'wed-3',
        time: '11.00 am to 12.00 noon',
        type: 'lecture',
        title: 'Biochemistry',
        teacher: 'Prof. Dr. Farzana Shirin\nProf. Dr. Sonia Ishrat\nDr. Nazma Akther',
        location: 'Gallery - 01'
      },
      {
        id: 'wed-4',
        time: '12.00 noon to 12.30 pm',
        type: 'break',
        title: 'Break'
      },
      {
        id: 'wed-5',
        time: '12.30 pm to 2.30 pm',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Physiology Tut.-08' },
          { batch: 'B', details: 'Biochemistry Tut.-09' },
          { batch: 'C', details: 'Physiology Pract. Lab-418' },
          { batch: 'D', details: 'Biochemistry Tut.-517' },
          { batch: 'E', details: 'Physiology Tut.-10' }
        ]
      }
    ]
  },
  {
    day: 'Thursday',
    isHoliday: false,
    periods: [
      {
        id: 'thu-1',
        time: '08.00 am to 10.00 am',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Biochemistry Tut.-08.' },
          { batch: 'B', details: 'Physiology Tut.-09' },
          { batch: 'C', details: 'Biochemistry Lab-517' },
          { batch: 'D', details: 'Physiology Tut.- 10' },
          { batch: 'E', details: 'Biochemistry Tut.-418' }
        ]
      },
      {
        id: 'thu-2',
        time: '10.00 am to 11.00 am',
        type: 'lecture',
        title: 'Physiology',
        teacher: 'Dr. Israt Jahan Sumi',
        location: 'Gallery - 01'
      },
      {
        id: 'thu-3',
        time: '11.00 am to 12.00 noon',
        type: 'lecture',
        title: 'Anatomy',
        teacher: 'Prof. Dr. Md. Enayetullah',
        location: 'Gallery - 01'
      },
      {
        id: 'thu-4',
        time: '12.00 noon to 12.30 pm',
        type: 'break',
        title: 'Break'
      },
      {
        id: 'thu-5',
        time: '12.30 pm to 2.30 pm',
        type: 'tutorial',
        batches: [
          { batch: 'A', details: 'Ana.Demo/ Diss/museum-407' },
          { batch: 'B', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'C', details: 'Ana.Demo/Diss-1/Tut.-405' },
          { batch: 'D', details: 'Ana.Demo/Diss-2/Tut.-406' },
          { batch: 'E', details: 'Histology /Tut./Lab.-401' }
        ]
      }
    ]
  },
  {
    day: 'Friday',
    isHoliday: true,
    periods: []
  }
];

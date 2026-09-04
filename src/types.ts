export type ResourceType = 'lecture' | 'book';
export type Phase = '1st Phase' | '2nd Phase' | '3rd Phase' | '4th Phase';
export type Term = '1st Term' | '2nd Term' | '3rd Term';
export type Card = '1st Card' | '2nd Card' | '3rd Card' | '4th Card' | '5th Card' | '6th Card';

export interface Resource {
  id: string;
  title: string;
  description: string;
  date: string;
  type: ResourceType;
  fileUrl: string;
  fileSize?: string;
  phase: Phase;
  subject: string;
  term?: Term;
  card?: Card;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

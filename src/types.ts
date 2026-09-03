export type ResourceType = 'lecture' | 'book';
export type Phase = '1st Phase' | '2nd Phase' | '3rd Phase' | '4th Phase';

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
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

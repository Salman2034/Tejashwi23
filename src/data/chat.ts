export interface ChatMessage {
  id: string;
  senderName: string;
  rollNumber?: string;
  role?: 'student' | 'cr' | 'admin';
  text: string;
  timestamp: number;
  channel: 'batch' | 'academic' | 'casual';
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    senderName: 'Salman Sami',
    rollNumber: '01',
    role: 'cr',
    text: 'Welcome to Tejashwi 23 Batch Discussion! Feel free to ask questions about today’s class, routines, or exams.',
    timestamp: Date.now() - 1000 * 60 * 180,
    channel: 'batch'
  },
  {
    id: 'msg-welcome-2',
    senderName: 'Batchmate',
    rollNumber: '14',
    role: 'student',
    text: 'Has anyone downloaded the Physiology hematology slides for tomorrow?',
    timestamp: Date.now() - 1000 * 60 * 95,
    channel: 'academic'
  },
  {
    id: 'msg-welcome-3',
    senderName: 'Salman Sami',
    rollNumber: '01',
    role: 'cr',
    text: 'Yes! They are already updated in the Lectures tab under 1st Term Physiology.',
    timestamp: Date.now() - 1000 * 60 * 45,
    channel: 'academic'
  }
];

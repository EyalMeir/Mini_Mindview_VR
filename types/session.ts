export interface Session {
  session_id: string;
  status: 'new' | 'connecting' | 'connected';
  created_at: number;
} 
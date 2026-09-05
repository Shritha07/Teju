export type AIState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'responding'
  | 'typing';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  pinned?: boolean;
  streaming?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  icon: string;
  timestamp: number;
}

export interface SystemStats {
  cpu: number;
  ram: number;
  network: number;
  gpu: number;
}

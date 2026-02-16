
export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  visitorNumber: number;
  isWinner: boolean;
  timestamp: string;
}

export enum AppView {
  WELCOME = 'welcome',
  FORM = 'form',
  RESULT = 'result',
  ADMIN = 'admin'
}

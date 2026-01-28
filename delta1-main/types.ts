export enum Page {
  Dashboard = 'Dashboard',
  ServicePosts = 'Postos de Serviço',
  Monitoring = 'Monitoramento',
  AlertaVigia = 'Alerta Vigia',
  Reports = 'Relatórios',
}

export interface Company {
  id: number;
  logo: string;
  name: string;
  cnpj: string;
  email: string;
  whatsapp: string;
  location: string;
  username: string;
  password: string;
  postCount: number;
  blocked: boolean;
}

export interface ServicePost {
  id: number;
  companyId: number;
  companyLogo: string;
  companyName: string;
  name: string;
  location: string;
  blocked: boolean;
  password: string;
  last_heartbeat?: string | null;
}

export enum EventType {
  GatehouseOnline = 'Portaria Online',
  GatehouseOffline = 'Portaria Offline',
  PanicButton = 'Botão de Pânico',
  VigilantFailure = 'Vigia Adormeceu',
  SystemActivated = 'Sistema Ativado',
  SystemDeactivated = 'Sistema Desativado',
  LocalSemInternet = 'Sem Comunicação',
  PowerConnected = 'Fonte Conectada',
  PowerDisconnected = 'Fonte Desconectada',
}

export enum EventStatus {
  Unresolved = 'Não Resolvido',
  Resolved = 'Resolvido',
}

export interface MonitoringEvent {
  id: number;
  postId: number;
  postName: string;
  type: EventType;
  timestamp: Date;
  status: EventStatus;
  comment?: string;
}

export interface AlertaVigiaConfig {
  activationTime: string;
  deactivationTime: string;
  progressDurationMinutes: number;
  alertSoundSeconds: number;
}

export interface OfflineEvent {
  postId: number;
  type: EventType;
  timestamp: string; // Store as ISO string for JSON compatibility
}
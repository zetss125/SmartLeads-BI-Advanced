export interface NormalizedLead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  platform: string;
  signals: string[];
  urgency: string;
  date: string;
  behavioralSentence: string;
  score?: number;
  priority?: "High" | "Medium" | "Low";
  contacted?: boolean;
}

export interface ColumnMapping {
  name: string;
  email: string;
  phone: string;
  platform: string;
  signals: string;
  urgency: string;
  date: string;
}

export interface ChatAction {
  type: "FILTER" | "UPDATE_STATUS" | "RESET_FILTERS" | "NONE";
  payload?: any;
}

export interface ChatResponse {
  message: string;
  actions: ChatAction[];
}

export interface MarketingTask {
  id: string;
  assignee: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export interface MarketingStrategyResponse {
  strategy: string;
  tasks: MarketingTask[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'destructive';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto-executed';
export type AgentType = 'strategy' | 'execution' | 'design' | 'code' | 'research' | 'sales';

export interface AgentResponse {
  agent: AgentType;
  reasoningSummary: string;
  proposedActions: string[];
  requiredTools: string[];
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  result?: string;
}

export interface ApprovalItem {
  id: string;
  command: string;
  agentResponse: AgentResponse;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  actor: string;
  editedAction?: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  actor: string;
  agent: AgentType;
  toolUsed: string;
  sourceData: string;
  proposedAction: string;
  approvalStatus: ApprovalStatus;
  executionResult: string;
  errorMessage?: string;
}

export interface MemoryEntry {
  id: string;
  type: 'preference' | 'tool' | 'project' | 'person' | 'company' | 'commitment' | 'workflow' | 'decision' | 'execution';
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedTool {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  apiKey?: string;
  metadata: Record<string, unknown>;
}

export interface OrchestratorRunRequest {
  command: string;
  actor: string;
  source?: 'web' | 'slack' | 'telegram' | 'cron' | 'voice';
}

export interface OrchestratorRunResponse {
  success: boolean;
  approvalItem?: ApprovalItem;
  log?: ExecutionLog;
  error?: string;
}

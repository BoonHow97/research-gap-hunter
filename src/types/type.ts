export interface FileData {
  file: File;
  base64: string;
  mimeType: string;
}

export interface Proposal {
  title: string;
  abstract: string;
  methodology: string;
}

export interface AnalysisResult {
  gapAnalysis: string;
  proposal: Proposal;
  mermaidCode: string;
}

export interface AnalysisState {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
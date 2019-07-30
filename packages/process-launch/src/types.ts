import { SpawnOptions } from 'child_process';

export interface ProcessDefinitions {
  [processName: string]: ProcessDefinition;
}

export interface ProcessDefinition {
  args: string[];
  command: string;
  options?: SpawnOptions;
}

export interface ProcessGroupDefinitions {
  default: string[];
  [processGroupName: string]: string[];
}

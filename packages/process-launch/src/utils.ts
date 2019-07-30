import { SpawnOptions } from 'child_process';

export function proc(command: string, args: string[], options?: SpawnOptions) {
  return {
    args,
    command,
    options,
  };
}

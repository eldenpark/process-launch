import { SpawnOptions } from 'child_process';

export function proc(command: string, args: string[], options?: SpawnOptions) {
  return {
    args,
    command,
    options,
  };
}

export function interpolateOptions(options?: SpawnOptions) {
  const envInterpolatedOptions = options
    ? {
      ...options,
      env: {
        ...process.env,
        ...options.env,
      },
    }
    : undefined;
  return envInterpolatedOptions;
}

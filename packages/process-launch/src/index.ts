import { SpawnOptions } from 'child_process';
import { logger } from 'jege/server';

import { createRun } from './run';
import {
  ProcessDefinitions,
  ProcessGroupDefinitions,
} from './types';

const log = logger('[process-launch]');

const processGroupHavingInvalidProcessDefinitionError = new Error(
  'Some processGroup does have invalid process names',
);

export function createLauncher<
  PD extends ProcessDefinitions,
  PGD extends ProcessGroupDefinitions,
>({
  processDefinitions,
  processGroupDefinitions,
}: LauncherOptions<PD, PGD>): Launcher {
  log(
    'createLauncher(): processDefinitions: %j, processGroupDefinitions: %j',
    processDefinitions,
    processGroupDefinitions,
  );

  checkIfProcessGroupHasValidProcessNames(
    processGroupDefinitions as ProcessGroupDefinitions,
    processDefinitions,
  );

  const processGroupDefinitionsWithDefault = processGroupDefinitions || {
    default: Object.keys(processDefinitions),
  };

  const run = createRun({
    processDefinitions,
    processGroupDefinitions: processGroupDefinitionsWithDefault,
  });

  return {
    run,
  };
}

export function proc(command: string, args: string[], options?: SpawnOptions) {
  return {
    args,
    command,
    options,
  };
}

function checkIfProcessGroupHasValidProcessNames(
  processGroupDefinitions: ProcessGroupDefinitions,
  processDefinitions: ProcessDefinitions,
) {
  if (processGroupDefinitions) {
    Object.values(processGroupDefinitions)
      .forEach((processes) => {
        processes.forEach((process) => {
          if (processDefinitions[process] === undefined) {
            throw processGroupHavingInvalidProcessDefinitionError;
          }
        });
      });
  }
}

interface LauncherOptions<PD, PGD> {
  processDefinitions: PD,
  processGroupDefinitions?: PGD;
}

interface Launcher {
  run: any;
}

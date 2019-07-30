import { logger } from 'jege/server';

import _run, { RunArgs } from './run';
import {
  ProcessDefinitions,
  ProcessGroupDefinitions,
} from './types';

const log = logger('[process-launch]');

const processGroupHavingInvalidProcessDefinitionError = new Error(
  'Some processGroup does have invalid process names',
);

export default function createLauncher<
  PD extends ProcessDefinitions,
  PGD extends ProcessGroupDefinitions,
>({
  processDefinitions,
  processGroupDefinitions,
}: LauncherOptions<PD, PGD>): Launcher<PD, PGD> {
  log(
    'createLauncher(): processDefinitions: %j, processGroupDefinitions: %j',
    processDefinitions,
    processGroupDefinitions,
  );

  checkIfProcessGroupHasValidProcessNames(
    processGroupDefinitions as ProcessGroupDefinitions,
    processDefinitions,
  );

  const processGroupDefinitionsWithDefault: PGD = addDefaultIfNotExist(
    processDefinitions,
    processGroupDefinitions,
  );

  return {
    run: ({
      process,
      processGroup,
    }: RunArgs<PD, PGD> = {}) => _run({
      process,
      processDefinitions,
      processGroup,
      processGroupDefinitions: processGroupDefinitionsWithDefault,
    }),
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

function addDefaultIfNotExist(processDefinitions, processGroupDefinitions?) {
  if (processGroupDefinitions && !processGroupDefinitions.default) {
    return {
      ...processGroupDefinitions,
      default: Object.keys(processDefinitions),
    };
  }

  if (processGroupDefinitions === undefined) {
    return {
      default: Object.keys(processDefinitions),
    };
  }

  return processGroupDefinitions;
}

interface LauncherOptions<PD, PGD> {
  processDefinitions: PD,
  processGroupDefinitions?: PGD;
}

interface Launcher<PD, PGD> {
  run: (arg: RunArgs<PD, PGD>) => void;
}

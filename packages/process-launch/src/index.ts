import chalk from 'chalk';
import childProcess from 'child_process';
import { logger } from 'jege/server';

const log = logger('[process-launch]');

const processMissingError = new Error(
  'process with the name does not exist',
);

const processGroupMissingError = new Error(
  'processGroup with the name does not exist',
);

const processGroupHavingInvalidProcessDefinitionError = new Error(
  'Some processGroup does have invalid process names',
);

export function createLaunch<
  PD extends ProcessDefinitions,
  PGD extends ProcessGroupDefinitions,
>({
  processDefinitions,
  processGroupDefinitions,
}: CreateLaunchArgs<PD, PGD>) {
  log(
    'createLauncher(): processDefinitions: %j, processGroupDefinitions: %j',
    processDefinitions,
    processGroupDefinitions,
  );

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

  const _processGroupDefinitions = processGroupDefinitions || {
    default: Object.keys(processDefinitions),
  };

  function launch({
    process,
    processGroup,
  }: LaunchArgs<PD, PGD> = {}) {
    try {
      log(
        'launcher(): process: %s, processGroup: %s',
        process,
        processGroup,
      );

      if (process) {
        log(`launcher(): starting only this process: ${chalk.yellow('%s')}`, process);

        const processDefinition = processDefinitions[process];
        if (!processDefinition) {
          log('launcher(): process does not exist: %s', process);
          throw processMissingError;
        }
        childProcess.spawn.call(this, ...processDefinition);
      } else if (processGroup) {
        const processes = _processGroupDefinitions[processGroup as any];
        log(`launcher(): starting only this processGroup: ${chalk.yellow('%s')}`, processGroup);

        if (processes === undefined) {
          throw processGroupMissingError;
        }

        spawnAll(processDefinitions, processes);
      } else {
        const processes = _processGroupDefinitions.default;
        spawnAll(processDefinitions, processes);
      }
    } catch (err) {
      log('launcher(): error reading file', err);
    }
  }

  return launch;
}

function spawnAll(processDefinitions: ProcessDefinitions, processes) {
  Object.entries(processDefinitions)
    .forEach(([processName, processDefinition]) => {
      if (processes.includes(processName)) {
        log('launcher(): starting processName: %s', processName);
        childProcess.spawn.call(this, ...processDefinition);
      }
    });
}

interface ProcessDefinitions {
  // This is ugly, but as of now (TypeSript 3.5.2), tuple is not inferred in the best way.
  [processName: string]: [string, string[], object] | (string | string[] | object)[];
}

interface ProcessGroupDefinitions {
  default: string[];
  [processGroupName: string]: string[];
}

interface LaunchArgs<PD, PGD> {
  process?: keyof PD;
  processGroup?: keyof PGD;
}

interface CreateLaunchArgs<PD, PGD> {
  processDefinitions: PD,
  processGroupDefinitions?: PGD;
}

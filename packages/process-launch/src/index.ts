import chalk from 'chalk';
import childProcess, { SpawnOptions } from 'child_process';
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

export function createLauncher<
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

  checkIfProcessGroupHasValidProcessNames(
    processGroupDefinitions as ProcessGroupDefinitions,
    processDefinitions,
  );

  const _processGroupDefinitions = processGroupDefinitions || {
    default: Object.keys(processDefinitions),
  };

  function run({
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

        spawnAll(processDefinitions, [process as string]);
      } else if (processGroup) {
        const processes = _processGroupDefinitions[processGroup as any];
        log(`launcher(): starting only this processGroup: ${chalk.yellow('%s')}`, processGroup);

        if (processes === undefined) {
          throw processGroupMissingError;
        }

        spawnAll(processDefinitions, processes);
      } else {
        log(
          `launcher(): neither process or processGroup specified. Starting processGroup: ${chalk.yellow('default')}`,
        );
        const processes = _processGroupDefinitions.default;
        spawnAll(processDefinitions, processes);
      }
    } catch (err) {
      log('launcher(): error reading file', err);
    }
  }

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

function spawnAll(processDefinitions: ProcessDefinitions, processes: string[]) {
  Object.entries(processDefinitions)
    .forEach(([processName, processDefinition]) => {
      if (processes.includes(processName)) {
        log('spawnAll(): starting processName: %s', processName);

        const { args, command, options } = processDefinition;
        const envInterpolatedOptions = options
          ? {
            ...options,
            env: {
              ...process.env,
              ...options.env,
            },
          }
          : undefined;

        childProcess.spawn(command, args, envInterpolatedOptions as any)
          .on('exit', (code) => {
            if (code !== 0) {
              log(
                `spawnAll(): ${chalk.red('error')} launching process: %s, code: %s`,
                processName,
                code,
              );
            }
          });
      }
    });
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

interface ProcessDefinitions {
  [processName: string]: {
    args: string[];
    command: string;
    options?: SpawnOptions;
  };
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

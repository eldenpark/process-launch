import chalk from 'chalk';
import childProcess from 'child_process';
import { logger } from 'jege/server';

import { interpolateOptions } from './utils';
import {
  ProcessDefinitions,
  ProcessGroupDefinitions,
} from './types';

const log = logger('[process-launch]');

const processMissingError = new Error(
  'process with the name does not exist',
);

const processGroupMissingError = new Error(
  'processGroup with the name does not exist',
);

export default function run<
  PD extends ProcessDefinitions,
  PGD extends ProcessGroupDefinitions,
>({
  process,
  processDefinitions,
  processGroup,
  processGroupDefinitions,
}: RunTotalArgs<PD, PGD>) {
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
      const processes = processGroupDefinitions[processGroup as any];
      log(`launcher(): starting only this processGroup: ${chalk.yellow('%s')}`, processGroup);

      if (processes === undefined) {
        throw processGroupMissingError;
      }

      spawnAll(processDefinitions, processes);
    } else {
      log(
        `launcher(): neither process or processGroup specified. Starting processGroup: ${chalk.yellow('default')}`,
      );
      const processes = processGroupDefinitions.default;
      spawnAll(processDefinitions, processes);
    }
  } catch (err) {
    log('launcher(): error reading file', err);
  }
}

function spawnAll(processDefinitions: ProcessDefinitions, processes: string[]) {
  Object.entries(processDefinitions)
    .forEach(([processName, processDefinition]) => {
      if (processes.includes(processName)) {
        log('spawnAll(): starting processName: %s', processName);

        const { args, command, options } = processDefinition;
        const envInterpolatedOptions = interpolateOptions(options);

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

export interface RunArgs<PD extends ProcessDefinitions, PGD extends ProcessGroupDefinitions> {
  process?: (keyof PD) | undefined;
  processGroup?: (keyof PGD) | undefined;
}

export type RunTotalArgs<
  PD extends ProcessDefinitions,
  PGD extends ProcessGroupDefinitions,
> = RunArgs<PD, PGD> & {
  processDefinitions: PD;
  processGroupDefinitions: PGD;
};

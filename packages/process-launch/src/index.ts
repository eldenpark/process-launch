import chalk from 'chalk';
import childProcess from 'child_process';
import { logger } from 'jege/server';

const log = logger('[process-launch]');

const processMissingError = new Error(
  'process with the name does not exist',
);

const processAndProcessGroupNotProvidedError = new Error(
  'Either process or processGroup should be provided',
);

export function createLaunch<
  PD extends ProcessDefinitions,
  PGD extends ProcessGroupDefinitions,
>(
  processDefinitions: PD,
  processGroupDefinitions: PGD,
): Launcher<PD, PGD> {
  log(
    'createLauncher(): processDefinitions: %j, processGroupDefinitions: %j',
    processDefinitions,
    processGroupDefinitions,
  );

  function launch({
    process,
    processGroup,
  }) {
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
        const processes = processGroupDefinitions[processGroup] || processGroupDefinitions.default;
        log(`launcher(): starting only this processGroup: ${chalk.yellow('%s')}`, processGroup);

        Object.entries(processDefinitions)
          .forEach(([processName, processDefinition]) => {
            if (processes.includes(processName)) {
              log('launcher(): starting processName: %s', processName);
              childProcess.spawn.call(this, ...processDefinition);
            }
          });
      } else {
        throw processAndProcessGroupNotProvidedError;
      }
    } catch (err) {
      log('launcher(): error reading file', err);
    }
  }

  return launch;
}


interface ProcessDefinitions {
  // This is ugly, but as of now (TypeSript 3.5.2), tuple is not inferred in the best way.
  [processName: string]: [string, string[], object] | (string | string[] | object)[];
}

interface ProcessGroupDefinitions {
  default: string[];
  [processGroupName: string]: string[];
}

interface Launcher<PD, PGD> {
  (args: {
    process?: keyof PD;
    processGroup?: keyof PGD;
  })
}

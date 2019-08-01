import chalk from 'chalk';
import childProcess from 'child_process';
import { logger } from 'jege/server';

import { interpolateOptions } from './utils';
import {
  ProcessDefinition,
  ProcessDefinitions,
} from './types';

const log = logger('[process-launch]');

const processDefinitionMissingError = new Error(
  'Process definition of specified processName has not been provided',
);

export default function runInSequence<PD extends ProcessDefinitions>({
  order,
  processDefinitions,
}: RunInSequenceArgs<PD>) {
  const processDefinitionList = order.map((processName) => {
    const processDefinition = processDefinitions[processName];
    log(
      `runInSequence(): collecting processes to start: %s`,
      processName,
    );

    if (processDefinition === undefined) {
      throw processDefinitionMissingError;
    }
    return {
      processDefinition,
      processName,
    };
  });

  batchExecuteSpawn(processDefinitionList);
}

async function batchExecuteSpawn(processDefinitionList: processDescription[]) {
  async function execute(processDescription: processDescription) {
    const { processDefinition, processName } = processDescription;
    log(`execute(): execute processName: ${chalk.yellow('%s')}`, processName);

    const { args, command, options } = processDefinition;
    const envInterpolatedOptions = interpolateOptions(options);

    return new Promise((resolve, reject) => {
      const child = childProcess.spawn(
        command,
        args,
        envInterpolatedOptions as any,
      );

      child.on('error', (err) => {
        reject(err);
      });

      child.on('exit', () => {
        resolve(true);
      });
    });
  }

  for (let i = 0; i < processDefinitionList.length; i += 1) {
    await execute(processDefinitionList[i]);
  }
}

export interface RunInSequenceArgs<PD extends ProcessDefinitions> {
  order: (keyof PD)[];
  processDefinitions: PD;
}

type ProcessDefinitionList = {
  processDefinition: ProcessDefinition;
  processName: string | number | symbol;
}[];

type processDescription = {
  processDefinition: ProcessDefinition;
  processName: string | number | symbol;
};

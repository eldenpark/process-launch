import childProcess from 'child_process';

import { interpolateOptions } from './utils';
import {
  ProcessDefinition,
  ProcessDefinitions,
} from './types';

const processDefinitionMissingError = new Error(
  'Process definition of specified processName has not been provided',
);

export default function runInSequence<PD extends ProcessDefinitions>({
  order,
  processDefinitions,
}: RunInSequenceArgs<PD>) {
  const processDefinitionList = order.map((processName) => {
    const processDefinition = processDefinitions[processName];

    if (processDefinition === undefined) {
      throw processDefinitionMissingError;
    }
    return processDefinition;
  });

  batchExecuteSpawn(processDefinitionList);
}

async function batchExecuteSpawn(processDefinitionList: ProcessDefinition[]) {
  async function execute(processDefinition: ProcessDefinition) {
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

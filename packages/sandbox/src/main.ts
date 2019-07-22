import { createLaunch } from 'process-launch';
import { logger } from 'jege/server';

const log = logger('[sandbox]');

const processDefinitions = {
  processOne: [
    'node',
    [
      './src/processes/process1.js',
    ],
    {
      cwd: '.',
      stdio: 'inherit',
    },
  ],
  processTwo: [
    'node',
    [
      './src/processes/process2.js',
    ],
    {
      cwd: '.',
      stdio: 'inherit',
    },
  ],
};

const processGroupDefinitions = {
  default: ['processOne'],
};

const launch = createLaunch(processDefinitions, processGroupDefinitions);

function main() {
  log('main(): launched');

  launch({
    process: 'processTwo',
    // processGroup: 'default',
  });
}

export default main;

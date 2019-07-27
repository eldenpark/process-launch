import { createLaunch, proc } from 'process-launch';
import { logger } from 'jege/server';

const log = logger('[sandbox]');

const processDefinitions = {
  processOne: proc(
    'node',
    [
      './src/processes/process1.js',
    ],
    {
      cwd: '.',
      env: {
        POWER: '1',
      },
      stdio: 'inherit',
    },
  ),
  processTwo: proc(
    'node',
    [
      './src/processes/process2.js',
    ],
    {
      cwd: '.',
      stdio: 'inherit',
    },
  ),
};

const processGroupDefinitions = {
  default: ['processOne'],
};

const launch = createLaunch({
  processDefinitions,
  processGroupDefinitions,
});

function main() {
  log('main(): launched');

  launch();

  log('main(): initial launch finished [timecheck]');

  launch({
    process: 'processTwo',
  });
}

export default main;

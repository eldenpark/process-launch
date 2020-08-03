import { createLauncher, proc } from 'process-launch';
import { logger } from 'jege/server';

const log = logger('[sandbox]');

const processDefinitions = {
  build1: proc(
    'node',
    [
      './src/processes/build1.js',
    ],
    {
      cwd: '.',
      stdio: 'inherit',
    },
  ),
  build2: proc(
    'node',
    [
      './src/processes/build2.js',
    ],
    {
      cwd: '.',
      stdio: 'inherit',
    },
  ),
  build3: proc(
    'node',
    [
      './src/processes/build3.js',
    ],
    {
      cwd: '.',
      stdio: 'inherit',
    },
  ),
  build4: proc(
    'node',
    [
      './src/processes/build1.js',
    ],
    {
      cwd: '.',
      stdio: 'inherit',
    },
  ),
  process1: proc(
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
  process2: proc(
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
  default: ['process1'],
};

const Launcher = createLauncher({
  processDefinitions,
  processGroupDefinitions,
});

function main() {
  log('main(): launched');

  Launcher.run();

  log('main(): initial launch finished [timecheck]');

  Launcher.run({
    process: 'process2',
  });

  log('main(): second launch finished [timecheck]');

  Launcher.runInSequence({
    order: ['build1', 'build2'],
  });

  Launcher.runInSequence({
    order: ['build3', 'build4'],
  });
}

export default main;

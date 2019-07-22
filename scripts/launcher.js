const { argv } = require('yargs');
const chalk = require('chalk');
const childProcess = require('child_process');
const { logger } = require('jege/server');

const log = logger('[monorepo-process-launch]');

const processDefinitions = {
  sandbox: [
    'node',
    [
      './scripts/launch.js',
    ],
    {
      cwd: './packages/sandbox',
      stdio: 'inherit',
    },
  ],
};

const processGroups = {
  default: [
    'sandbox',
  ],
};

function launcher() {
  try {
    log(
      'launcher(): argv: %j, Processes defined: %j, ProcessGroups: %j',
      argv,
      Object.keys(processDefinitions),
      processGroups,
    );

    if (argv.process) {
      log('launcher(): starting only this process: %s', argv.process);
      const processDefinition = processDefinitions[argv.process];
      childProcess.spawn(...processDefinition);
    } else {
      const processGroup = processGroups[argv.processGroup] || processGroups.default;
      log(`launcher(): starting only this processGroup: ${chalk.yellow('%s')}`, processGroup);
      Object.entries(processDefinitions)
        .forEach(([processName, processDefinition]) => {
          if (processGroup.includes(processName)) {
            log('launcher(): starting processName: %s', processName);
            childProcess.spawn(...processDefinition);
          }
        });
    }
  } catch (err) {
    log('launcher(): error reading file', err);
  }
}

if (require.main === module) {
  launcher();
}

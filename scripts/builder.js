const { argv } = require('yargs');
const { logger } = require('jege/server');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const log = logger('[monorepo-process-launch]');

const buildOrder = [
  'process-launch',
];

async function batchExecuteBuild(buildDefinitions) {
  async function execute(packagePath, buildFilePath) {
    return new Promise((resolve, reject) => {
      const child = childProcess.spawn(
        'node',
        [
          buildFilePath,
        ],
        {
          cwd: packagePath,
          stdio: 'inherit',
        },
      );

      child.on('error', (err) => {
        reject(err);
      });

      child.on('exit', () => {
        resolve(true);
      });
    });
  }

  for (let i = 0; i < buildDefinitions.length; i += 1) {
    const { buildFilePath, packagePath } = buildDefinitions[i];
    await execute(packagePath, buildFilePath);
  }
}

function collectBuildDefinitions() {
  const buildDefinitions = [];
  const packagesPath = path.resolve(cwd, 'packages');

  for (let i = 0; i < buildOrder.length; i += 1) {
    const packagePath = path.resolve(packagesPath, buildOrder[i]);
    const stat = fs.lstatSync(packagePath);
    if (stat.isDirectory()) {
      const buildFilePath = path.resolve(
        packagesPath,
        buildOrder[i],
        'scripts',
        'build.js',
      );
      if (fs.existsSync(buildFilePath)) {
        log('builder(): buildFile found: %s', buildFilePath);
        buildDefinitions.push({ buildFilePath, packagePath });
      }
    }
  }
  return buildDefinitions;
}

async function builder() {
  log('builder(): start building, cwd: %s, argv: %j', cwd, argv);

  try {
    if (argv.p !== undefined) {
      const packagePath = path.resolve(cwd, 'packages', argv.p);
      const buildFilePath = path.resolve(packagePath, 'scripts', 'build.js');
      log('builder(): buildFilePath: %s', buildFilePath);

      if (fs.existsSync(buildFilePath)) {
        await batchExecuteBuild([{ buildFilePath, packagePath }]);
      } else {
        log('builder(): buildFilePath does not exist: %s', buildFilePath);
      }
    } else {
      const buildDefinitions = collectBuildDefinitions();
      await batchExecuteBuild(buildDefinitions);
    }
  } catch (err) {
    log('builder(): error', err);
  }
}

module.exports = builder;

if (require.main === module) {
  builder();
}

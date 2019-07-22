const { logger } = require('jege/server');

const log = logger('[monorepo-songkoro]');

exports.requireNonNull = (obj, message) => {
  if (obj === undefined || obj === null) {
    log(message);
    process.exit(0);
  }
};

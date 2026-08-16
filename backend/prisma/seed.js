const { seed } = require('../src/scripts/seed.js');

seed()
  .then((res) => {
    console.log('[SEED] Completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[SEED] Execution error:', err);
    process.exit(1);
  });

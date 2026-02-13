/**
 * Integration test setup — runs in each fork worker process
 * BEFORE test file modules are imported.
 *
 * Overrides DATABASE_URL so that `src/config/env.ts` (which parses
 * process.env at import time) connects to the worker-specific database,
 * enabling parallel execution without data conflicts.
 */

const poolId = process.env.VITEST_POOL_ID ?? "0";

process.env.DATABASE_URL = `postgresql://corestack:corestack@localhost:5433/corestack_test_${poolId}`;

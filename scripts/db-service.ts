import net from 'net';
import path from 'path';

// Helper to check if a TCP port is open
export async function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

let pgInstance: any = null;

export async function ensurePostgresRunning(port = 5433, dbName = 'placewise') {
  const isOpen = await isPortOpen(port);
  if (isOpen) {
    console.log(`[Database] PostgreSQL is already running on port ${port}.`);
    return;
  }

  console.log(`[Database] Starting embedded PostgreSQL on port ${port}...`);
  try {
    const EmbeddedPostgres = (await import('embedded-postgres')).default;
    const dbDir = path.resolve(process.cwd(), '.pgdata');
    pgInstance = new EmbeddedPostgres({
      port,
      databaseDir: dbDir,
      user: 'postgres',
      password: 'password',
      persistent: true,
    });

    await pgInstance.initialise();
    await pgInstance.start();

    // Ensure database exists
    try {
      await pgInstance.createDatabase(dbName);
      console.log(`[Database] Database '${dbName}' created successfully.`);
    } catch (err: any) {
      // Database might already exist, which is fine
      if (!err?.message?.includes('already exists')) {
        console.log(`[Database] Note on database creation: ${err?.message || err}`);
      }
    }

    console.log(`[Database] Embedded PostgreSQL running on port ${port} with database '${dbName}'.`);
  } catch (err) {
    console.error('[Database] Failed to start embedded PostgreSQL:', err);
    throw err;
  }
}

export async function stopEmbeddedPostgres() {
  if (pgInstance) {
    console.log('[Database] Stopping embedded PostgreSQL...');
    await pgInstance.stop();
    pgInstance = null;
    console.log('[Database] Embedded PostgreSQL stopped.');
  }
}

// If executed directly from CLI: npx tsx scripts/db-service.ts start
if (process.argv[1]?.includes('db-service')) {
  const command = process.argv[2] || 'start';
  if (command === 'start') {
    ensurePostgresRunning().then(() => {
      console.log('[Database] Server is running. Press Ctrl+C to stop.');
      // Keep process alive if started directly
      process.on('SIGINT', async () => {
        await stopEmbeddedPostgres();
        process.exit(0);
      });
      process.on('SIGTERM', async () => {
        await stopEmbeddedPostgres();
        process.exit(0);
      });
    });
  }
}

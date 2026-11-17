import { app, seedInitialDesignIfEmpty } from './app.js';
import { config } from './config/index.js';

async function startServer() {
  await seedInitialDesignIfEmpty();

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 GestureCAD Backend Server running on port ${config.port}`);
    console.log(`📡 Service: GestureCAD Spatial CAD API`);
    console.log(`🤖 AI Provider: ${config.aiProvider} (${config.aiProvider === 'local' ? 'Local Deterministic Demo Mode' : 'Cloud API'})`);
    console.log(`🔗 API Base: http://localhost:${config.port}/api`);
    console.log(`====================================================`);
  });

  return server;
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});


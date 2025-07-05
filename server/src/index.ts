
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createApiDesignInputSchema, 
  updateApiDesignInputSchema, 
  getApiDesignInputSchema, 
  deleteApiDesignInputSchema 
} from './schema';
import { createApiDesign } from './handlers/create_api_design';
import { getApiDesigns } from './handlers/get_api_designs';
import { getApiDesign } from './handlers/get_api_design';
import { updateApiDesign } from './handlers/update_api_design';
import { deleteApiDesign } from './handlers/delete_api_design';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new API design
  createApiDesign: publicProcedure
    .input(createApiDesignInputSchema)
    .mutation(({ input }) => createApiDesign(input)),
  
  // Get all API designs
  getApiDesigns: publicProcedure
    .query(() => getApiDesigns()),
  
  // Get a specific API design by ID
  getApiDesign: publicProcedure
    .input(getApiDesignInputSchema)
    .query(({ input }) => getApiDesign(input)),
  
  // Update an existing API design
  updateApiDesign: publicProcedure
    .input(updateApiDesignInputSchema)
    .mutation(({ input }) => updateApiDesign(input)),
  
  // Delete an API design
  deleteApiDesign: publicProcedure
    .input(deleteApiDesignInputSchema)
    .mutation(({ input }) => deleteApiDesign(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type CreateApiDesignInput } from '../schema';
import { createApiDesign } from '../handlers/create_api_design';
import { eq } from 'drizzle-orm';

// Simple test input with React Flow-like design data
const testInput: CreateApiDesignInput = {
  name: 'Test API Design',
  design_data: {
    nodes: [
      {
        id: 'node-1',
        type: 'endpoint',
        position: { x: 100, y: 100 },
        data: { label: 'GET /api/users' }
      }
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  }
};

describe('createApiDesign', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an API design', async () => {
    const result = await createApiDesign(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test API Design');
    expect(result.design_data).toEqual(testInput.design_data);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save API design to database', async () => {
    const result = await createApiDesign(testInput);

    // Query using proper drizzle syntax
    const designs = await db.select()
      .from(apiDesignsTable)
      .where(eq(apiDesignsTable.id, result.id))
      .execute();

    expect(designs).toHaveLength(1);
    expect(designs[0].name).toEqual('Test API Design');
    expect(designs[0].design_data).toEqual(testInput.design_data);
    expect(designs[0].created_at).toBeInstanceOf(Date);
    expect(designs[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle complex design data structures', async () => {
    const complexInput: CreateApiDesignInput = {
      name: 'Complex API Design',
      design_data: {
        nodes: [
          {
            id: 'endpoint-1',
            type: 'endpoint',
            position: { x: 100, y: 100 },
            data: {
              method: 'POST',
              path: '/api/users',
              headers: { 'Content-Type': 'application/json' },
              body: { name: 'string', email: 'string' }
            }
          },
          {
            id: 'database-1',
            type: 'database',
            position: { x: 300, y: 100 },
            data: { table: 'users', operation: 'INSERT' }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'endpoint-1',
            target: 'database-1',
            type: 'smoothstep'
          }
        ],
        viewport: { x: 0, y: 0, zoom: 1.2 }
      }
    };

    const result = await createApiDesign(complexInput);

    expect(result.name).toEqual('Complex API Design');
    expect(result.design_data['nodes']).toHaveLength(2);
    expect(result.design_data['edges']).toHaveLength(1);
    expect(result.design_data['viewport']['zoom']).toEqual(1.2);

    // Verify complex data is stored correctly in database
    const designs = await db.select()
      .from(apiDesignsTable)
      .where(eq(apiDesignsTable.id, result.id))
      .execute();

    const designData = designs[0].design_data as Record<string, any>;
    expect(designData['nodes'][0]['data']['method']).toEqual('POST');
    expect(designData['edges'][0]['source']).toEqual('endpoint-1');
  });
});

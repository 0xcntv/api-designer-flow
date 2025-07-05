
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type GetApiDesignInput } from '../schema';
import { getApiDesign } from '../handlers/get_api_design';

// Test input for getting API design
const testDesignData = {
  nodes: [
    { id: '1', type: 'input', position: { x: 100, y: 100 }, data: { label: 'Start' } }
  ],
  edges: []
};

describe('getApiDesign', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return API design when found', async () => {
    // Create test API design first
    const insertResult = await db.insert(apiDesignsTable)
      .values({
        name: 'Test API Design',
        design_data: testDesignData
      })
      .returning()
      .execute();

    const createdDesign = insertResult[0];

    // Test getting the API design
    const input: GetApiDesignInput = {
      id: createdDesign.id
    };

    const result = await getApiDesign(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdDesign.id);
    expect(result!.name).toEqual('Test API Design');
    expect(result!.design_data).toEqual(testDesignData);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when API design not found', async () => {
    const input: GetApiDesignInput = {
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' // Non-existent UUID
    };

    const result = await getApiDesign(input);

    expect(result).toBeNull();
  });

  it('should handle complex design data correctly', async () => {
    // Create API design with complex React Flow data
    const complexDesignData = {
      nodes: [
        { id: '1', type: 'input', position: { x: 100, y: 100 }, data: { label: 'API Gateway' } },
        { id: '2', type: 'default', position: { x: 200, y: 200 }, data: { label: 'Auth Service' } },
        { id: '3', type: 'output', position: { x: 300, y: 300 }, data: { label: 'Database' } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    const insertResult = await db.insert(apiDesignsTable)
      .values({
        name: 'Complex API Design',
        design_data: complexDesignData
      })
      .returning()
      .execute();

    const createdDesign = insertResult[0];

    // Test getting the complex API design
    const input: GetApiDesignInput = {
      id: createdDesign.id
    };

    const result = await getApiDesign(input);

    expect(result).not.toBeNull();
    expect(result!.design_data).toEqual(complexDesignData);
    expect(result!.design_data['nodes']).toHaveLength(3);
    expect(result!.design_data['edges']).toHaveLength(2);
    expect(result!.design_data['viewport']).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});

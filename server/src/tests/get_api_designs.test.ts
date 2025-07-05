
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { getApiDesigns } from '../handlers/get_api_designs';

// Test data
const testDesign1 = {
  name: 'User Management API',
  design_data: {
    nodes: [
      { id: '1', type: 'endpoint', data: { method: 'GET', path: '/users' } }
    ],
    edges: []
  }
};

const testDesign2 = {
  name: 'Product Catalog API',
  design_data: {
    nodes: [
      { id: '1', type: 'endpoint', data: { method: 'POST', path: '/products' } },
      { id: '2', type: 'database', data: { table: 'products' } }
    ],
    edges: [
      { id: 'e1', source: '1', target: '2' }
    ]
  }
};

describe('getApiDesigns', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no designs exist', async () => {
    const result = await getApiDesigns();
    
    expect(result).toEqual([]);
  });

  it('should return all API designs', async () => {
    // Insert test designs
    await db.insert(apiDesignsTable)
      .values([testDesign1, testDesign2])
      .execute();

    const result = await getApiDesigns();

    expect(result).toHaveLength(2);
    
    // Check that all expected fields are present
    result.forEach(design => {
      expect(design.id).toBeDefined();
      expect(design.name).toBeDefined();
      expect(design.design_data).toBeDefined();
      expect(design.created_at).toBeInstanceOf(Date);
      expect(design.updated_at).toBeInstanceOf(Date);
    });

    // Check specific data
    const names = result.map(d => d.name);
    expect(names).toContain('User Management API');
    expect(names).toContain('Product Catalog API');
  });

  it('should return designs ordered by created_at descending', async () => {
    // Insert first design
    await db.insert(apiDesignsTable)
      .values(testDesign1)
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Insert second design
    await db.insert(apiDesignsTable)
      .values(testDesign2)
      .execute();

    const result = await getApiDesigns();

    expect(result).toHaveLength(2);
    
    // First result should be the most recently created (testDesign2)
    expect(result[0].name).toEqual('Product Catalog API');
    expect(result[1].name).toEqual('User Management API');
    
    // Verify ordering by timestamps
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should preserve JSONB design_data structure', async () => {
    await db.insert(apiDesignsTable)
      .values(testDesign2)
      .execute();

    const result = await getApiDesigns();

    expect(result).toHaveLength(1);
    
    const design = result[0];
    expect(design.design_data).toEqual(testDesign2.design_data);
    expect(design.design_data['nodes']).toHaveLength(2);
    expect(design.design_data['edges']).toHaveLength(1);
    expect(design.design_data['nodes'][0].data.method).toEqual('POST');
    expect(design.design_data['nodes'][0].data.path).toEqual('/products');
  });
});


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type UpdateApiDesignInput } from '../schema';
import { updateApiDesign } from '../handlers/update_api_design';
import { eq } from 'drizzle-orm';

// Test data
const testDesignData = {
  nodes: [{ id: '1', type: 'default', position: { x: 100, y: 100 } }],
  edges: []
};

const updatedDesignData = {
  nodes: [
    { id: '1', type: 'default', position: { x: 200, y: 200 } },
    { id: '2', type: 'default', position: { x: 300, y: 300 } }
  ],
  edges: [{ id: 'e1-2', source: '1', target: '2' }]
};

describe('updateApiDesign', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update API design name only', async () => {
    // Create initial design
    const created = await db.insert(apiDesignsTable)
      .values({
        name: 'Original Design',
        design_data: testDesignData
      })
      .returning()
      .execute();

    const originalDesign = created[0];

    // Update only name
    const input: UpdateApiDesignInput = {
      id: originalDesign.id,
      name: 'Updated Design Name'
    };

    const result = await updateApiDesign(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(originalDesign.id);
    expect(result!.name).toEqual('Updated Design Name');
    expect(result!.design_data).toEqual(testDesignData); // Should remain unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalDesign.updated_at).toBe(true);
  });

  it('should update API design data only', async () => {
    // Create initial design
    const created = await db.insert(apiDesignsTable)
      .values({
        name: 'Test Design',
        design_data: testDesignData
      })
      .returning()
      .execute();

    const originalDesign = created[0];

    // Update only design data
    const input: UpdateApiDesignInput = {
      id: originalDesign.id,
      design_data: updatedDesignData
    };

    const result = await updateApiDesign(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(originalDesign.id);
    expect(result!.name).toEqual('Test Design'); // Should remain unchanged
    expect(result!.design_data).toEqual(updatedDesignData);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalDesign.updated_at).toBe(true);
  });

  it('should update both name and design data', async () => {
    // Create initial design
    const created = await db.insert(apiDesignsTable)
      .values({
        name: 'Original Design',
        design_data: testDesignData
      })
      .returning()
      .execute();

    const originalDesign = created[0];

    // Update both fields
    const input: UpdateApiDesignInput = {
      id: originalDesign.id,
      name: 'Completely Updated Design',
      design_data: updatedDesignData
    };

    const result = await updateApiDesign(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(originalDesign.id);
    expect(result!.name).toEqual('Completely Updated Design');
    expect(result!.design_data).toEqual(updatedDesignData);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalDesign.updated_at).toBe(true);
  });

  it('should return null for non-existent design', async () => {
    const input: UpdateApiDesignInput = {
      id: '550e8400-e29b-41d4-a716-446655440000', // Non-existent UUID
      name: 'Updated Name'
    };

    const result = await updateApiDesign(input);

    expect(result).toBeNull();
  });

  it('should persist updates to database', async () => {
    // Create initial design
    const created = await db.insert(apiDesignsTable)
      .values({
        name: 'Test Design',
        design_data: testDesignData
      })
      .returning()
      .execute();

    const originalDesign = created[0];

    // Update the design
    const input: UpdateApiDesignInput = {
      id: originalDesign.id,
      name: 'Persisted Update',
      design_data: updatedDesignData
    };

    await updateApiDesign(input);

    // Verify changes were persisted
    const persisted = await db.select()
      .from(apiDesignsTable)
      .where(eq(apiDesignsTable.id, originalDesign.id))
      .execute();

    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toEqual('Persisted Update');
    expect(persisted[0].design_data).toEqual(updatedDesignData);
    expect(persisted[0].updated_at).toBeInstanceOf(Date);
    expect(persisted[0].updated_at > originalDesign.updated_at).toBe(true);
  });

  it('should handle empty design data update', async () => {
    // Create initial design
    const created = await db.insert(apiDesignsTable)
      .values({
        name: 'Test Design',
        design_data: testDesignData
      })
      .returning()
      .execute();

    const originalDesign = created[0];

    // Update with empty design data
    const input: UpdateApiDesignInput = {
      id: originalDesign.id,
      design_data: {}
    };

    const result = await updateApiDesign(input);

    expect(result).toBeDefined();
    expect(result!.design_data).toEqual({});
    expect(result!.name).toEqual('Test Design'); // Should remain unchanged
  });
});

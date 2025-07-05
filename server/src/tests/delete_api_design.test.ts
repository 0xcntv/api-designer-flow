
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type DeleteApiDesignInput } from '../schema';
import { deleteApiDesign } from '../handlers/delete_api_design';
import { eq } from 'drizzle-orm';

// Test input for deleting API design
const testInput: DeleteApiDesignInput = {
  id: '123e4567-e89b-12d3-a456-426614174000'
};

describe('deleteApiDesign', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing API design', async () => {
    // Create test API design first
    await db.insert(apiDesignsTable)
      .values({
        id: testInput.id,
        name: 'Test API Design',
        design_data: { nodes: [], edges: [] }
      })
      .execute();

    const result = await deleteApiDesign(testInput);

    // Should return success
    expect(result.success).toBe(true);

    // Verify the API design was deleted from database
    const apiDesigns = await db.select()
      .from(apiDesignsTable)
      .where(eq(apiDesignsTable.id, testInput.id))
      .execute();

    expect(apiDesigns).toHaveLength(0);
  });

  it('should return false for non-existent API design', async () => {
    const result = await deleteApiDesign(testInput);

    // Should return false for non-existent ID
    expect(result.success).toBe(false);
  });

  it('should handle multiple API designs correctly', async () => {
    // Create multiple test API designs
    const design1Id = '123e4567-e89b-12d3-a456-426614174001';
    const design2Id = '123e4567-e89b-12d3-a456-426614174002';

    await db.insert(apiDesignsTable)
      .values([
        {
          id: design1Id,
          name: 'Design 1',
          design_data: { nodes: [], edges: [] }
        },
        {
          id: design2Id,
          name: 'Design 2',
          design_data: { nodes: [], edges: [] }
        }
      ])
      .execute();

    // Delete first design
    const result = await deleteApiDesign({ id: design1Id });
    expect(result.success).toBe(true);

    // Verify only the first design was deleted
    const remainingDesigns = await db.select()
      .from(apiDesignsTable)
      .execute();

    expect(remainingDesigns).toHaveLength(1);
    expect(remainingDesigns[0].id).toBe(design2Id);
    expect(remainingDesigns[0].name).toBe('Design 2');
  });
});

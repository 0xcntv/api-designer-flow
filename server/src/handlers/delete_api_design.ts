
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type DeleteApiDesignInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteApiDesign = async (input: DeleteApiDesignInput): Promise<{ success: boolean }> => {
  try {
    // Delete the API design by ID
    const result = await db.delete(apiDesignsTable)
      .where(eq(apiDesignsTable.id, input.id))
      .execute();

    // Check if any rows were affected (deleted)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('API design deletion failed:', error);
    throw error;
  }
};

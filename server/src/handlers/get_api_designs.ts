
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type ApiDesign } from '../schema';
import { desc } from 'drizzle-orm';

export const getApiDesigns = async (): Promise<ApiDesign[]> => {
  try {
    // Fetch all API designs ordered by created_at descending (newest first)
    const results = await db.select()
      .from(apiDesignsTable)
      .orderBy(desc(apiDesignsTable.created_at))
      .execute();

    // Type cast design_data from unknown to Record<string, any>
    return results.map(result => ({
      ...result,
      design_data: result.design_data as Record<string, any>
    }));
  } catch (error) {
    console.error('Failed to fetch API designs:', error);
    throw error;
  }
};

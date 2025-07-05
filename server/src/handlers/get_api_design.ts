
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetApiDesignInput, type ApiDesign } from '../schema';

export const getApiDesign = async (input: GetApiDesignInput): Promise<ApiDesign | null> => {
  try {
    // Query for the specific API design by ID
    const results = await db.select()
      .from(apiDesignsTable)
      .where(eq(apiDesignsTable.id, input.id))
      .execute();

    // Return the first result or null if not found
    if (results.length === 0) {
      return null;
    }

    const dbResult = results[0];
    
    // Convert the database result to match the ApiDesign schema
    return {
      id: dbResult.id,
      name: dbResult.name,
      design_data: dbResult.design_data as Record<string, any>,
      created_at: dbResult.created_at,
      updated_at: dbResult.updated_at
    };
  } catch (error) {
    console.error('Get API design failed:', error);
    throw error;
  }
};

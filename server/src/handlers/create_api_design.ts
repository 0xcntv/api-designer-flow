
import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type CreateApiDesignInput, type ApiDesign } from '../schema';

export const createApiDesign = async (input: CreateApiDesignInput): Promise<ApiDesign> => {
  try {
    // Insert API design record
    const result = await db.insert(apiDesignsTable)
      .values({
        name: input.name,
        design_data: input.design_data // JSONB field - no conversion needed
      })
      .returning()
      .execute();

    // Convert the database result to match the API schema
    const dbRecord = result[0];
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      design_data: dbRecord.design_data as Record<string, any>,
      created_at: dbRecord.created_at,
      updated_at: dbRecord.updated_at
    };
  } catch (error) {
    console.error('API design creation failed:', error);
    throw error;
  }
};


import { db } from '../db';
import { apiDesignsTable } from '../db/schema';
import { type UpdateApiDesignInput, type ApiDesign } from '../schema';
import { eq } from 'drizzle-orm';

export const updateApiDesign = async (input: UpdateApiDesignInput): Promise<ApiDesign | null> => {
  try {
    // Build update object with only provided fields
    const updateData: { name?: string; design_data?: Record<string, any>; updated_at: Date } = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.design_data !== undefined) {
      updateData.design_data = input.design_data;
    }

    // Update the API design and return the updated record
    const result = await db.update(apiDesignsTable)
      .set(updateData)
      .where(eq(apiDesignsTable.id, input.id))
      .returning()
      .execute();

    // Return the updated design or null if not found
    if (result.length > 0) {
      const updatedDesign = result[0];
      return {
        ...updatedDesign,
        design_data: updatedDesign.design_data as Record<string, any>
      };
    }

    return null;
  } catch (error) {
    console.error('API design update failed:', error);
    throw error;
  }
};

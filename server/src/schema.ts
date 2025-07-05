
import { z } from 'zod';

// API Design schema with proper types
export const apiDesignSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  design_data: z.record(z.any()), // JSONB field for React Flow state
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ApiDesign = z.infer<typeof apiDesignSchema>;

// Input schema for creating API designs
export const createApiDesignInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  design_data: z.record(z.any()) // React Flow state as JSON object
});

export type CreateApiDesignInput = z.infer<typeof createApiDesignInputSchema>;

// Input schema for updating API designs
export const updateApiDesignInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").optional(),
  design_data: z.record(z.any()).optional()
});

export type UpdateApiDesignInput = z.infer<typeof updateApiDesignInputSchema>;

// Input schema for getting API design by ID
export const getApiDesignInputSchema = z.object({
  id: z.string().uuid()
});

export type GetApiDesignInput = z.infer<typeof getApiDesignInputSchema>;

// Input schema for deleting API design
export const deleteApiDesignInputSchema = z.object({
  id: z.string().uuid()
});

export type DeleteApiDesignInput = z.infer<typeof deleteApiDesignInputSchema>;

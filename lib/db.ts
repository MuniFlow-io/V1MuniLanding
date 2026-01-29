// Database utilities and connection helpers
// This file contains database-related utilities and helpers

import { supabase, supabaseAdmin, supabaseUtils } from './supabase';

// Re-export supabase client for use in services
export { supabase, supabaseAdmin, supabaseUtils };

// Export getter for supabaseAdmin (for services that need it)
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }
  return supabaseAdmin;
}

// Database utility functions
export const dbUtils = {
  // Generic query wrapper with error handling
  query: async (queryFn: () => Promise<any>) => {
    try {
      const result = await queryFn();
      return {
        success: true,
        data: result.data,
        error: null as null,
      };
    } catch (error) {
      return supabaseUtils.handleError(error);
    }
  },

  // Get data with optional filtering
  select: async (
    table: string,
    columns = '*',
    filters?: Record<string, any>,
    options?: { limit?: number; offset?: number; orderBy?: string }
  ) => {
    try {
      let query = supabase.from(table).select(columns);

      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply options
      if (options?.limit) query = query.limit(options.limit);
      if (options?.offset)
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      if (options?.orderBy) query = query.order(options.orderBy);

      const result = await query;
      return {
        success: true,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      return supabaseUtils.handleError(error);
    }
  },

  // Insert data
  insert: async (table: string, data: Record<string, any> | Record<string, any>[]) => {
    try {
      const result = await supabase.from(table).insert(data).select();
      return {
        success: true,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      return supabaseUtils.handleError(error);
    }
  },

  // Update data
  update: async (table: string, data: Record<string, any>, filters: Record<string, any>) => {
    try {
      let query = supabase.from(table).update(data);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const result = await query.select();
      return {
        success: true,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      return supabaseUtils.handleError(error);
    }
  },

  // Delete data
  delete: async (table: string, filters: Record<string, any>) => {
    try {
      let query = supabase.from(table).delete();

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const result = await query;
      return {
        success: true,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      return supabaseUtils.handleError(error);
    }
  },

  // Upsert data
  upsert: async (table: string, data: Record<string, any> | Record<string, any>[]) => {
    try {
      const result = await supabase.from(table).upsert(data).select();
      return {
        success: true,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      return supabaseUtils.handleError(error);
    }
  },
};

// Database connection utilities
export const dbConnection = {
  // Test database connection
  testConnection: async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return {
        success: !error,
        message: error ? error.message : 'Connection successful',
      };
    } catch {
      return {
        success: false,
        message: 'Connection failed',
      };
    }
  },

  // Get database health status
  getHealth: async () => {
    const connectionTest = await dbConnection.testConnection();
    return {
      status: connectionTest.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: connectionTest.message,
    };
  },
};

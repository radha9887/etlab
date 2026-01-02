import { create } from 'zustand';
import yaml from 'js-yaml';
import type { Schema } from '../types';
import { schemaApi } from '../services/api';
import type { SchemaDefinition, SchemaColumn as ApiSchemaColumn } from '../services/api';

interface SchemaState {
  schemas: Schema[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addSchema: (schema: Schema) => void;
  removeSchema: (id: string) => void;
  loadFromYaml: (yamlContent: string) => void;
  clearSchemas: () => void;

  // API actions
  loadFromApi: (workspaceId: string) => Promise<void>;
  saveToApi: (workspaceId: string, schema: Schema) => Promise<Schema | null>;
  deleteFromApi: (schemaId: string) => Promise<void>;
  loadFromYamlAndSave: (workspaceId: string, yamlContent: string) => Promise<void>;
  loadDefaultSchemas: (workspaceId: string) => Promise<void>;
}

let schemaId = 0;
const generateSchemaId = () => `schema_${schemaId++}`;

// Convert API schema to local schema format
const apiToLocalSchema = (apiSchema: SchemaDefinition): Schema => ({
  id: apiSchema.id,
  name: apiSchema.name,
  source: apiSchema.source_type as Schema['source'],
  format: apiSchema.source_type,
  path: apiSchema.config?.path as string | undefined,
  columns: apiSchema.columns.map(col => ({
    name: col.name,
    dataType: col.dataType,
    nullable: col.nullable,
    description: col.description,
  })),
  config: apiSchema.config,
});

// Convert local schema to API format
const localToApiSchema = (schema: Schema): {
  name: string;
  source_type: string;
  columns: ApiSchemaColumn[];
  config?: Record<string, any>;
} => ({
  name: schema.name,
  source_type: schema.source,
  columns: schema.columns.map(col => ({
    name: col.name,
    dataType: col.dataType,
    nullable: col.nullable !== false,
    description: col.description,
  })),
  config: { ...schema.config, path: schema.path },
});

export const useSchemaStore = create<SchemaState>((set, get) => ({
  schemas: [],
  isLoading: false,
  error: null,

  addSchema: (schema) => {
    set({
      schemas: [...get().schemas, schema],
    });
  },

  removeSchema: (id) => {
    set({
      schemas: get().schemas.filter((s) => s.id !== id),
    });
  },

  loadFromYaml: (yamlContent) => {
    try {
      const parsed = yaml.load(yamlContent) as Record<string, unknown>;

      // Handle different YAML structures
      let schemasToAdd: Schema[] = [];

      // If it's an array of schemas
      if (Array.isArray(parsed)) {
        schemasToAdd = parsed.map((item: Record<string, unknown>) => ({
          id: generateSchemaId(),
          name: (item.name as string) || 'Unnamed Schema',
          source: (item.source as Schema['source']) || 'csv',
          format: item.format as string,
          path: item.path as string,
          columns: ((item.columns as Array<Record<string, unknown>>) || []).map((col) => ({
            name: (col.name as string) || '',
            dataType: (col.dataType as string) || (col.type as string) || 'string',
            nullable: col.nullable !== false,
            description: col.description as string,
          })),
          config: item.config as Record<string, unknown>,
        }));
      }
      // If it's a single schema object
      else if (parsed && typeof parsed === 'object') {
        // Check if it has a 'schemas' key
        if ('schemas' in parsed && Array.isArray(parsed.schemas)) {
          schemasToAdd = (parsed.schemas as Array<Record<string, unknown>>).map((item) => ({
            id: generateSchemaId(),
            name: (item.name as string) || 'Unnamed Schema',
            source: (item.source as Schema['source']) || 'csv',
            format: item.format as string,
            path: item.path as string,
            columns: ((item.columns as Array<Record<string, unknown>>) || []).map((col) => ({
              name: (col.name as string) || '',
              dataType: (col.dataType as string) || (col.type as string) || 'string',
              nullable: col.nullable !== false,
              description: col.description as string,
            })),
            config: item.config as Record<string, unknown>,
          }));
        }
        // Single schema
        else if ('name' in parsed || 'columns' in parsed) {
          schemasToAdd = [{
            id: generateSchemaId(),
            name: (parsed.name as string) || 'Unnamed Schema',
            source: (parsed.source as Schema['source']) || 'csv',
            format: parsed.format as string,
            path: parsed.path as string,
            columns: ((parsed.columns as Array<Record<string, unknown>>) || []).map((col) => ({
              name: (col.name as string) || '',
              dataType: (col.dataType as string) || (col.type as string) || 'string',
              nullable: col.nullable !== false,
              description: col.description as string,
            })),
            config: parsed.config as Record<string, unknown>,
          }];
        }
      }

      if (schemasToAdd.length > 0) {
        set({
          schemas: [...get().schemas, ...schemasToAdd],
        });
      }
    } catch (error) {
      console.error('Failed to parse YAML:', error);
      throw new Error('Invalid YAML format');
    }
  },

  clearSchemas: () => {
    set({ schemas: [] });
  },

  // Load schemas from API for a workspace
  loadFromApi: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await schemaApi.list(workspaceId);
      const localSchemas = response.schemas.map(apiToLocalSchema);
      set({ schemas: localSchemas, isLoading: false });
    } catch (error) {
      console.error('Failed to load schemas from API:', error);
      set({ error: 'Failed to load schemas', isLoading: false });
    }
  },

  // Save a schema to the API
  saveToApi: async (workspaceId: string, schema: Schema) => {
    set({ isLoading: true, error: null });
    try {
      const apiData = localToApiSchema(schema);
      const savedSchema = await schemaApi.create(workspaceId, apiData);
      const localSchema = apiToLocalSchema(savedSchema);

      // Add to local store (replacing if exists)
      set(state => ({
        schemas: [...state.schemas.filter(s => s.id !== localSchema.id), localSchema],
        isLoading: false,
      }));

      return localSchema;
    } catch (error) {
      console.error('Failed to save schema to API:', error);
      set({ error: 'Failed to save schema', isLoading: false });
      return null;
    }
  },

  // Delete a schema from the API
  deleteFromApi: async (schemaId: string) => {
    set({ isLoading: true, error: null });
    try {
      await schemaApi.delete(schemaId);
      set(state => ({
        schemas: state.schemas.filter(s => s.id !== schemaId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete schema from API:', error);
      set({ error: 'Failed to delete schema', isLoading: false });
    }
  },

  // Load schemas from YAML and save them to the API
  loadFromYamlAndSave: async (workspaceId: string, yamlContent: string) => {
    set({ isLoading: true, error: null });
    try {
      const parsed = yaml.load(yamlContent) as Record<string, unknown>;
      let schemasToAdd: Omit<Schema, 'id'>[] = [];

      // Parse YAML (same logic as loadFromYaml but without generating local IDs)
      if (Array.isArray(parsed)) {
        schemasToAdd = parsed.map((item: Record<string, unknown>) => ({
          name: (item.name as string) || 'Unnamed Schema',
          source: (item.source as Schema['source']) || 'csv',
          format: item.format as string,
          path: item.path as string,
          columns: ((item.columns as Array<Record<string, unknown>>) || []).map((col) => ({
            name: (col.name as string) || '',
            dataType: (col.dataType as string) || (col.type as string) || 'string',
            nullable: col.nullable !== false,
            description: col.description as string,
          })),
          config: item.config as Record<string, unknown>,
        }));
      } else if (parsed && typeof parsed === 'object') {
        if ('schemas' in parsed && Array.isArray(parsed.schemas)) {
          schemasToAdd = (parsed.schemas as Array<Record<string, unknown>>).map((item) => ({
            name: (item.name as string) || 'Unnamed Schema',
            source: (item.source as Schema['source']) || 'csv',
            format: item.format as string,
            path: item.path as string,
            columns: ((item.columns as Array<Record<string, unknown>>) || []).map((col) => ({
              name: (col.name as string) || '',
              dataType: (col.dataType as string) || (col.type as string) || 'string',
              nullable: col.nullable !== false,
              description: col.description as string,
            })),
            config: item.config as Record<string, unknown>,
          }));
        } else if ('name' in parsed || 'columns' in parsed) {
          schemasToAdd = [{
            name: (parsed.name as string) || 'Unnamed Schema',
            source: (parsed.source as Schema['source']) || 'csv',
            format: parsed.format as string,
            path: parsed.path as string,
            columns: ((parsed.columns as Array<Record<string, unknown>>) || []).map((col) => ({
              name: (col.name as string) || '',
              dataType: (col.dataType as string) || (col.type as string) || 'string',
              nullable: col.nullable !== false,
              description: col.description as string,
            })),
            config: parsed.config as Record<string, unknown>,
          }];
        }
      }

      // Save each schema to the API
      const savedSchemas: Schema[] = [];
      for (const schemaData of schemasToAdd) {
        try {
          const apiData = localToApiSchema({ ...schemaData, id: '' } as Schema);
          const savedSchema = await schemaApi.create(workspaceId, apiData);
          savedSchemas.push(apiToLocalSchema(savedSchema));
        } catch (err) {
          console.error(`Failed to save schema "${schemaData.name}":`, err);
        }
      }

      // Update local state with saved schemas
      set(state => ({
        schemas: [...state.schemas, ...savedSchemas],
        isLoading: false,
      }));

      console.log(`Saved ${savedSchemas.length} schemas to database`);
    } catch (error) {
      console.error('Failed to parse and save YAML:', error);
      set({ error: 'Failed to parse YAML', isLoading: false });
      throw new Error('Invalid YAML format');
    }
  },

  // Load default/seed schemas for a workspace
  loadDefaultSchemas: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      await schemaApi.loadDefaults(workspaceId);
      // Reload schemas from API to get the newly created defaults
      const response = await schemaApi.list(workspaceId);
      const localSchemas = response.schemas.map(apiToLocalSchema);
      set({ schemas: localSchemas, isLoading: false });
    } catch (error) {
      console.error('Failed to load default schemas:', error);
      set({ error: 'Failed to load default schemas', isLoading: false });
    }
  },
}));

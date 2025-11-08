import { TableSchema } from '@/store/useConverterStore';

export type JsonDataModel = Record<string, any>;

interface ConversionOptions {
  addTimestamps?: boolean;
  addPrimaryKey?: boolean;
  useSnakeCase?: boolean;
}

/**
 * Infers Postgres data type from a JavaScript value
 */
function inferPostgresType(value: any): string {
  if (value === null || value === undefined) {
    return 'TEXT';
  }

  const type = typeof value;

  switch (type) {
    case 'string':
      // Check if it's a date string
      if (isDateString(value)) {
        return 'TIMESTAMP';
      }
      // Check if it's a UUID
      if (isUUID(value)) {
        return 'UUID';
      }
      // Check length to determine VARCHAR vs TEXT
      return value.length > 255 ? 'TEXT' : 'VARCHAR(255)';

    case 'number':
      return Number.isInteger(value) ? 'INTEGER' : 'DECIMAL(10,2)';

    case 'boolean':
      return 'BOOLEAN';

    case 'object':
      if (Array.isArray(value)) {
        // For arrays, infer the type from first element
        if (value.length > 0) {
          const elementType = inferPostgresType(value[0]);
          return `${elementType}[]`;
        }
        return 'JSONB';
      }
      // For nested objects, use JSONB
      return 'JSONB';

    default:
      return 'TEXT';
  }
}

function isDateString(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/) !== null;
}

function isUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Converts camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Generates SQL column definition
 */
function generateColumnDefinition(
  columnName: string,
  value: any,
  options: ConversionOptions
): string {
  const name = options.useSnakeCase ? toSnakeCase(columnName) : columnName;
  const type = inferPostgresType(value);
  const notNull = value !== null && value !== undefined ? ' NOT NULL' : '';

  return `  ${name} ${type}${notNull}`;
}

/**
 * Converts a JSON object to Postgres CREATE TABLE statement
 */
export function jsonToPostgresTable(
  tableName: string,
  jsonData: JsonDataModel,
  options: ConversionOptions = {}
): string {
  const {
    addTimestamps = true,
    addPrimaryKey = true,
    useSnakeCase = true,
  } = options;

  const safeTableName = useSnakeCase ? toSnakeCase(tableName) : tableName;
  let columns: string[] = [];

  // Add primary key if requested
  if (addPrimaryKey) {
    columns.push('  id SERIAL PRIMARY KEY');
  }

  // Add columns from JSON
  Object.entries(jsonData).forEach(([key, value]) => {
    // Skip if value is an array of objects (might be a relation)
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      return;
    }
    columns.push(generateColumnDefinition(key, value, options));
  });

  // Add timestamps if requested
  if (addTimestamps) {
    columns.push('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    columns.push('  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  }

  const sql = `CREATE TABLE ${safeTableName} (\n${columns.join(',\n')}\n);`;
  return sql;
}

/**
 * Detects related tables from nested objects and arrays
 */
function detectRelatedTables(
  parentTableName: string,
  jsonData: JsonDataModel
): TableSchema[] {
  const relatedTables: TableSchema[] = [];

  Object.entries(jsonData).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      // This is a one-to-many relationship
      relatedTables.push({
        tableName: key,
        fields: value[0],
      });
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      // This is a nested object (one-to-one or many-to-one)
      relatedTables.push({
        tableName: key,
        fields: value,
      });
    }
  });

  return relatedTables;
}

/**
 * Converts JSON data model(s) to complete Postgres schema
 */
export function convertJsonToPostgres(
  json: string,
  options: ConversionOptions = {}
): { sql: string; tables: TableSchema[] } {
  try {
    const data = JSON.parse(json);
    const tables: TableSchema[] = [];
    let sqlStatements: string[] = [];

    if (Array.isArray(data)) {
      throw new Error(
        'Please provide a JSON object or named objects, not an array at the root level'
      );
    }

    if (typeof data !== 'object') {
      throw new Error('Invalid JSON: Expected an object');
    }

    // Process each top-level key as a table
    Object.entries(data).forEach(([tableName, tableData]) => {
      if (typeof tableData === 'object' && !Array.isArray(tableData)) {
        tables.push({ tableName, fields: tableData as Record<string, any> });

        // Generate CREATE TABLE statement
        sqlStatements.push(
          jsonToPostgresTable(tableName, tableData as JsonDataModel, options)
        );

        // Detect and process related tables
        const relatedTables = detectRelatedTables(tableName, tableData as JsonDataModel);
        relatedTables.forEach((relatedTable) => {
          if (!tables.find((t) => t.tableName === relatedTable.tableName)) {
            tables.push(relatedTable);

            // Add foreign key reference to related table
            const relatedFields = {
              ...relatedTable.fields,
              [`${tableName}_id`]: 0, // INTEGER for foreign key
            };

            sqlStatements.push(
              jsonToPostgresTable(relatedTable.tableName, relatedFields, options)
            );

            // Add foreign key constraint
            const fkName = `fk_${toSnakeCase(relatedTable.tableName)}_${toSnakeCase(tableName)}`;
            const fkStatement = `ALTER TABLE ${toSnakeCase(relatedTable.tableName)}
  ADD CONSTRAINT ${fkName}
  FOREIGN KEY (${toSnakeCase(tableName)}_id)
  REFERENCES ${toSnakeCase(tableName)}(id)
  ON DELETE CASCADE;`;

            sqlStatements.push(fkStatement);
          }
        });
      } else if (Array.isArray(tableData) && tableData.length > 0) {
        // Handle array of objects
        const sampleObject = tableData[0];
        if (typeof sampleObject === 'object') {
          tables.push({ tableName, fields: sampleObject });
          sqlStatements.push(
            jsonToPostgresTable(tableName, sampleObject, options)
          );
        }
      }
    });

    // Add useful indexes
    sqlStatements.push('\n-- Indexes for better query performance');
    tables.forEach((table) => {
      const tableName = options.useSnakeCase
        ? toSnakeCase(table.tableName)
        : table.tableName;

      if (options.addTimestamps) {
        sqlStatements.push(
          `CREATE INDEX idx_${tableName}_created_at ON ${tableName}(created_at);`
        );
      }
    });

    return {
      sql: sqlStatements.join('\n\n'),
      tables,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

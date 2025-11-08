import { TableSchema } from '@/store/useConverterStore';

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
 * Infers Postgres data type from a JavaScript value (simplified for diagram)
 */
function inferSimpleType(value: any): string {
  if (value === null || value === undefined) {
    return 'TEXT';
  }

  const type = typeof value;

  switch (type) {
    case 'string':
      return 'VARCHAR';
    case 'number':
      return Number.isInteger(value) ? 'INT' : 'DECIMAL';
    case 'boolean':
      return 'BOOLEAN';
    case 'object':
      if (Array.isArray(value)) {
        return 'ARRAY';
      }
      return 'JSONB';
    default:
      return 'TEXT';
  }
}

/**
 * Detects foreign key relationships from field names
 */
function detectRelationships(tables: TableSchema[]): {
  from: string;
  to: string;
  relationship: string;
}[] {
  const relationships: { from: string; to: string; relationship: string }[] = [];
  const tableNames = tables.map((t) => toSnakeCase(t.tableName));

  tables.forEach((table) => {
    const tableName = toSnakeCase(table.tableName);

    Object.keys(table.fields).forEach((fieldName) => {
      const fieldNameSnake = toSnakeCase(fieldName);

      // Check if field name matches pattern: {tableName}_id
      tableNames.forEach((potentialRef) => {
        if (
          fieldNameSnake === `${potentialRef}_id` &&
          potentialRef !== tableName
        ) {
          relationships.push({
            from: tableName,
            to: potentialRef,
            relationship: 'many-to-one',
          });
        }
      });

      // Check if field name is exactly another table name (nested object)
      if (tableNames.includes(fieldNameSnake) && fieldNameSnake !== tableName) {
        const value = table.fields[fieldName];
        if (typeof value === 'object' && !Array.isArray(value)) {
          relationships.push({
            from: tableName,
            to: fieldNameSnake,
            relationship: 'one-to-one',
          });
        }
      }
    });
  });

  return relationships;
}

/**
 * Generates Mermaid ER diagram from table schemas
 */
export function generateMermaidDiagram(tables: TableSchema[]): string {
  if (tables.length === 0) {
    return 'erDiagram\n  %% No tables to display';
  }

  let mermaidCode = 'erDiagram\n';

  // Define each table with its attributes
  tables.forEach((table) => {
    const tableName = toSnakeCase(table.tableName);
    mermaidCode += `\n  ${tableName.toUpperCase()} {\n`;

    // Add primary key
    mermaidCode += `    int id PK\n`;

    // Add fields from the JSON
    Object.entries(table.fields).forEach(([fieldName, value]) => {
      // Skip if it's a nested object or array (these become relationships)
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        return;
      }

      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        return;
      }

      const name = toSnakeCase(fieldName);
      const type = inferSimpleType(value).toLowerCase();

      // Mark foreign keys
      const isForeignKey = name.endsWith('_id');
      const keyType = isForeignKey ? 'FK' : '';

      mermaidCode += `    ${type} ${name} ${keyType}\n`;
    });

    // Add timestamps
    mermaidCode += `    timestamp created_at\n`;
    mermaidCode += `    timestamp updated_at\n`;

    mermaidCode += `  }\n`;
  });

  // Detect and add relationships
  const relationships = detectRelationships(tables);

  // Auto-detect relationships from nested structures
  tables.forEach((table) => {
    const tableName = toSnakeCase(table.tableName);

    Object.entries(table.fields).forEach(([fieldName, value]) => {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        // One-to-many relationship
        const relatedTableName = toSnakeCase(fieldName);
        mermaidCode += `\n  ${tableName.toUpperCase()} ||--o{ ${relatedTableName.toUpperCase()} : "has many"`;
      } else if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        // One-to-one or many-to-one relationship
        const relatedTableName = toSnakeCase(fieldName);
        mermaidCode += `\n  ${tableName.toUpperCase()} ||--|| ${relatedTableName.toUpperCase()} : "has one"`;
      }
    });
  });

  // Add detected foreign key relationships
  relationships.forEach((rel) => {
    const symbol =
      rel.relationship === 'one-to-one'
        ? '||--||'
        : rel.relationship === 'many-to-one'
        ? '}o--||'
        : '||--o{';

    mermaidCode += `\n  ${rel.from.toUpperCase()} ${symbol} ${rel.to.toUpperCase()} : "references"`;
  });

  return mermaidCode;
}

/**
 * Generates a complete Mermaid diagram from JSON string
 */
export function jsonToMermaid(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);
    const tables: TableSchema[] = [];

    if (Array.isArray(data)) {
      throw new Error('Please provide a JSON object, not an array at the root level');
    }

    if (typeof data !== 'object') {
      throw new Error('Invalid JSON: Expected an object');
    }

    // Process each top-level key as a table
    Object.entries(data).forEach(([tableName, tableData]) => {
      if (typeof tableData === 'object' && !Array.isArray(tableData)) {
        tables.push({ tableName, fields: tableData as Record<string, any> });

        // Detect nested tables
        Object.entries(tableData as Record<string, any>).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            if (!tables.find((t) => t.tableName === key)) {
              tables.push({ tableName: key, fields: value[0] });
            }
          } else if (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value)
          ) {
            if (!tables.find((t) => t.tableName === key)) {
              tables.push({ tableName: key, fields: value });
            }
          }
        });
      } else if (Array.isArray(tableData) && tableData.length > 0) {
        const sampleObject = tableData[0];
        if (typeof sampleObject === 'object') {
          tables.push({ tableName, fields: sampleObject });
        }
      }
    });

    return generateMermaidDiagram(tables);
  } catch (error) {
    throw new Error(
      `Failed to generate Mermaid diagram: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

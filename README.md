# JSON to Postgres Schema Converter

A modern web application that helps developers, designers, and product managers convert JSON data models into production-ready PostgreSQL schemas with visual ER diagrams.

## Features

- **JSON to SQL Conversion**: Automatically generates PostgreSQL CREATE TABLE statements from JSON objects
- **Visual ER Diagrams**: See your database schema visualized with Mermaid.js entity-relationship diagrams
- **Smart Type Inference**: Automatically detects appropriate PostgreSQL data types from JSON values
- **Relationship Detection**: Identifies and creates foreign key relationships from nested objects and arrays
- **Customizable Options**:
  - Toggle timestamps (created_at, updated_at)
  - Toggle primary keys (id)
  - Choose between camelCase and snake_case naming
- **Example Templates**: Pre-built templates for common use cases (e-commerce, blog, social media, etc.)
- **Copy to Clipboard**: Easy copying of generated SQL and diagrams

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Mantine UI** - Modern React component library
- **Zustand** - Lightweight state management
- **Mermaid.js** - Diagram and flowchart generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Enter JSON Data**: Paste or type your JSON data model in the left panel
2. **Load an Example**: Or select from pre-built example templates
3. **Configure Options**: Toggle timestamps, primary keys, and naming conventions
4. **Convert**: Click "Convert to PostgreSQL" to generate the schema
5. **View Results**: Switch between SQL schema and ER diagram tabs
6. **Copy**: Use the copy buttons to copy SQL or diagrams to clipboard

### JSON Format

The converter expects a JSON object where each top-level key represents a table:

```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "isActive": true
  },
  "post": {
    "user_id": 1,
    "title": "My First Post",
    "content": "Hello world!",
    "publishedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Type Inference

The converter automatically infers PostgreSQL types:

- `string` → `VARCHAR(255)` or `TEXT`
- `number` → `INTEGER` or `DECIMAL(10,2)`
- `boolean` → `BOOLEAN`
- `Date strings` → `TIMESTAMP`
- `UUID strings` → `UUID`
- `Arrays` → PostgreSQL arrays or separate tables
- `Objects` → `JSONB` or separate tables (for nested objects)

### Relationships

- **Nested objects** are detected as one-to-one or many-to-one relationships
- **Arrays of objects** are detected as one-to-many relationships
- **Foreign keys** are automatically created for relationships

## Project Structure

```
json-to-postgres/
├── app/
│   ├── layout.tsx          # Root layout with Mantine providers
│   └── page.tsx            # Home page
├── components/
│   ├── JsonConverter.tsx   # Main converter component
│   └── MermaidDiagram.tsx  # Mermaid diagram renderer
├── store/
│   └── useConverterStore.ts # Zustand state management
├── utils/
│   ├── jsonToSql.ts        # JSON to SQL conversion logic
│   ├── generateMermaid.ts  # Mermaid diagram generation
│   └── exampleTemplates.ts # Example JSON templates
└── package.json
```

## Examples

The application includes several built-in examples:

1. **E-commerce Store** - Products, users, orders, and reviews
2. **Blog Platform** - Articles, authors, comments, and tags
3. **Task Management** - Projects, tasks, team members
4. **Social Media App** - Users, posts, likes, and follows
5. **Simple User Profile** - Basic user data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](LICENSE) file for details.

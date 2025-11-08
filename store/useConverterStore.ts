import { create } from 'zustand';

export interface TableSchema {
  tableName: string;
  fields: Record<string, any>;
}

interface ConverterStore {
  jsonInput: string;
  sqlOutput: string;
  mermaidDiagram: string;
  tables: TableSchema[];
  error: string | null;

  setJsonInput: (json: string) => void;
  setSqlOutput: (sql: string) => void;
  setMermaidDiagram: (diagram: string) => void;
  setTables: (tables: TableSchema[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  jsonInput: '',
  sqlOutput: '',
  mermaidDiagram: '',
  tables: [],
  error: null,
};

export const useConverterStore = create<ConverterStore>((set) => ({
  ...initialState,

  setJsonInput: (jsonInput) => set({ jsonInput }),
  setSqlOutput: (sqlOutput) => set({ sqlOutput }),
  setMermaidDiagram: (mermaidDiagram) => set({ mermaidDiagram }),
  setTables: (tables) => set({ tables }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

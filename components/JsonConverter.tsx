'use client';

import { useState } from 'react';
import {
  Grid,
  Paper,
  Textarea,
  Button,
  Group,
  Select,
  Stack,
  Tabs,
  CopyButton,
  ActionIcon,
  Tooltip,
  Switch,
  Alert,
} from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import {
  IconRefresh,
  IconCopy,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useConverterStore } from '@/store/useConverterStore';
import { convertJsonToPostgres } from '@/utils/jsonToSql';
import { jsonToMermaid } from '@/utils/generateMermaid';
import { MermaidDiagram } from './MermaidDiagram';
import { exampleTemplates } from '@/utils/exampleTemplates';
import { notifications } from '@mantine/notifications';

export function JsonConverter() {
  const {
    jsonInput,
    sqlOutput,
    mermaidDiagram,
    error,
    setJsonInput,
    setSqlOutput,
    setMermaidDiagram,
    setTables,
    setError,
    reset,
  } = useConverterStore();

  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [addTimestamps, setAddTimestamps] = useState(true);
  const [addPrimaryKey, setAddPrimaryKey] = useState(true);
  const [useSnakeCase, setUseSnakeCase] = useState(true);

  const handleConvert = () => {
    try {
      setError(null);

      // Convert to SQL
      const { sql, tables } = convertJsonToPostgres(jsonInput, {
        addTimestamps,
        addPrimaryKey,
        useSnakeCase,
      });

      setSqlOutput(sql);
      setTables(tables);

      // Generate Mermaid diagram
      const diagram = jsonToMermaid(jsonInput);
      setMermaidDiagram(diagram);

      notifications.show({
        title: 'Success',
        message: 'Schema generated successfully!',
        color: 'green',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const handleLoadExample = (exampleName: string | null) => {
    if (!exampleName) return;

    const example = exampleTemplates.find((t) => t.name === exampleName);
    if (example) {
      setJsonInput(example.json);
      setSelectedExample(exampleName);
      setError(null);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedExample(null);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setError(null);
      notifications.show({
        title: 'Formatted',
        message: 'JSON has been formatted',
        color: 'blue',
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Invalid JSON - cannot format',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="md">
      {/* Controls */}
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group>
            <Select
              placeholder="Load an example"
              value={selectedExample}
              onChange={handleLoadExample}
              data={exampleTemplates.map((t) => ({
                value: t.name,
                label: t.name,
              }))}
              clearable
              style={{ flex: 1 }}
            />
            <Button onClick={formatJson} variant="light">
              Format JSON
            </Button>
            <Button onClick={handleReset} variant="light" color="gray">
              Reset
            </Button>
          </Group>

          <Group>
            <Switch
              label="Add timestamps"
              checked={addTimestamps}
              onChange={(e) => setAddTimestamps(e.currentTarget.checked)}
            />
            <Switch
              label="Add primary key"
              checked={addPrimaryKey}
              onChange={(e) => setAddPrimaryKey(e.currentTarget.checked)}
            />
            <Switch
              label="Use snake_case"
              checked={useSnakeCase}
              onChange={(e) => setUseSnakeCase(e.currentTarget.checked)}
            />
          </Group>
        </Stack>
      </Paper>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Grid gutter="md">
        {/* Input Section */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder h="500px" style={{ display: 'flex', flexDirection: 'column' }}>
            <Group mb="sm" justify="space-between">
              <strong>JSON Input</strong>
              <CopyButton value={jsonInput}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'}>
                    <ActionIcon
                      color={copied ? 'teal' : 'gray'}
                      variant="subtle"
                      onClick={copy}
                    >
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              placeholder='{"user": {"name": "John", "email": "john@example.com"}}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.currentTarget.value)}
              styles={{
                input: {
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  height: '100%',
                },
              }}
              style={{ flex: 1 }}
              minRows={20}
            />
            <Button
              onClick={handleConvert}
              fullWidth
              mt="md"
              leftSection={<IconRefresh size={16} />}
              disabled={!jsonInput.trim()}
            >
              Convert to PostgreSQL
            </Button>
          </Paper>
        </Grid.Col>

        {/* Output Section */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Tabs defaultValue="sql" h="500px">
            <Tabs.List>
              <Tabs.Tab value="sql">SQL Schema</Tabs.Tab>
              <Tabs.Tab value="diagram">ER Diagram</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="sql" pt="md">
              <Paper
                p="md"
                withBorder
                h="450px"
                style={{ overflow: 'auto', position: 'relative' }}
              >
                {sqlOutput ? (
                  <>
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                      <CopyButton value={sqlOutput}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied' : 'Copy SQL'}>
                            <ActionIcon
                              color={copied ? 'teal' : 'gray'}
                              variant="subtle"
                              onClick={copy}
                            >
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </div>
                    <CodeHighlight code={sqlOutput} language="sql" />
                  </>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'gray',
                    }}
                  >
                    SQL schema will appear here
                  </div>
                )}
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="diagram" pt="md">
              <div style={{ height: '450px', overflow: 'auto' }}>
                <MermaidDiagram chart={mermaidDiagram} />
              </div>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

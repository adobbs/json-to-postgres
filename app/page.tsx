'use client';

import { Container, Title, Text, Stack } from '@mantine/core';
import { JsonConverter } from '@/components/JsonConverter';

export default function Home() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} size="h1" mb="xs">
            JSON to Postgres Schema Converter
          </Title>
          <Text c="dimmed" size="lg">
            Transform your JSON data models into production-ready Postgres SQL schemas.
            Perfect for developers, designers, and product managers building prototypes.
          </Text>
        </div>
        <JsonConverter />
      </Stack>
    </Container>
  );
}

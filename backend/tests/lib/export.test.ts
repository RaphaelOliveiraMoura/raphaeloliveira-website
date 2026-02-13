import { describe, expect, it } from "vitest";

import { createExportStream, type ExportColumn } from "../../src/lib/export";

/**
 * Helper to collect a Readable stream into a string.
 */
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

interface TestRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const sampleData: TestRow[] = [
  {
    id: "1",
    name: "Alice",
    email: "alice@example.com",
    role: "admin",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Bob",
    email: "bob@example.com",
    role: "user",
    createdAt: "2024-02-20T14:30:00Z",
  },
];

const columns: ExportColumn<TestRow>[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "createdAt", header: "Created At" },
];

describe("export", () => {
  describe("CSV format", () => {
    it("should generate CSV with headers", async () => {
      const stream = createExportStream(sampleData, {
        format: "csv",
        columns,
      });

      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      expect(lines[0]).toBe("ID,Name,Email,Role,Created At");
      expect(lines).toHaveLength(3); // header + 2 data rows
    });

    it("should generate correct data rows", async () => {
      const stream = createExportStream(sampleData, {
        format: "csv",
        columns,
      });

      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      expect(lines[1]).toBe(
        "1,Alice,alice@example.com,admin,2024-01-15T10:00:00Z",
      );
      expect(lines[2]).toBe("2,Bob,bob@example.com,user,2024-02-20T14:30:00Z");
    });

    it("should escape values with commas", async () => {
      const data = [
        {
          id: "1",
          name: "Doe, John",
          email: "john@test.com",
          role: "user",
          createdAt: "",
        },
      ];

      const stream = createExportStream(data, { format: "csv", columns });
      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      expect(lines[1]).toContain('"Doe, John"');
    });

    it("should escape values with double quotes", async () => {
      const data = [
        {
          id: "1",
          name: 'Say "hello"',
          email: "test@test.com",
          role: "user",
          createdAt: "",
        },
      ];

      const stream = createExportStream(data, { format: "csv", columns });
      const csv = await streamToString(stream);

      expect(csv).toContain('"Say ""hello"""');
    });

    it("should escape values with newlines", async () => {
      const data = [
        {
          id: "1",
          name: "Line1\nLine2",
          email: "test@test.com",
          role: "user",
          createdAt: "",
        },
      ];

      const stream = createExportStream(data, { format: "csv", columns });
      const csv = await streamToString(stream);

      expect(csv).toContain('"Line1\nLine2"');
    });

    it("should handle empty data", async () => {
      const stream = createExportStream([], { format: "csv", columns });
      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      // Only header row
      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe("ID,Name,Email,Role,Created At");
    });

    it("should support custom delimiter", async () => {
      const stream = createExportStream(sampleData, {
        format: "csv",
        columns,
        delimiter: ";",
      });

      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      expect(lines[0]).toBe("ID;Name;Email;Role;Created At");
    });

    it("should handle null and undefined values", async () => {
      const data = [
        {
          id: "1",
          name: null as unknown as string,
          email: "test@test.com",
          role: "user",
          createdAt: "",
        },
      ];

      const stream = createExportStream(data, { format: "csv", columns });
      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      // null should be empty string
      expect(lines[1]).toBe("1,,test@test.com,user,");
    });
  });

  describe("JSON format", () => {
    it("should generate valid JSON array", async () => {
      const stream = createExportStream(sampleData, {
        format: "json",
        columns,
      });

      const json = await streamToString(stream);
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it("should use column headers as keys", async () => {
      const stream = createExportStream(sampleData, {
        format: "json",
        columns,
      });

      const json = await streamToString(stream);
      const parsed = JSON.parse(json);

      expect(parsed[0]).toEqual({
        ID: "1",
        Name: "Alice",
        Email: "alice@example.com",
        Role: "admin",
        "Created At": "2024-01-15T10:00:00Z",
      });
    });

    it("should handle empty data", async () => {
      const stream = createExportStream([], { format: "json", columns });
      const json = await streamToString(stream);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual([]);
    });
  });

  describe("transform functions", () => {
    it("should apply transform to cell values", async () => {
      const transformColumns: ExportColumn<TestRow>[] = [
        { key: "name", header: "Name" },
        {
          key: "role",
          header: "Role",
          transform: (value) => (value as string).toUpperCase(),
        },
      ];

      const stream = createExportStream(sampleData, {
        format: "csv",
        columns: transformColumns,
      });

      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      expect(lines[1]).toBe("Alice,ADMIN");
      expect(lines[2]).toBe("Bob,USER");
    });

    it("should pass the full row to transform", async () => {
      const transformColumns: ExportColumn<TestRow>[] = [
        {
          key: "name",
          header: "Full Info",
          transform: (_value, row) => `${row.name} (${row.role})`,
        },
      ];

      const stream = createExportStream(sampleData, {
        format: "csv",
        columns: transformColumns,
      });

      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      expect(lines[1]).toBe("Alice (admin)");
    });
  });

  describe("nested values", () => {
    it("should support dot notation for nested keys", async () => {
      const nestedData = [{ id: "1", meta: { country: "BR", city: "SP" } }];

      const nestedColumns: ExportColumn<(typeof nestedData)[0]>[] = [
        { key: "id", header: "ID" },
        {
          key: "meta.country" as keyof (typeof nestedData)[0],
          header: "Country",
        },
        { key: "meta.city" as keyof (typeof nestedData)[0], header: "City" },
      ];

      const stream = createExportStream(nestedData, {
        format: "csv",
        columns: nestedColumns,
      });

      const csv = await streamToString(stream);
      const lines = csv.trim().split("\n");

      expect(lines[0]).toBe("ID,Country,City");
      expect(lines[1]).toBe("1,BR,SP");
    });
  });
});

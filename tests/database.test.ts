import { describe, expect, it } from "vitest";
import { Database, type DatabaseDriver, type DatabaseResult, type DatabaseRow } from "@/lib/database";

describe("database adapter", () => {
  it("normalizes reads and sends related writes through one batch call", async () => {
    let batchCalls = 0;
    const driver: DatabaseDriver = {
      async execute<T extends DatabaseRow>() { return { results: [{ value: "ok" }], meta: { changes: 1 } } as unknown as DatabaseResult<T>; },
      async batch(statements) { batchCalls += 1; return statements.map(() => ({ results: [], meta: { changes: 1 } })); },
    };
    const database = new Database(driver);
    expect(await database.prepare("SELECT ? AS value").bind("ok").first()).toEqual({ value: "ok" });
    expect(await database.batch([database.prepare("UPDATE a SET x=?").bind(1), database.prepare("UPDATE b SET x=?").bind(2)])).toHaveLength(2);
    expect(batchCalls).toBe(1);
  });
});

import { createClient, type Client, type InValue } from "@libsql/client/web";
import { runtime } from "./runtime";

export type SqlValue = string | number | boolean | null | Uint8Array;
export type DatabaseRow = Record<string, unknown>;

export type DatabaseResult<T extends DatabaseRow = DatabaseRow> = {
  results: T[];
  meta: { changes: number };
};

type StatementDescriptor = { sql: string; args: SqlValue[] };

export interface DatabaseDriver {
  execute<T extends DatabaseRow>(statement: StatementDescriptor): Promise<DatabaseResult<T>>;
  batch(statements: StatementDescriptor[]): Promise<DatabaseResult[]>;
}

export class PreparedStatement {
  constructor(
    private readonly driver: DatabaseDriver,
    readonly sql: string,
    readonly args: SqlValue[] = [],
  ) {}

  bind(...args: SqlValue[]): PreparedStatement {
    return new PreparedStatement(this.driver, this.sql, args);
  }

  all<T extends DatabaseRow = DatabaseRow>(): Promise<DatabaseResult<T>> {
    return this.driver.execute<T>({ sql: this.sql, args: this.args });
  }

  async first<T extends DatabaseRow = DatabaseRow>(): Promise<T | null> {
    const result = await this.all<T>();
    return result.results[0] ?? null;
  }

  run(): Promise<DatabaseResult> {
    return this.driver.execute({ sql: this.sql, args: this.args });
  }

  descriptor(): StatementDescriptor {
    return { sql: this.sql, args: this.args };
  }
}

export class Database {
  constructor(private readonly driver: DatabaseDriver) {}

  prepare(sql: string): PreparedStatement {
    return new PreparedStatement(this.driver, sql);
  }

  batch(statements: PreparedStatement[]): Promise<DatabaseResult[]> {
    return this.driver.batch(statements.map((statement) => statement.descriptor()));
  }
}

class D1Driver implements DatabaseDriver {
  constructor(private readonly database: D1Database) {}

  async execute<T extends DatabaseRow>(statement: StatementDescriptor): Promise<DatabaseResult<T>> {
    const result = await this.database.prepare(statement.sql).bind(...statement.args).all<T>();
    return {
      results: result.results,
      meta: { changes: Number(result.meta?.changes ?? 0) },
    };
  }

  async batch(statements: StatementDescriptor[]): Promise<DatabaseResult[]> {
    const prepared = statements.map(({ sql, args }) => this.database.prepare(sql).bind(...args));
    const results = await this.database.batch(prepared);
    return results.map((result) => ({
      results: result.results as DatabaseRow[],
      meta: { changes: Number(result.meta?.changes ?? 0) },
    }));
  }
}

class LibsqlDriver implements DatabaseDriver {
  constructor(private readonly client: Client) {}

  async execute<T extends DatabaseRow>(statement: StatementDescriptor): Promise<DatabaseResult<T>> {
    const result = await this.client.execute({
      sql: statement.sql,
      args: statement.args as InValue[],
    });
    return {
      results: result.rows.map((row) => ({ ...row }) as unknown as T),
      meta: { changes: result.rowsAffected },
    };
  }

  async batch(statements: StatementDescriptor[]): Promise<DatabaseResult[]> {
    // libSQL write batches are transactions and roll back when a statement fails.
    const results = await this.client.batch(
      statements.map(({ sql, args }) => ({ sql, args: args as InValue[] })),
      "write",
    );
    return results.map((result) => ({
      results: result.rows.map((row) => ({ ...row })),
      meta: { changes: result.rowsAffected },
    }));
  }
}

let cachedDatabase: Database | undefined;

export function db(): Database {
  if (cachedDatabase) return cachedDatabase;

  const env = runtime();
  const url = String(env.TURSO_DATABASE_URL ?? env.LIBSQL_URL ?? "");
  const authToken = String(env.TURSO_AUTH_TOKEN ?? env.LIBSQL_AUTH_TOKEN ?? "");

  if (url && authToken) {
    cachedDatabase = new Database(
      new LibsqlDriver(createClient({ url, authToken, intMode: "number" })),
    );
    return cachedDatabase;
  }

  if (env.DB) {
    cachedDatabase = new Database(new D1Driver(env.DB));
    return cachedDatabase;
  }

  throw new Error("Storage unavailable. Configure Turso credentials or the D1 DB binding.");
}

export function setDatabaseForTests(database?: Database): void {
  cachedDatabase = database;
}

import { TABLE_KEY } from "./entity";

export const COLUMN_KEY = Symbol("ORM::COLUMN");
export const PRIMARY_COLUMN_KEY = Symbol("ORM::PRIMARY_COLUMN");

interface ColumnOptions {
  type: "text" | "int";
  name?: string;
  nullable?: boolean;
  default?: string | number;
}

interface PrimaryOptions {
  type: "uuid" | "int";
  name?: string;
  incremented?: boolean;
}

export interface Constructor<T = any, Args extends any[] = any[]> {
  new (...args: Args): T;
}

export interface ColumnMeta {
  column: string;
  type: string;
}

export interface ColumnMetaRegistry {
  registry: Map<string | symbol, ColumnMeta>;
}

export interface PrimaryMeta {
  column: string;
  type: string;
  primary: true;
  incremented: boolean;
}

export function Column(options: ColumnOptions): PropertyDecorator {
  return (target, key) => {
    if (!key) {
      throw new ReferenceError("Invalid usage! You should decorate property!");
    }

    let meta = Reflect.getMetadata(COLUMN_KEY, target) as ColumnMetaRegistry;

    if (!meta) {
      meta = {
        registry: new Map(),
      };
    }

    meta.registry.set(key, {
      column: options.name ?? (key as string),
      type: options.type ?? "text",
    });

    Reflect.defineMetadata(COLUMN_KEY, meta, target);
  };
}

export function PrimaryColumn(options: PrimaryOptions): PropertyDecorator {
  return (target, key) => {
    const meta = Reflect.getMetadata(PRIMARY_COLUMN_KEY, target, key);
    if (meta) {
      throw new Error("Already registered primary column");
    }

    Reflect.defineMetadata(
      PRIMARY_COLUMN_KEY,
      {
        column: options.name ?? key,
        type: options.type ?? "int",
        primary: true,
        incremented: options.incremented ?? true,
      },
      target
    );
  };
}

export function getAllColumns(cls: Constructor) {
  const primaryColumn = Reflect.getMetadata(
    PRIMARY_COLUMN_KEY,
    cls
  ) as PrimaryMeta;
  const meta = Reflect.getMetadata(COLUMN_KEY, cls) as ColumnMetaRegistry;

  const columns = Array.from(meta.registry.entries()).reduce<ColumnMeta[]>(
    (acc, [_, data]) => {
      acc.push(data);

      return acc;
    },
    []
  );

  return {
    columns,
    primaryColumn,
  };
}

export function prepareStatement(cls: Constructor): string {
  const { columns, primaryColumn } = getAllColumns(cls);
  const { name } = Reflect.getMetadata(TABLE_KEY, cls);
  const mappedColumns = columns
    .map((col) => `${col.column} ${col.type}`)
    .join(",");

  return `CREATE TABLE IF NOT EXISTS ${name} (${primaryColumn.column} SERIAL, ${mappedColumns})`;
}

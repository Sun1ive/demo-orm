import "reflect-metadata";
import { Pool } from "pg";
import { Entity } from "./decorators/entity";
import { Column, PrimaryColumn } from "./decorators/column";

export const DB_KEY = Symbol("DB::CLIENT");

@Entity()
class MyTable {
  @PrimaryColumn({ type: "int", incremented: true })
  public id: number;

  @Column({ type: "text", nullable: true })
  public name: string;

  @Column({ type: "text", nullable: true })
  public guild: string;
}

async function start() {
  let meta = Reflect.getMetadata(DB_KEY, global);
  if (!meta) {
    meta = Object.create(null);
  }

  const pool = new Pool({
    Promise,
    host: "localhost",
    database: "test-db",
    user: "postgres",
    password: "postgres",
    log: (messages) => {
      console.log(messages);
    },
    port: 5667,
    ssl: false,
  });

  process.on("SIGINT", async () => {
    console.log("EXIT PROCESS");
    await pool.end();
  });

  try {
    const client = await pool.connect();
    Reflect.defineMetadata(
      DB_KEY,
      {
        pool,
        client,
      },
      global
    );
    const e = new MyTable();
    (e as any).init();
  } catch (error) {
    console.log({ error });
  }
}

start();

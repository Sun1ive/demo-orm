import { DB_KEY } from "..";
import { Client, Pool } from "pg";
import { getAllColumns, prepareStatement } from "./column";

export const TABLE_KEY = Symbol("ORM::ENTITY");

export function Entity(): ClassDecorator {
  return (cls) => {
    return class extends (cls as any) {
      constructor() {
        super();
        console.log("constructor");

        Reflect.defineMetadata(TABLE_KEY, { name: cls.name }, cls.prototype);

        this.init = async () => {
          const { client, pool } = Reflect.getMetadata(DB_KEY, global) as {
            pool: Pool;
            client: Client;
          };

          const { rows, rowCount } = await client.query(
            "select * from information_schema.tables where table_name = 'foo'"
          );
          if (rowCount === 0) {
            const metadata = getAllColumns(cls.prototype);
            const sql = prepareStatement(cls.prototype);
            console.log(JSON.stringify(metadata, null, 2));
            console.log(sql);

            // await client.query(`CREATE TABLE ${cls.name}`);
          }

          console.log({
            rows,
            rowCount,
          });
          console.log(cls.name);
        };
      }
    } as any;
  };
}

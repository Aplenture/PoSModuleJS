/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { OrderTables } from "../../models/orderTables";

export class CreateOrderProductTable extends BackendJS.Database.Update<OrderTables> {
    public readonly name = "CreateOrderProductTable";
    public readonly version = 1;
    public readonly timestamp = '2023-09-11';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(tables: OrderTables) {
        super(tables);

        this.reset = `TRUNCATE TABLE ${tables.products}`;
        this.revert = `DROP TABLE IF EXISTS ${tables.products}`;
        this.update = `CREATE TABLE IF NOT EXISTS ${tables.products} (
            \`order\` BIGINT NOT NULL,
            \`product\` BIGINT NOT NULL,
            \`price\` INT NOT NULL,
            \`amount\` INT NOT NULL,
            PRIMARY KEY (\`order\`,\`product\`)
        ) DEFAULT CHARSET=utf8`;
    }
}
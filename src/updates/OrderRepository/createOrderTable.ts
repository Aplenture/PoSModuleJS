/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { OrderTables } from "../../models/orderTables";

export class CreateOrderTable extends BackendJS.Database.Update<OrderTables> {
    public readonly name = "CreateOrderTable";
    public readonly version = 2;
    public readonly timestamp = '2023-09-11';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(tables: OrderTables) {
        super(tables);

        this.reset = `TRUNCATE TABLE ${tables.orders}`;
        this.revert = `DROP TABLE IF EXISTS ${tables.orders}`;
        this.update = `CREATE TABLE IF NOT EXISTS ${tables.orders} (
            \`id\` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            \`account\` BIGINT NOT NULL,
            \`created\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`closed\` TIMESTAMP NULL DEFAULT NULL,
            \`state\` INT DEFAULT 0,
            \`customer\` BIGINT NOT NULL,
            \`paymentMethod\` INT DEFAULT 0,
            \`tip\` INT DEFAULT 0,
            UNIQUE (\`account\`,\`customer\`)
        ) DEFAULT CHARSET=utf8`;
    }
}
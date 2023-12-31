/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";

export class CreateCustomerTable extends BackendJS.Database.Update<string> {
    public readonly name = "CreateCustomerTable";
    public readonly version = 1;
    public readonly timestamp = '2023-09-11';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(table: string) {
        super(table);

        this.reset = `TRUNCATE TABLE ${table}`;
        this.revert = `DROP TABLE IF EXISTS ${table}`;
        this.update = `CREATE TABLE IF NOT EXISTS ${table} (
            \`id\` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            \`account\` BIGINT NOT NULL,
            \`created\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`firstname\` VARCHAR(64) NOT NULL,
            \`lastname\` VARCHAR(32) NOT NULL,
            \`nickname\` VARCHAR(32) DEFAULT '',
            \`paymentMethods\` INT DEFAULT -1,
            UNIQUE (\`account\`,\`firstname\`,\`lastname\`,\`nickname\`)
        ) DEFAULT CHARSET=utf8`;
    }
}
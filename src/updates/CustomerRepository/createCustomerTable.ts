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
            \`created\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`firstname\` CHAR(24) NOT NULL,
            \`lastname\` CHAR(24) NOT NULL,
            \`nickname\` CHAR(24) DEFAULT '',
            UNIQUE (\`firstname\`,\`lastname\`,\`nickname\`)
        ) DEFAULT CHARSET=utf8`;
    }
}
/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";

export class CreateProductTable extends BackendJS.Database.Update<string> {
    public readonly name = "CreateProductTable";
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
            \`name\` CHAR(24) NOT NULL,
            \`price\` INT NOT NULL,
            \`discount\` INT NOT NULL,
            UNIQUE (\`account\`,\`name\`)
        ) DEFAULT CHARSET=utf8`;
    }
}
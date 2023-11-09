/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";

export class CreateTransactionLabelTable extends BackendJS.Database.Update<string> {
    public readonly name = "CreateTransactionLabelTable";
    public readonly version = 1;
    public readonly timestamp = '2023-11-09';

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
            \`type\` INT NOT NULL,
            \`name\` VARCHAR(64) NOT NULL,
            UNIQUE (\`account\`,\`name\`)
        ) DEFAULT CHARSET=utf8`;
    }
}
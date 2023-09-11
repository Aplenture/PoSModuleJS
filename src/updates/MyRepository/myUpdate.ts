/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";

export class MyUpdate extends BackendJS.Database.Update<string> {
    public readonly name = "MyUpdate";
    public readonly version = 1;
    public readonly timestamp = '2023-08-26';

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
            \`name\` TEXT NULL
        ) DEFAULT CHARSET=utf8`;
    }
}
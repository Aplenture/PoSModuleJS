/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";

export class CreateDefaultLabel extends BackendJS.Database.Update<string> {
    public readonly name = "CreateDefaultLabel";
    public readonly version = 2;
    public readonly timestamp = '2023-12-13';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(table: string) {
        super(table);

        this.reset = ``;
        this.revert = `DELETE FROM ${table} WHERE \`id\`=0`;
        this.update = `INSERT INTO ${table} (\`account\`,\`type\`,\`name\`) VALUES (0,0,'#_title_default')`;
    }
}
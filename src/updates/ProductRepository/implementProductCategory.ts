/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";

export class ImplementProductCategory extends BackendJS.Database.Update<string> {
    public readonly name = "ImplementProductCategory";
    public readonly version = 2;
    public readonly timestamp = '2023-12-05';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(table: string) {
        super(table);

        this.reset = ``;
        this.revert = `ALTER TABLE ${table} DROP COLUMN \`category\``;
        this.update = `ALTER TABLE ${table} ADD COLUMN \`category\` INT DEFAULT 1`;
    }
}
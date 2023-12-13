/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";

export class ImplementLabelPriortiy extends BackendJS.Database.Update<string> {
    public readonly name = "ImplementLabelPriortiy";
    public readonly version = 3;
    public readonly timestamp = '2023-12-13';

    public readonly update: string;
    public readonly reset: string;
    public readonly revert: string;

    constructor(table: string) {
        super(table);

        this.reset = ``;
        this.revert = `ALTER TABLE ${table} DROP COLUMN \`priority\``;
        this.update = `ALTER TABLE ${table} ADD COLUMN \`priority\` INT DEFAULT 0`;
    }
}
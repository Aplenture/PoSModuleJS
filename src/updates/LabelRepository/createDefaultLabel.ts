/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { LabelType } from "../../enums";

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
        this.revert = `DELETE FROM ${table} WHERE \`account\`=0 AND \`type\`=${LabelType.Default} AND \`name\`='#_title_default'`;
        this.update = `INSERT INTO ${table} (\`account\`,\`type\`,\`name\`) VALUES (0,${LabelType.Default},'#_title_default')`;
    }
}
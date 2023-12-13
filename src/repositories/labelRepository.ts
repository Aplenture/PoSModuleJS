/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { LabelType } from "../enums";
import { Label } from "../models";

export class LabelRepository extends BackendJS.Database.Repository<string> {
    public async create(account: number, type: LabelType, name: string): Promise<Label> {
        const result = await this.database.query(`INSERT INTO ${this.data} (\`account\`,\`type\`,\`name\`) VALUES (?,?,?)`, [
            account,
            type,
            name
        ]);

        return {
            id: result.insertId,
            account,
            type,
            name
        };
    }

    public async getAll(account: number, ...types: LabelType[]): Promise<Label[]> {
        const where = ['(`account`=? OR `account`=0)'];
        const values = [account];

        if (types.length) {
            where.push(`\`type\` IN (0,${types.map(() => '?').join(',')})`);
            values.push(...types);
        }

        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE ${where.join(' AND ')} ORDER BY \`id\` ASC`, values);

        if (!result.length)
            return [];

        return result.map(data => ({
            id: data.id,
            account: data.account,
            type: data.type,
            name: data.name
        }));
    }
}
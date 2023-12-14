/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { LabelType } from "../enums";
import { Label } from "../models";

interface CreateData {
    readonly account: number;
    readonly type: LabelType;
    readonly name: string;
    readonly priority?: number;
}

export class LabelRepository extends BackendJS.Database.Repository<string> {
    public async create(data: CreateData): Promise<Label> {
        const result = await this.database.query(`INSERT INTO ${this.data} (\`account\`,\`type\`,\`name\`,\`priority\`) VALUES (?,?,?,?)`, [
            data.account,
            data.type,
            data.name,
            data.priority ?? 0
        ]);

        return {
            id: result.insertId,
            account: data.account,
            type: data.type,
            name: data.name,
            priority: data.priority ?? 0
        };
    }

    public async getAll(account: number, ...types: LabelType[]): Promise<Label[]> {
        const where = ['(`account`=? OR `account`=0)'];
        const values = [account];

        if (types.length) {
            where.push(`\`type\` IN (${types.map(() => '?').join(',')})`);
            values.push(...types);
        }

        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE ${where.join(' AND ')} ORDER BY \`id\` ASC`, values);

        if (!result.length)
            return [];

        return result.map(data => ({
            id: data.id,
            account: data.account,
            type: data.type,
            name: data.name,
            priority: data.priority
        }));
    }
}
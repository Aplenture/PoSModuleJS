/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { TransactionType } from "../enums";
import { TransactionLabel } from "../models";

export class TransactionLabelRepository extends BackendJS.Database.Repository<string> {
    public async create(account: number, type: TransactionType, name: string): Promise<TransactionLabel> {
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

    public async getAll(account: number, type?: TransactionType): Promise<TransactionLabel[]> {
        const where = ['`account`=?'];
        const values = [account];

        if (type) {
            where.push('`type`=?');
            values.push(type);
        }

        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE ${where.join(' AND ')}`, values);

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
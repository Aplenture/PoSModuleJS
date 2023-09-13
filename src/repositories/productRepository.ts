/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { Product } from "../models";

const MAX_LIMIT = 1000;

interface EditOptions {
    readonly name?: string;
    readonly price?: number;
    readonly discount?: number;
}

interface GetAllOptions {
    readonly limit?: number;
    readonly firstID?: number;
    readonly lastID?: number;
}

export class ProductRepository extends BackendJS.Database.Repository<string> {
    public async create(name: string, price: number, discount = 0): Promise<Product> {
        const result = await this.database.query(`
            INSERT INTO ${this.data} (\`name\`,\`price\`,\`discount\`) VALUES (?,?,?);
            SELECT * FROM ${this.data} WHERE \`id\`=LAST_INSERT_ID() LIMIT 1;
        `, [
            name,
            price,
            discount
        ]);


        const { id, created } = result[1][0];

        return {
            id,
            created: BackendJS.Database.parseToTime(created),
            name,
            price,
            discount
        };
    }

    public async edit(id: number, options: EditOptions = {}): Promise<boolean> {
        const keys = [];
        const values = [];

        if (options.name) {
            keys.push('`name`=?');
            values.push(options.name);
        }

        if (undefined != options.price) {
            keys.push('`price`=?');
            values.push(options.price);
        }

        if (undefined != options.discount) {
            keys.push('`discount`=?');
            values.push(options.discount);
        }

        if (0 == keys.length)
            return false;

        values.push(id);

        const result = await this.database.query(`UPDATE ${this.data} SET ${keys.join(',')} WHERE \`id\`=?`, values);

        return 1 == result.affectedRows;
    }

    public async getAll(options: GetAllOptions = {}): Promise<Product[]> {
        const limit = Math.min(MAX_LIMIT, options.limit || MAX_LIMIT);
        const values = [];
        const keys = [];

        if (options.firstID) {
            values.push(options.firstID);
            keys.push('`id`>=?');
        }

        if (options.lastID) {
            values.push(options.lastID);
            keys.push('`id`<=?');
        }

        const where = keys.length
            ? 'WHERE ' + keys.join(' AND ')
            : '';

        const result = await this.database.query(`SELECT * FROM ${this.data} ${where} LIMIT ${limit};`, values);

        return result.map(data => ({
            id: data.id,
            created: BackendJS.Database.parseToTime(data.created),
            name: data.name,
            price: data.price,
            discount: data.discount
        }));
    }
}
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
    public async create(account: number, name: string, price: number, discount = 0): Promise<Product> {
        const result = await this.database.query(`
            INSERT INTO ${this.data} (\`account\`,\`name\`,\`price\`,\`discount\`) VALUES (?,?,?,?);
            SELECT * FROM ${this.data} WHERE \`id\`=LAST_INSERT_ID() LIMIT 1;
        `, [
            account,
            name,
            price,
            discount
        ]);


        const { id, created } = result[1][0];

        return {
            id,
            account,
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

        return 0 < result.affectedRows;
    }

    public async delete(id: number): Promise<boolean> {
        const result = await this.database.query(`DELETE FROM ${this.data} WHERE \`id\`=?`, [
            id
        ]);

        return 0 < result.affectedRows;
    }

    public has(id: number): Promise<boolean> {
        return this.get(id).then(result => !!result);
    }

    public async get(id: number): Promise<Product | null> {
        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE \`id\`=? LIMIT 1`, [
            id
        ]);

        if (!result.length)
            return null;

        const { account, created, name, price, discount } = result[0];

        return {
            id,
            account,
            created: BackendJS.Database.parseToTime(created),
            name,
            price,
            discount
        };
    }

    public async getAll(account: number, options: GetAllOptions = {}): Promise<Product[]> {
        const limit = Math.min(MAX_LIMIT, options.limit || MAX_LIMIT);
        const values = [account];
        const keys = ['`account`=?'];

        if (options.firstID) {
            values.push(options.firstID);
            keys.push('`id`>=?');
        }

        if (options.lastID) {
            values.push(options.lastID);
            keys.push('`id`<=?');
        }

        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE ${keys.join(' AND ')} ORDER BY \`id\` ASC LIMIT ${limit}`, values);

        return result.map(data => ({
            id: data.id,
            account: data.account,
            created: BackendJS.Database.parseToTime(data.created),
            name: data.name,
            price: data.price,
            discount: data.discount
        }));
    }
}
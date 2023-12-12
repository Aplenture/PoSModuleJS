/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { Product } from "../models";

const MAX_LIMIT = 1000;

interface CreateOptions {
    readonly account: number;
    readonly name: string;
    readonly price: number;
    readonly category: number;
    readonly discount?: number;
    readonly priority?: number;
    readonly start?: number;
    readonly end?: number;
}

interface EditOptions {
    readonly name?: string;
    readonly price?: number;
    readonly discount?: number;
    readonly category?: number;
    readonly priority?: number;
    readonly start?: number;
    readonly end?: number;
}

interface GetAllOptions {
    readonly limit?: number;
    readonly firstID?: number;
    readonly lastID?: number;
    readonly time?: number;
}

export class ProductRepository extends BackendJS.Database.Repository<string> {
    public async create(data: CreateOptions): Promise<Product> {
        const result = await this.database.query(`
            INSERT INTO ${this.data} (\`account\`,\`name\`,\`price\`,\`discount\`,\`category\`,\`priority\`,\`start\`,\`end\`) VALUES (?,?,?,?,?,?,?,?);
            SELECT * FROM ${this.data} WHERE \`id\`=LAST_INSERT_ID() LIMIT 1;
        `, [
            data.account,
            data.name,
            data.price,
            data.discount || 0,
            data.category,
            data.priority || 0,
            BackendJS.Database.parseFromTime(data.start),
            BackendJS.Database.parseFromTime(data.end)
        ]);

        return {
            id: result[1][0].id,
            account: result[1][0].account,
            created: BackendJS.Database.parseToTime(result[1][0].created),
            name: result[1][0].name,
            price: result[1][0].price,
            discount: result[1][0].discount,
            category: result[1][0].category,
            priority: result[1][0].priority,
            start: BackendJS.Database.parseToTime(result[1][0].start),
            end: BackendJS.Database.parseToTime(result[1][0].end)
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

        if (undefined != options.category) {
            keys.push('`category`=?');
            values.push(options.category);
        }

        if (undefined != options.priority) {
            keys.push('`priority`=?');
            values.push(options.priority);
        }

        if (undefined !== options.start) {
            keys.push('`start`=?');
            values.push(BackendJS.Database.parseFromTime(options.start));
        }

        if (undefined !== options.end) {
            keys.push('`end`=?');
            values.push(BackendJS.Database.parseFromTime(options.end));
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

        return {
            id: result[0].id,
            account: result[0].account,
            created: BackendJS.Database.parseToTime(result[0].created),
            name: result[0].name,
            price: result[0].price,
            discount: result[0].discount,
            category: result[0].category,
            priority: result[0].priority,
            start: BackendJS.Database.parseToTime(result[0].start),
            end: BackendJS.Database.parseToTime(result[0].end)
        };
    }

    public async getAll(account: number, options: GetAllOptions = {}): Promise<Product[]> {
        const limit = Math.min(MAX_LIMIT, options.limit || MAX_LIMIT);
        const values: any[] = [account];
        const keys = ['`account`=?'];

        if (options.firstID) {
            values.push(options.firstID);
            keys.push('`id`>=?');
        }

        if (options.lastID) {
            values.push(options.lastID);
            keys.push('`id`<=?');
        }

        if (options.time) {
            values.push(BackendJS.Database.parseFromTime(options.time));
            keys.push('(`start` IS NULL OR `start`<=?)');

            values.push(BackendJS.Database.parseFromTime(options.time));
            keys.push('(`end` IS NULL OR `end`>=?)');
        }

        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE ${keys.join(' AND ')} LIMIT ${limit}`, values);

        return result.map(data => ({
            id: data.id,
            account: data.account,
            created: BackendJS.Database.parseToTime(data.created),
            name: data.name,
            price: data.price,
            discount: data.discount,
            category: data.category,
            priority: data.priority,
            start: BackendJS.Database.parseToTime(data.start),
            end: BackendJS.Database.parseToTime(data.end)
        }));
    }
}
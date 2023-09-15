/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { Customer } from "../models";

const MAX_LIMIT = 1000;

interface CreateOptions {
    readonly lastname?: string;
    readonly nickname?: string;
    readonly paymentMethods?: number;
}

interface EditOptions {
    readonly firstname?: string;
    readonly lastname?: string;
    readonly nickname?: string;
}

interface GetAllOptions {
    readonly limit?: number;
    readonly firstID?: number;
    readonly lastID?: number;
}

export class CustomerRepository extends BackendJS.Database.Repository<string> {
    public async create(firstname: string, options: CreateOptions = {}): Promise<Customer> {
        const lastname = options.lastname || '';
        const nickname = options.nickname || '';
        const paymentMethods = options.paymentMethods || -1;

        const result = await this.database.query(`
            INSERT INTO ${this.data} (\`firstname\`,\`lastname\`,\`nickname\`,\`paymentMethods\`) VALUES (?,?,?,?);
            SELECT * FROM ${this.data} WHERE \`id\`=LAST_INSERT_ID() LIMIT 1;
        `, [
            firstname,
            lastname,
            nickname,
            paymentMethods
        ]);


        const { id, created } = result[1][0];

        return {
            id,
            created: BackendJS.Database.parseToTime(created),
            firstname,
            lastname,
            nickname,
            paymentMethods
        };
    }

    public async edit(id: number, options: EditOptions = {}): Promise<boolean> {
        const keys = [];
        const values = [];

        if (options.firstname) {
            keys.push('`firstname`=?');
            values.push(options.firstname);
        }

        if (options.lastname) {
            keys.push('`lastname`=?');
            values.push(options.lastname);
        }

        if (options.nickname) {
            keys.push('`nickname`=?');
            values.push(options.nickname);
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

    public async get(id: number): Promise<Customer | null> {
        const result = await this.database.query(`SELECT * FROM ${this.data} WHERE \`id\`=?`, [
            id
        ]);

        if (!result.length)
            return null;

        const { created, firstname, lastname, nickname, paymentMethods } = result[0];

        return {
            id,
            created: BackendJS.Database.parseToTime(created),
            firstname,
            lastname,
            nickname,
            paymentMethods
        };
    }

    public async getAll(options: GetAllOptions = {}): Promise<Customer[]> {
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
            firstname: data.firstname,
            lastname: data.lastname,
            nickname: data.nickname,
            paymentMethods: data.paymentMethods
        }));
    }
}
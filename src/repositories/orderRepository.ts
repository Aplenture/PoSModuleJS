/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { OrderTables } from "../models/orderTables";
import { Order, OrderProduct } from "../models";
import { OrderState, PaymentMethod } from "../enums";

const MAX_LIMIT = 100;

interface UpdateOptions {
    readonly amount?: number;
    readonly price?: number;
}

interface GetOrdersOptions {
    readonly customer?: number;
    readonly start?: number;
    readonly end?: number;
    readonly state?: OrderState;
    readonly limit?: number;
    readonly paymentMethod?: PaymentMethod;
}

interface CloseData {
    readonly id: number;
    readonly paymentMethod: PaymentMethod;
    readonly tip?: number;
    readonly time?: number;
}

export class OrderRepository extends BackendJS.Database.Repository<OrderTables> {
    public async createOrder(account: number, customer: number, paymentMethod = PaymentMethod.None): Promise<Order | null> {
        const result = await this.database.query(`
        IF NOT EXISTS (SELECT * FROM ${this.data.orders} WHERE \`account\`=? AND \`customer\`=? AND \`state\`=? LIMIT 1) THEN
            INSERT INTO ${this.data.orders} (\`account\`,\`customer\`,\`paymentMethod\`) VALUES (?,?,?);
            SELECT * FROM ${this.data.orders} WHERE \`id\`=LAST_INSERT_ID() LIMIT 1;
        END IF;`, [
            account,
            customer,
            OrderState.Open,
            account,
            customer,
            paymentMethod
        ]);

        if (!result.length)
            return null;

        const { id, updated, state, tip } = result[0][0];

        return {
            id,
            account,
            updated: BackendJS.Database.parseToTime(updated),
            state,
            customer,
            paymentMethod,
            tip
        };
    }

    public async closeOrder(data: CloseData): Promise<Order | null> {
        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.orders} WHERE \`id\`=? AND \`state\`=? LIMIT 1) THEN
            UPDATE ${this.data.orders} SET \`updated\`=?,\`state\`=?,\`paymentMethod\`=?,\`tip\`=? WHERE \`id\`=?;
            SELECT * FROM ${this.data.orders} WHERE \`id\`=? LIMIT 1;
        END IF;`, [
            data.id,
            OrderState.Open,
            BackendJS.Database.parseFromTime(data.time),
            OrderState.Closed,
            data.paymentMethod,
            data.tip || 0,
            data.id,
            data.id
        ]);

        if (!result.length)
            return null;

        return {
            id: result[0][0].id,
            account: result[0][0].account,
            updated: BackendJS.Database.parseToTime(result[0][0].updated),
            state: result[0][0].state,
            customer: result[0][0].customer,
            paymentMethod: result[0][0].paymentMethod,
            tip: result[0][0].tip
        };
    }

    public async reopenOrder(id: number, paymentMethod = PaymentMethod.None): Promise<Order | null> {
        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.orders} WHERE \`id\`=? AND \`state\`=? LIMIT 1) THEN
            UPDATE ${this.data.orders} SET \`state\`=?,\`paymentMethod\`=?,\`tip\`=0 WHERE \`id\`=?;
            SELECT * FROM ${this.data.orders} WHERE \`id\`=? LIMIT 1;
        END IF;`, [
            id,
            OrderState.Closed,
            OrderState.Open,
            paymentMethod,
            id,
            id
        ]);

        if (!result.length)
            return null;

        return {
            id: result[0][0].id,
            account: result[0][0].account,
            updated: BackendJS.Database.parseToTime(result[0][0].updated),
            state: result[0][0].state,
            customer: result[0][0].customer,
            paymentMethod: result[0][0].paymentMethod,
            tip: result[0][0].tip
        };
    }

    public async deleteOrder(id: number): Promise<boolean> {
        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.orders} WHERE \`id\`=? AND \`state\`=? LIMIT 1) THEN
            DELETE FROM ${this.data.orders} WHERE \`id\`=?;
            DELETE FROM ${this.data.products} WHERE \`order\`=?;
        END IF;`, [
            id,
            OrderState.Open,
            id,
            id
        ]);

        return 0 < result.affectedRows;
    }

    public async orderProduct(order: number, product: number, price: number, amount = 1): Promise<OrderProduct | null> {
        const result = await this.database.query(`
            INSERT INTO ${this.data.products} (\`order\`,\`product\`,\`price\`,\`amount\`) VALUES (?,?,?,?)
            ON DUPLICATE KEY UPDATE \`amount\`=\`amount\`+?;
            SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=? LIMIT 1;
        `, [
            order,
            product,
            price,
            amount,
            amount,
            order,
            product
        ]);

        return {
            order: result[1][0].order,
            product: result[1][0].product,
            price: result[1][0].price,
            amount: result[1][0].amount
        };
    }

    public async updateProduct(order: number, product: number, options: UpdateOptions = {}): Promise<OrderProduct | null> {
        const keys = [];
        const values = [order, product];

        if (options.amount) {
            keys.push('`amount`=?');
            values.push(options.amount);
        }

        if (options.price) {
            keys.push('`price`=?');
            values.push(options.price);
        }

        if (0 == keys.length)
            return null;

        values.push(order);
        values.push(product);

        values.push(order);
        values.push(product);

        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=? LIMIT 1) THEN
            UPDATE ${this.data.products} SET ${keys.join(',')} WHERE \`order\`=? AND \`product\`=?;
            SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=? LIMIT 1;
        END IF;`, values);

        if (!result.length)
            return null;

        return {
            order: result[0][0].order,
            product: result[0][0].product,
            price: result[0][0].price,
            amount: result[0][0].amount
        };
    }

    public async cancelProduct(order: number, product: number): Promise<boolean> {
        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=? LIMIT 1) THEN
            DELETE FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=?;
        END IF;`, [
            order,
            product,
            order,
            product
        ]);

        return 0 < result.affectedRows;
    }

    public isOpen(id: number): Promise<boolean> {
        return this.hasState(id, OrderState.Open);
    }

    public hasState(id: number, state: OrderState): Promise<boolean> {
        return this.getState(id).then(result => result == state);
    }

    public async getState(id: number): Promise<OrderState | null> {
        const result = await this.database.query(`SELECT \`state\` FROM ${this.data.orders} WHERE \`id\`=? LIMIT 1`, [
            id
        ]);

        if (!result.length)
            return null;

        return result[0].state;
    }

    public async getOrders(account: number, options: GetOrdersOptions = {}): Promise<Order[]> {
        const limit = Math.min(MAX_LIMIT, options.limit || MAX_LIMIT);
        const values: any[] = [account];
        const keys = ['`account`=?'];

        if (options.customer) {
            values.push(options.customer);
            keys.push('`customer`=?');
        }

        if (options.state) {
            values.push(options.state);
            keys.push('`state`=?');
        }

        if (undefined != options.paymentMethod) {
            values.push(options.paymentMethod);
            keys.push('(`paymentMethod`&?)!=0');
        }

        if (options.start) {
            values.push(BackendJS.Database.parseFromTime(options.start));
            keys.push('`updated`>=?');
        }

        if (options.end) {
            values.push(BackendJS.Database.parseFromTime(options.end));
            keys.push('`updated`<=?');
        }

        const result = await this.database.query(`SELECT * FROM ${this.data.orders} WHERE ${keys.join(' AND ')} ORDER BY \`id\` ASC LIMIT ${limit}`, values);

        return result.map(data => ({
            id: data.id,
            account: data.account,
            updated: BackendJS.Database.parseToTime(data.updated),
            state: data.state,
            customer: data.customer,
            paymentMethod: data.paymentMethod,
            tip: data.tip
        }));
    }

    public async fetchOrders(account: number, callback: (order: Order, index: number) => Promise<any>, options: GetOrdersOptions = {}): Promise<void> {
        const values: any[] = [account];
        const keys = ['`account`=?'];

        if (options.customer) {
            values.push(options.customer);
            keys.push('`customer`=?');
        }

        if (options.state) {
            values.push(options.state);
            keys.push('`state`=?');
        }

        if (undefined != options.paymentMethod) {
            values.push(options.paymentMethod);
            keys.push('(`paymentMethod`&?)!=0');
        }

        if (options.start) {
            values.push(BackendJS.Database.parseFromTime(options.start));
            keys.push('`updated`>=?');
        }

        if (options.end) {
            values.push(BackendJS.Database.parseFromTime(options.end));
            keys.push('`updated`<=?');
        }

        await this.database.fetch(`SELECT * FROM ${this.data.orders} WHERE ${keys.join(' AND ')} ORDER BY \`id\` ASC`, (data, index) => callback({
            id: data.id,
            account: data.account,
            updated: BackendJS.Database.parseToTime(data.updated),
            state: data.state,
            customer: data.customer,
            paymentMethod: data.paymentMethod,
            tip: data.tip
        }, index), values);
    }

    public async hasProducts(order: number): Promise<boolean> {
        const result = await this.database.query(`SELECT * FROM ${this.data.products} WHERE \`order\`=? LIMIT 1`, [
            order
        ]);

        return !!result.length;
    }

    public async getProducts(order: number): Promise<OrderProduct[]> {
        const result = await this.database.query(`SELECT * FROM ${this.data.products} WHERE \`order\`=?`, [
            order
        ]);

        return result.map(data => ({
            order: data.order,
            product: data.product,
            price: data.price,
            amount: data.amount
        }));
    }

    public async getOrder(id: number): Promise<Order | null> {
        const result = await this.database.query(`SELECT * FROM ${this.data.orders} WHERE \`id\`=? LIMIT 1`, [
            id
        ]);

        if (!result.length)
            return null;

        const { account, updated, state, customer, paymentMethod, tip } = result[0];

        return {
            id,
            account,
            updated: BackendJS.Database.parseToTime(updated),
            state,
            customer,
            paymentMethod,
            tip
        };
    }

    public async getOpenOrderByCustomer(customer: number): Promise<Order | null> {
        const result = await this.database.query(`SELECT * FROM ${this.data.orders} WHERE \`customer\`=? AND \`state\`=? LIMIT 1`, [
            customer,
            OrderState.Open
        ]);

        if (!result.length)
            return null;

        const { id, account, updated, state, paymentMethod, tip } = result[0];

        return {
            id,
            account,
            updated: BackendJS.Database.parseToTime(updated),
            state,
            customer,
            paymentMethod,
            tip
        };
    }

    public async getInvoice(order: number): Promise<number> {
        const result = await this.database.query(`
        LOCK TABLES ${this.data.orders} WRITE, ${this.data.products} WRITE;
            SELECT \`order\`,SUM(\`price\`*\`amount\`) AS \`sum\` FROM ${this.data.products} WHERE \`order\`=? GROUP BY \`order\` LIMIT 1;
        UNLOCK TABLES;
        `, [
            order
        ]);

        if (!result.length)
            return 0;

        if (!result[1].length)
            return 0;

        return result[1][0].sum;
    }
}
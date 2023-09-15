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

interface UpdateOptions {
    readonly amount?: number;
    readonly price?: number;
}

export class OrderRepository extends BackendJS.Database.Repository<OrderTables> {
    public async createOrder(customer: number): Promise<Order | null> {
        const result = await this.database.query(`
        IF NOT EXISTS (SELECT * FROM ${this.data.orders} WHERE \`customer\`=? AND \`state\`=?) THEN
            INSERT INTO ${this.data.orders} (\`customer\`) VALUES (?);
            SELECT * FROM ${this.data.orders} WHERE \`id\`=LAST_INSERT_ID();
        END IF;`, [
            customer,
            OrderState.Open,
            customer
        ]);

        if (!result.length)
            return null;

        const { id, created, closed, state, paymentMethod, tip } = result[0][0];

        return {
            id,
            created: BackendJS.Database.parseToTime(created),
            closed: BackendJS.Database.parseToTime(closed),
            state,
            customer,
            paymentMethod,
            tip
        };
    }

    public async closeOrder(id: number, paymentMethod: PaymentMethod, tip = 0): Promise<Order | null> {
        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.orders} WHERE \`id\`=? AND \`state\`=?) THEN
            UPDATE ${this.data.orders} SET \`closed\`=FROM_UNIXTIME(?),\`state\`=?,\`paymentMethod\`=?,\`tip\`=? WHERE \`id\`=?;
            SELECT * FROM ${this.data.orders} WHERE \`id\`=?;
        END IF;`, [
            id,
            OrderState.Open,
            BackendJS.Database.parseFromTime(),
            OrderState.Closed,
            paymentMethod,
            tip,
            id,
            id
        ]);

        if (!result.length)
            return null;

        return {
            id: result[0][0].id,
            created: BackendJS.Database.parseToTime(result[0][0].created),
            closed: BackendJS.Database.parseToTime(result[0][0].closed),
            state: result[0][0].state,
            customer: result[0][0].customer,
            paymentMethod: result[0][0].paymentMethod,
            tip: result[0][0].tip
        };
    }

    public async deleteOrder(id: number): Promise<boolean> {
        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.orders} WHERE \`id\`=? AND \`state\`=?) THEN
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
            SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=?;
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

        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=?) THEN
            UPDATE ${this.data.products} SET ${keys.join(',')} WHERE \`order\`=? AND \`product\`=?;
            SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=?;
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
        const result = await this.database.query(`IF EXISTS (SELECT * FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=?) THEN
            DELETE FROM ${this.data.products} WHERE \`order\`=? AND \`product\`=?;
        END IF;`, [
            order,
            product,
            order,
            product
        ]);

        return 0 < result.affectedRows;
    }

    public hasOrder(id: number): Promise<boolean> {
        return this.getOrder(id).then(result => !!result);
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

    public async getOrder(id: number): Promise<Order | null> {
        const result = await this.database.query(`SELECT * FROM ${this.data.orders} WHERE \`id\`=?`, [
            id
        ]);

        if (!result.length)
            return null;

        const { created, closed, state, customer, paymentMethod, tip } = result[0];

        return {
            id,
            created: BackendJS.Database.parseToTime(created),
            closed: BackendJS.Database.parseToTime(closed),
            state,
            customer,
            paymentMethod,
            tip
        };
    }

    public async getInvoice(order: number): Promise<number | null> {
        const result = await this.database.query(`
        LOCK TABLES ${this.data.orders} WRITE, ${this.data.products} WRITE;
            SELECT \`order\`,SUM(\`price\`*\`amount\`) AS \`sum\` FROM ${this.data.products} WHERE \`order\`=? GROUP BY \`order\` LIMIT 1;
        UNLOCK TABLES;
        `, [
            order
        ]);

        if (!result.length)
            return null;

        return result[1][0].sum;
    }
}
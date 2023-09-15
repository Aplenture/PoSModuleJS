/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { OrderTables } from "../models/orderTables";
import { Order, OrderProduct } from "../models";
import { OrderState } from "../enums";

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

        const { id, created, state, paymentMethod, tip } = result[0][0];

        return {
            id,
            created: BackendJS.Database.parseToTime(created),
            state,
            customer,
            paymentMethod,
            tip
        };
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

    public hasOrder(id: number): Promise<boolean> {
        return this.getOrder(id).then(result => !!result);
    }

    public async getOrder(id: number): Promise<Order | null> {
        const result = await this.database.query(`SELECT * FROM ${this.data.orders} WHERE \`id\`=?`, [
            id
        ]);

        if (!result.length)
            return null;

        const { created, state, customer, paymentMethod, tip } = result[0];

        return {
            id,
            created: BackendJS.Database.parseToTime(created),
            state,
            customer,
            paymentMethod,
            tip
        };
    }
}
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
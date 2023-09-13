/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { OrderTables } from "../models/orderTables";
import { Order } from "../models";
import { OrderState } from "../enums";

export class OrderRepository extends BackendJS.Database.Repository<OrderTables> {
    public async create(customer: number): Promise<Order | null> {
        const result = await this.database.query(`IF NOT EXISTS (SELECT * FROM ${this.data.orders} WHERE \`customer\`=? AND \`state\`=?) THEN
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
}
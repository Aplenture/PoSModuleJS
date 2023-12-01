/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { OrderState, PaymentMethod } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly paymentmethod: PaymentMethod;
}

export class RemoveCustomers extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'removes all customers with specific payment method and no open orders';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('paymentmethod', 'payment method')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const customers = await this.context.customerRepository.getAll(args.account, {
            paymentMethods: args.paymentmethod
        });

        const openOrders = await this.context.orderRepository.getOrders(args.account, {
            state: OrderState.Open
        });

        const customersWithoutOpenOrders = customers
            .filter(customer => !openOrders.some(order => order.customer == customer.id));

        const result = await this.context.customerRepository.delete(...customersWithoutOpenOrders.map(customer => customer.id));

        return new CoreJS.BoolResponse(result);
    }
}
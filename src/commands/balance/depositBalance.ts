/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { PaymentMethod } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly value: number;
}

export class DepositBalance extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'increases a balance';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id'),
        new CoreJS.NumberParameter('value', 'amount of increase')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.balanceRepository.increase({
            account: args.account,
            depot: args.customer,
            order: 0,
            asset: PaymentMethod.Balance,
            value: args.value,
            data: 'deposit'
        });

        return new CoreJS.JSONResponse(result);
    }
}
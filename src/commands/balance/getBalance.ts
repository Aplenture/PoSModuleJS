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
}

export class GetBalance extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns current balance of a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.balanceRepository.getCurrent(
            args.account,
            args.customer,
            PaymentMethod.Balance
        );

        if (!result)
            return new CoreJS.NumberResponse(0);

        return new CoreJS.NumberResponse(result.value);
    }
}
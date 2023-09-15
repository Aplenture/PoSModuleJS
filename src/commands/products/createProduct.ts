/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly name: string;
    readonly price: number;
    readonly discount: number;
}

export class CreateProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates a product';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id of customer'),
        new CoreJS.StringParameter('name', 'name of product'),
        new CoreJS.NumberParameter('price', 'price of product'),
        new CoreJS.NumberParameter('discount', 'discount of product', 0)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.productRepository.create(
            args.account,
            args.name,
            args.price,
            args.discount
        );

        return new CoreJS.JSONResponse(result);
    }
}
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
    readonly product: number;
}

export class RemoveProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'deletes a product';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('product', 'product id')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const product = await this.context.productRepository.get(args.product);

        if (!product)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_product_invalid');

        if (product.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const result = await this.context.productRepository.delete(args.product);

        return new CoreJS.BoolResponse(result);
    }
}
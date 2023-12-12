/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { LabelType } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly product: number;
    readonly name: string;
    readonly price: number;
    readonly discount: number;
    readonly category: number;
    readonly priority: number;
    readonly start: number;
    readonly end: number;
}

export class EditProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'changes the properties of a product';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('product', 'product id'),
        new CoreJS.StringParameter('name', 'name of product', null),
        new CoreJS.NumberParameter('price', 'price of product', null),
        new CoreJS.NumberParameter('discount', 'discount of product', null),
        new CoreJS.NumberParameter('category', 'category of product', null),
        new CoreJS.NumberParameter('priority', 'priority of product', null),
        new CoreJS.TimeParameter('start', 'start of product', null),
        new CoreJS.TimeParameter('end', 'end of product', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const product = await this.context.productRepository.get(args.product);

        if (!product)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_product_invalid');

        if (product.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        if (undefined != args.category) {
            const validLabels = await this.context.labelRepository.getAll(args.account, LabelType.ProductCategory);

            if (!validLabels.some(data => data.id == args.category))
                return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_product_category_invalid");
        }

        const result = await this.context.productRepository.edit(args.product, args);

        return new CoreJS.BoolResponse(result);
    }
}
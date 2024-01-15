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
    readonly name: string;
    readonly price: number;
    readonly discount: number;
    readonly category: number;
    readonly priority: number;
    readonly start: number;
    readonly end: number;
}

export class AddProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates a product';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.StringParameter('name', 'name of product'),
        new CoreJS.NumberParameter('price', 'price of product'),
        new CoreJS.StringParameter('name', 'name of product'),
        new CoreJS.NumberParameter('category', 'category of product'),
        new CoreJS.NumberParameter('discount', 'discount of product', 0),
        new CoreJS.TimeParameter('start', 'when the product starts', null),
        new CoreJS.TimeParameter('end', 'when the product ends', null),
        new CoreJS.NumberParameter('priority', 'priority of product', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const validLabels = await this.context.labelRepository.getAll(args.account, LabelType.Default, LabelType.ProductCategory);

        if (!validLabels.some(data => data.id == args.category))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_product_category_invalid");

        try {
            const result = await this.context.productRepository.create({
                account: args.account,
                name: args.name,
                price: args.price,
                discount: args.discount,
                category: args.category,
                priority: args.priority,
                start: args.start,
                end: args.end
            });

            return new CoreJS.JSONResponse(result);
        } catch (error) {
            switch (error.code) {
                case CoreJS.CoreErrorCode.Duplicate:
                    return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_product_duplicate_name');

                default:
                    throw error;
            }
        }
    }
}
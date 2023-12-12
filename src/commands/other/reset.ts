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
    readonly versions: readonly number[];
}

export class Reset extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'resets the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.ArrayParameter('versions', 'resets these versions only', new CoreJS.NumberParameter('', ''), null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        await this.context.balanceRepository.reset({ versions: args.versions });
        await this.context.customerRepository.reset({ versions: args.versions });
        await this.context.orderRepository.reset({ versions: args.versions });
        await this.context.productRepository.reset({ versions: args.versions });
        await this.context.labelRepository.reset({ versions: args.versions });

        return new CoreJS.TextResponse('reset');
    }
}
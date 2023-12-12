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
    readonly version: number;
}

export class Update extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'updates the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('version', 'updates to this version', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        await this.context.balanceRepository.update({ maxVersion: args.version });
        await this.context.customerRepository.update({ maxVersion: args.version });
        await this.context.orderRepository.update({ maxVersion: args.version });
        await this.context.labelRepository.update({ maxVersion: args.version });
        const version = await this.context.productRepository.update({ maxVersion: args.version });

        return new CoreJS.TextResponse('updated to version ' + version);
    }
}
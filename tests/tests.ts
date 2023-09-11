/**
 * Aplenture/<my_module_name>
 * https://github.com/Aplenture/<my_module_name>
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/<my_module_name>/blob/main/LICENSE
 */

import * as BackendJS from 'backendjs';
import { expect } from "chai";
import { Module } from "../src";

const args = {
    debug: true
};

const config = {
    name: "test",
    databaseConfig: {
        host: "localhost",
        user: "dev",
        password: "",
        database: "test"
    }
};

const m = new Module(args, config);
const log = BackendJS.Log.Log.createFileLog('./test.log', true);

m.onMessage.on(message => log.write(message));

describe("Module", () => {
    it("initializes", () => m.init());
    it("updates", () => m.execute('update').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    it("resets", () => m.execute('reset').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    it("reverts", () => m.execute('revert').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    it("closes", () => m.deinit());
});
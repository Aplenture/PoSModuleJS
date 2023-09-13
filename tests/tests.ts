/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from 'backendjs';
import * as CoreJS from 'corejs';
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
    describe("Initialization", () => {
        it("initializes", () => m.init());
        it("updates", () => m.execute('update').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("resets", () => m.execute('reset').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    });

    describe("Customers", () => {
        describe("Create", () => {
            it("without nickname", async () => {
                const result = await m.execute("createCustomer", { firstname: 'hello', lastname: 'world' }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const customer = JSON.parse(result.data);

                expect(customer).contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
            });

            it("with nickname", async () => {
                const result = await m.execute("createCustomer", { firstname: 'hello', lastname: 'world', nickname: '2' }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const customer = JSON.parse(result.data);

                expect(customer).contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2' });
            });

            it("catches missing firstname", () => m.execute("createCustomer", { lastname: 'world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'firstname', type: 'string' } })));
            it("catches missing lastname", () => m.execute("createCustomer", { firstname: 'hello' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'lastname', type: 'string' } })));
            it("catches duplicate", () => m.execute("createCustomer", { firstname: 'hello', lastname: 'world', nickname: '2' }).catch(error => expect(error).contains({ code: CoreJS.CoreErrorCode.Duplicate })));
        });

        describe("Get", () => {
            it("all", async () => {
                const result = await m.execute("getCustomers") as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const customers = JSON.parse(result.data);

                expect(customers).has.length(2);
                expect(customers[0], 'customer at 0').contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
                expect(customers[1], 'customer at 1').contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2' });
            });

            it("limit 1", async () => {
                const result = await m.execute("getCustomers", { limit: 1 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const customers = JSON.parse(result.data);

                expect(customers).has.length(1);
                expect(customers[0], 'customer at 0').contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
            });

            it("first id 2", async () => {
                const result = await m.execute("getCustomers", { firstID: 2 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const customers = JSON.parse(result.data);

                expect(customers).has.length(1);
                expect(customers[0], 'customer at 0').contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2' });
            });

            it("last id 1", async () => {
                const result = await m.execute("getCustomers", { lastID: 1 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const customers = JSON.parse(result.data);

                expect(customers).has.length(1);
                expect(customers[0], 'customer at 0').contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
            });
        });

        describe("Edit", () => {
            it("changes firstname", () => m.execute("editCustomer", { id: 1, firstname: 'test1' })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.customerRepository.data} WHERE id=1`))
                .then(result => {
                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ firstname: 'test1', lastname: 'world', nickname: '' });
                })
            );

            it("changes lastname", () => m.execute("editCustomer", { id: 2, lastname: 'test2' })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.customerRepository.data} WHERE id=2`))
                .then(result => {
                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ firstname: 'hello', lastname: 'test2', nickname: '2' });
                })
            );

            it("changes nickname", () => m.execute("editCustomer", { id: 1, nickname: 'test3' })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.customerRepository.data} WHERE id=1`))
                .then(result => {
                    expect(result).has.length(1);
                    expect(result[0]).deep.contains({ firstname: 'test1', lastname: 'world', nickname: 'test3' });
                })
            );
        });
    });

    describe("Deinitialization", () => {
        it("reverts", () => m.execute('revert').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("closes", () => m.deinit());
    });
});
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
import { OrderState, PaymentMethod } from '../src/enums';

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

const app = {
    onMessage: new CoreJS.Event<any, string>('app.onMessage'),
    onError: new CoreJS.Event<any, Error>('app.onError'),
    config: new CoreJS.Config(),
    execute: async () => CoreJS.RESPONSE_OK
};

const m = new Module(app, args, config);
const log = BackendJS.Log.Log.createFileLog('./test.log', true);

app.onMessage.on(message => log.write(message));

describe("Commands", () => {
    describe("Initialization", () => {
        it("initializes", () => m.init());
        it("updates", () => m.execute('update').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("resets", () => m.execute('reset').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    });

    describe("Customers", () => {
        describe("add", () => {
            it("adds customer without nickname", async () => {
                const result = await m.execute("addCustomer", { account: 1, firstname: 'hello', lastname: 'world' }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 1, account: 1, firstname: 'hello', lastname: 'world', nickname: '', paymentMethods: -1 });
            });

            it("adds customer with nickname", async () => {
                const result = await m.execute("addCustomer", { account: 1, firstname: 'hello', lastname: 'world', nickname: '2' }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 2, account: 1, firstname: 'hello', lastname: 'world', nickname: '2', paymentMethods: -1 });
            });

            it("adds customer with payment method balance", async () => {
                const result = await m.execute("addCustomer", { account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance', paymentMethods: PaymentMethod.Balance }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 3, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
            });

            it("adds customer with payment method balance and cash", async () => {
                const result = await m.execute("addCustomer", { account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance+cash', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 4, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance+cash', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
            });

            it("adds customer without lastname", async () => {
                const result = await m.execute("addCustomer", { account: 1, firstname: 'IHaveNoLastNameAndNoNickNameBro' }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 5, account: 1, firstname: 'IHaveNoLastNameAndNoNickNameBro', lastname: '', nickname: '' });
            });

            it("adds customer on different account", async () => {
                const result = await m.execute("addCustomer", { account: 2, firstname: 'hello', lastname: 'world', nickname: '2' }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 6, account: 2, firstname: 'hello', lastname: 'world', nickname: '2', paymentMethods: -1 });
            });

            it("catches missing account", () => m.execute("addCustomer", { firstname: 'world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing firstname", () => m.execute("addCustomer", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'firstname', type: 'string' } })));
            it("catches duplicate", () => m.execute("addCustomer", { account: 1, firstname: 'hello', lastname: 'world', nickname: '2' }).catch(error => expect(error).contains({ code: CoreJS.CoreErrorCode.Duplicate })));
        });

        describe("Edit", () => {
            it("changes firstname", () => m.execute("editCustomer", { account: 1, customer: 1, firstname: 'test1' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes lastname", () => m.execute("editCustomer", { account: 1, customer: 3, lastname: 'test2' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes nickname", () => m.execute("editCustomer", { account: 1, customer: 4, nickname: 'test3' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing account", () => m.execute("editCustomer", { customer: 1, lastname: 'hello world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing customer", () => m.execute("editCustomer", { account: 1, lastname: 'hello world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'customer', type: 'number' } })));
        });

        describe("remove", () => {
            it("second entity", () => m.execute("removeCustomer", { account: 1, customer: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing account", () => m.execute("removeCustomer", { customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing customer", () => m.execute("removeCustomer", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'customer', type: 'number' } })));
        });

        describe("Get", () => {
            it("returns all from account 1", async () => {
                const result = await m.execute("getCustomers", { account: 1 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0], 'customer at 0').contains({ id: 1, account: 1, firstname: 'test1', lastname: 'world', nickname: '', paymentMethods: -1 });
                expect(data[1], 'customer at 1').contains({ id: 3, account: 1, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
                expect(data[2], 'customer at 2').contains({ id: 4, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'test3', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
                expect(data[3], 'customer at 3').contains({ id: 5, account: 1, firstname: 'IHaveNoLastNameAndNoNickNameBro', lastname: '', nickname: '', paymentMethods: -1 });
            });

            it("returns all from account 2", async () => {
                const result = await m.execute("getCustomers", { account: 2 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0], 'customer at 0').contains({ id: 6, account: 2, firstname: 'hello', lastname: 'world', nickname: '2', paymentMethods: -1 });
            });

            it("returns first id 3", async () => {
                const result = await m.execute("getCustomers", { account: 1, firstID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0], 'customer at 0').contains({ id: 3, account: 1, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
                expect(data[1], 'customer at 1').contains({ id: 4, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'test3', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
                expect(data[2], 'customer at 2').contains({ id: 5, account: 1, firstname: 'IHaveNoLastNameAndNoNickNameBro', lastname: '', nickname: '', paymentMethods: -1 });
            });

            it("returns last id 3", async () => {
                const result = await m.execute("getCustomers", { account: 1, lastID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'customer at 0').contains({ id: 1, account: 1, firstname: 'test1', lastname: 'world', nickname: '', paymentMethods: -1 });
                expect(data[1], 'customer at 1').contains({ id: 3, account: 1, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
            });

            it("catches missing account", () => m.execute("getCustomers", {}).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
        });
    });

    describe("Products", () => {
        describe("add", () => {
            it("adds product without discount", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'product 1', price: 100 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 1, account: 1, name: 'product 1', price: 100, discount: 0 });
            });

            it("adds product with discount", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'product 2', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 2, account: 1, name: 'product 2', price: 150, discount: 10 });
            });

            it("adds product third", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'product 3', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 3, account: 1, name: 'product 3', price: 150, discount: 10 });
            });

            it("adds product fourth", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'product 4', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 10 });
            });

            it("adds product for additional account", async () => {
                const result = await m.execute("addProduct", { account: 2, name: 'product 4', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 5, account: 2, name: 'product 4', price: 150, discount: 10 });
            });

            it("catches missing account", () => m.execute("addProduct", { name: 'product 1', price: 100 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing name", () => m.execute("addProduct", { account: 1, price: 100 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'name', type: 'string' } })));
            it("catches missing price", () => m.execute("addProduct", { account: 1, name: 'test' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'price', type: 'number' } })));
            it("catches duplicate", () => m.execute("addProduct", { account: 1, name: 'product 1', price: 100 }).catch(error => expect(error).contains({ code: CoreJS.CoreErrorCode.Duplicate })));
        });

        describe("Edit", () => {
            it("changes name", () => m.execute("editProduct", { account: 1, product: 1, name: 'test1' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes price", () => m.execute("editProduct", { account: 1, product: 3, price: 200 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes discount", () => m.execute("editProduct", { account: 1, product: 4, discount: 20 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing account", () => m.execute("editProduct", { product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing product", () => m.execute("editProduct", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'product', type: 'number' } })));
        });

        describe("remove", () => {
            it("second entity", () => m.execute("removeProduct", { account: 1, product: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing account", () => m.execute("removeProduct", { product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing product", () => m.execute("removeProduct", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'product', type: 'number' } })));
        });

        describe("Get", () => {
            it("returns all from account 1", async () => {
                const result = await m.execute("getProducts", { account: 1 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0], 'product at 0').contains({ id: 1, account: 1, name: 'test1', price: 100, discount: 0 });
                expect(data[1], 'product at 1').contains({ id: 3, account: 1, name: 'product 3', price: 200, discount: 10 });
                expect(data[2], 'product at 2').contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20 });
            });

            it("returns all from account 2", async () => {
                const result = await m.execute("getProducts", { account: 2 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0]).contains({ id: 5, account: 2, name: 'product 4', price: 150, discount: 10 });
            });

            it("returns first id 3", async () => {
                const result = await m.execute("getProducts", { account: 1, firstID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'product at 0').contains({ id: 3, account: 1, name: 'product 3', price: 200, discount: 10 });
                expect(data[1], 'product at 1').contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20 });
            });

            it("returns last id 3", async () => {
                const result = await m.execute("getProducts", { account: 1, lastID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'product at 0').contains({ id: 1, account: 1, name: 'test1', price: 100, discount: 0 });
                expect(data[1], 'product at 1').contains({ id: 3, account: 1, name: 'product 3', price: 200, discount: 10 });
            });

            it("catches missing account", () => m.execute("getProducts", {}).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
        });
    });

    describe("Orders", () => {
        let start: number;
        let end: number;

        describe("Create Orders", () => {
            it("creates for customer 1", async () => {
                const result = await m.execute("createOrder", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 1, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("creates for customer 3", async () => {
                const result = await m.execute("createOrder", { account: 1, customer: 3 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 2, account: 1, state: OrderState.Open, customer: 3, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("creates for customer 4", async () => {
                const result = await m.execute("createOrder", { account: 1, customer: 4 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 3, account: 1, state: OrderState.Open, customer: 4, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("creates for customer 5", async () => {
                const result = await m.execute("createOrder", { account: 1, customer: 5 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 4, account: 1, state: OrderState.Open, customer: 5, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("creates for additional account", async () => {
                const result = await m.execute("createOrder", { account: 2, customer: 6 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 5, account: 2, state: OrderState.Open, customer: 6, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("catches missing account", () => m.execute("createOrder", { customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing customer", () => m.execute("createOrder", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches deleted customer", () => m.execute("createOrder", { account: 1, customer: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_customer_invalid" })));
            it("catches currently open order", () => m.execute("createOrder", { account: 1, customer: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_open_already" })));
        });

        describe("Order Products", () => {
            it("orders product 1 for customer 1", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 1, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 100, amount: 1 });
            });

            it("orders product 1 for customer 1 with amount 9", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 1, product: 1, amount: 9 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 100, amount: 10 });
            });

            it("orders product 3 for customer 1 with amount 10", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 1, product: 3, amount: 10 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 3, price: 180, amount: 10 });
            });

            it("orders product 4 for customer 1", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 1, product: 4 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 4, price: 120, amount: 1 });
            });

            it("orders product 1 for customer 3", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 2, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 2, product: 1, price: 100 });
            });

            it("orders product 1 for customer 4", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 3, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 1 });
            });

            it("orders product 3 for customer 4 with amount 10 and discount 0", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 3, product: 3, amount: 10, discount: 0 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 3, price: 200, amount: 10 });
            });

            it("orders product 4 for customer 4 with amount 10 and discount 5", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 3, product: 4, amount: 10, discount: 5 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 4, price: 142, amount: 10 });
            });

            it("orders product 1 for customer 5", async () => {
                const result = await m.execute("orderProduct", { account: 1, order: 4, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 4, product: 1 });
            });

            it("catches missing account", () => m.execute("orderProduct", { order: 1, product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing order", () => m.execute("orderProduct", { account: 1, product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
            it("catches invalid order", () => m.execute("orderProduct", { account: 1, order: Number.MAX_SAFE_INTEGER, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches missing product", () => m.execute("orderProduct", { account: 1, order: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "product", type: "number" } })));
            it("catches deleted product", () => m.execute("orderProduct", { account: 1, order: 1, product: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
        });

        describe("Update Orders", () => {
            it("decreases amount of product 3 for customer 1", async () => {
                const result = await m.execute("updateOrder", { account: 1, order: 1, product: 3, amount: 3 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 3, price: 180, amount: 3 });
            });

            it("increases amount of product 4 for customer 1", async () => {
                const result = await m.execute("updateOrder", { account: 1, order: 1, product: 4, amount: 20 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 4, price: 120, amount: 20 });
            });

            it("changes discount of product 1 for customer 1", async () => {
                const result = await m.execute("updateOrder", { account: 1, order: 1, product: 1, discount: 10 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 90, amount: 10 });
            });

            it("catches no updates", () => m.execute("updateOrder", { account: 1, order: 1, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "0" })));
            it("catches missing account", () => m.execute("updateOrder", { order: 1, product: 1, amount: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing order", () => m.execute("updateOrder", { account: 1, product: 1, amount: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
            it("catches invalid order", () => m.execute("updateOrder", { account: 1, order: Number.MAX_SAFE_INTEGER, product: 1, amount: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches missing product", () => m.execute("updateOrder", { account: 1, order: 1, amount: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "product", type: "number" } })));
            it("catches deleted product", () => m.execute("updateOrder", { account: 1, order: 1, product: 2, amount: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
            it("catches not ordered product", () => m.execute("updateOrder", { account: 1, order: 2, product: 3, amount: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
        });

        describe("Cancel Products", () => {
            it("cancels product 1 for customer 4", () => m.execute("cancelProduct", { account: 1, order: 3, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing account", () => m.execute("cancelProduct", { order: 1, product: 1, amount: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches not existing product", () => m.execute("cancelProduct", { account: 1, order: 3, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "0" })));
            it("catches missing order", () => m.execute("cancelProduct", { account: 1, product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
            it("catches invalid order", () => m.execute("cancelProduct", { account: 1, order: Number.MAX_SAFE_INTEGER, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches missing product", () => m.execute("cancelProduct", { account: 1, order: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "product", type: "number" } })));
            it("catches deleted product", () => m.execute("cancelProduct", { account: 1, order: 1, product: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
        });

        describe("Close Orders", () => {
            it("closes open order 1 paid with cash without tip", async () => {
                const result = await m.execute("closeOrder", { account: 1, order: 1, paymentmethod: PaymentMethod.Cash, amount: 4000 }) as CoreJS.Response;

                expect(result, result.data).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 160 });
            });

            it("closes open order 3 paid with balance with tip", async () => {
                const result = await m.execute("closeOrder", { account: 1, order: 3, paymentmethod: PaymentMethod.Balance, amount: 3420 }) as CoreJS.Response;

                expect(result, result.data).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 3, state: OrderState.Closed, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });
            });

            it("catches missing account", () => m.execute("closeOrder", { order: 2, amount: 10000, paymentmethod: PaymentMethod.Balance }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches invalid account", () => m.execute("closeOrder", { account: Number.MAX_SAFE_INTEGER, order: 2, amount: 10000, paymentmethod: PaymentMethod.Balance }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing order", () => m.execute("closeOrder", { account: 1, amount: 10000, paymentmethod: PaymentMethod.Balance }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
            it("catches closed order", () => m.execute("closeOrder", { account: 1, order: 1, amount: 10000, paymentmethod: PaymentMethod.Balance }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_not_open" })));
            it("catches missing payment method", () => m.execute("closeOrder", { account: 1, order: 2, amount: 10000 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "paymentmethod", type: "number" } })));
            it("catches invalid payment method", () => m.execute("closeOrder", { account: 1, order: 2, amount: 10000, paymentmethod: -1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_payment_method" })));
            it("catches missing amount", () => m.execute("closeOrder", { account: 1, order: 2, paymentmethod: PaymentMethod.Balance }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "amount", type: "number" } })));
            it("catches invalid amount", () => m.execute("closeOrder", { account: 1, order: 2, amount: 1, paymentmethod: PaymentMethod.Balance }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_not_enough_amount" })));
        });

        describe("Delete Open Orders", () => {
            it("deletes open order 2", () => m.execute("deleteOrder", { account: 1, order: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing account", () => m.execute("deleteOrder", { order: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing order", () => m.execute("deleteOrder", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
            it("catches invalid order", () => m.execute("deleteOrder", { account: 1, order: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches closed order", () => m.execute("deleteOrder", { account: 1, order: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "0" })));
        });

        describe("Create Orders after closing previous", () => {
            it("creates second", async () => {
                let result = await m.execute("createOrder", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 6, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });

                result = await m.execute("orderProduct", { account: 1, order: 6, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 6, product: 1, price: 100, amount: 1 });
            });

            it("closes second", async () => {
                const result = await m.execute("closeOrder", { account: 1, order: 6, paymentmethod: PaymentMethod.Cash, amount: 150 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 6, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
            });

            it("creates third", async () => {
                let result = await m.execute("createOrder", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 7, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("closes third", async () => {
                const result = await m.execute("closeOrder", { account: 1, order: 7, paymentmethod: PaymentMethod.Cash, amount: 0 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 7, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
            });

            it("creates fourth", async () => {
                let result = await m.execute("createOrder", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 8, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("creates balance order", async () => {
                let result = await m.execute("createOrder", { account: 1, customer: 4, paymentmethod: PaymentMethod.Balance }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 9, account: 1, state: OrderState.Open, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });

                result = await m.execute("orderProduct", { account: 1, order: 9, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 9, product: 1, price: 100, amount: 1 });
            });
        }).beforeAll(() => CoreJS.sleep(2000));

        describe("Close All Open Balance Orders", () => {
            it("closes all open balance orders", async () => {
                const result = await m.execute("closeAllOpenBalanceOrders", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0]).deep.contains({ id: 9, account: 1, state: OrderState.Closed, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });
            });

            it("catches missing account", () => m.execute("closeAllOpenBalanceOrders").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
        });

        describe("Get Orders", () => {
            it("returns all orders with his products", async () => {
                const result = await m.execute("getOrders", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(7);
                expect(data[0]).deep.contains({ id: 1, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 160 });
                expect(data[0].products, "products of order at index 0").has.length(3);
                expect(data[0].products[0], "product at index 0 of order at index 0").deep.contains({ order: 1, product: 1, price: 90, amount: 10 });
                expect(data[0].products[1], "product at index 1 of order at index 0").deep.contains({ order: 1, product: 3, price: 180, amount: 3 });
                expect(data[0].products[2], "product at index 1 of order at index 0").deep.contains({ order: 1, product: 4, price: 120, amount: 20 });

                expect(data[1]).deep.contains({ id: 3, account: 1, state: OrderState.Closed, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });
                expect(data[1].products, "products of order at index 1").has.length(2);
                expect(data[1].products[0], "product at index 0 of order at index 1").deep.contains({ order: 3, product: 3, price: 200, amount: 10 });
                expect(data[1].products[1], "product at index 1 of order at index 1").deep.contains({ order: 3, product: 4, price: 142, amount: 10 });

                expect(data[2]).deep.contains({ id: 4, account: 1, state: OrderState.Open, customer: 5, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[2].products, "products of order at index 2").has.length(1);
                expect(data[2].products[0], "product at index 0 of order at index 2").deep.contains({ order: 4, product: 1 });

                expect(data[3]).deep.contains({ id: 6, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
                expect(data[3].products, "products of order at index 3").has.length(1);
                expect(data[3].products[0], "product at index 0 of order at index 3").deep.contains({ order: 6, product: 1, price: 100, amount: 1 });

                expect(data[4]).deep.contains({ id: 7, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
                expect(data[4].products, "products of order at index 4").has.length(0);

                expect(data[5]).deep.contains({ id: 8, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[5].products, "products of order at index 5").has.length(0);

                expect(data[6]).deep.contains({ id: 9, account: 1, state: OrderState.Closed, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });
                expect(data[6].products, "products of order at index 6").has.length(1);
                expect(data[6].products[0], "product at index 0 of order at index 6").deep.contains({ order: 9, product: 1, price: 100, amount: 1 });
            });

            it("returns open orders", async () => {
                const result = await m.execute("getOrders", { account: 1, state: OrderState.Open }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0]).deep.contains({ id: 4, account: 1, state: OrderState.Open, customer: 5, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[1]).deep.contains({ id: 8, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("returns customer orders", async () => {
                const result = await m.execute("getOrders", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ id: 1, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 160 });
                expect(data[1]).deep.contains({ id: 6, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
                expect(data[2]).deep.contains({ id: 7, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
                expect(data[3]).deep.contains({ id: 8, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("returns closed customer orders", async () => {
                const result = await m.execute("getOrders", { account: 1, customer: 1, state: OrderState.Closed }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ id: 1, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 160 });
                expect(data[1]).deep.contains({ id: 6, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
                expect(data[2]).deep.contains({ id: 7, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
            });

            it("returns orders by start", async () => {
                const result = await m.execute("getOrders", { account: 1, start: end }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ id: 6, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
                expect(data[1]).deep.contains({ id: 7, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
                expect(data[2]).deep.contains({ id: 8, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[3]).deep.contains({ id: 9, account: 1, state: OrderState.Closed, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });
            });

            it("returns orders by end", async () => {
                const result = await m.execute("getOrders", { account: 1, end: start }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ id: 1, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 160 });
                expect(data[1]).deep.contains({ id: 3, account: 1, state: OrderState.Closed, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });
                expect(data[2]).deep.contains({ id: 4, account: 1, state: OrderState.Open, customer: 5, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("catches missing account", () => m.execute("getOrders", {}).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
        }).beforeAll(async () => {
            const result = await m.database.query(`SELECT \`updated\` FROM ${m.orderRepository.data.orders} ORDER BY \`updated\` ASC`);

            start = BackendJS.Database.parseToTime(result[0].updated) as number;
            end = BackendJS.Database.parseToTime(result[result.length - 1].updated) as number;
        });
    });

    describe("Balance", () => {
        describe("Deposit", () => {
            it("deposits for customer 1", async () => {
                const result = await m.execute("depositBalance", { account: 1, customer: 1, value: 1000 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 1000 });
            });

            it("deposits for customer 4", async () => {
                const result = await m.execute("depositBalance", { account: 1, customer: 4, value: 5000 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1480 });
            });

            it("catches missing account", () => m.execute("depositBalance", { customer: 1, value: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches missing customer", () => m.execute("depositBalance", { account: 1, value: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches missing value", () => m.execute("depositBalance", { account: 1, customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "value", type: "number" } })));
        });

        describe("Withdraw", () => {
            it("withdraws for customer 1", async () => {
                const result = await m.execute("withdrawBalance", { account: 1, customer: 1, value: 900 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
            });

            it("catches missing account", () => m.execute("withdrawBalance", { customer: 1, value: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches missing customer", () => m.execute("withdrawBalance", { account: 1, value: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches missing value", () => m.execute("withdrawBalance", { account: 1, customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "value", type: "number" } })));
        });

        describe("Get Current", () => {
            it("returns balance of customer 1", () => m.execute("getBalance", { account: 1, customer: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "100" })));
            it("returns balance of customer 3", () => m.execute("getBalance", { account: 1, customer: 3 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "0" })));
            it("returns balance of customer 4", () => m.execute("getBalance", { account: 1, customer: 4 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "1480" })));
            it("returns balance of customer 5", () => m.execute("getBalance", { account: 1, customer: 5 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "0" })));
            it("returns balance of customer 6", () => m.execute("getBalance", { account: 1, customer: 6 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "0" })));

            it("catches missing account", () => m.execute("getBalance", { customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches missing customer", () => m.execute("getBalance", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
        });

        describe("Get All", () => {
            it("returns all balances", async () => {
                const result = await m.execute("getBalances", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0]).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1480 });
                expect(data[1]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
            });

            it("catches missing account", () => m.execute("getBalances", { customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
        });

        describe("Finances", () => {
            it("returns invoices and tips", async () => {
                const result = await m.execute("getFinances", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(7);
                expect(data[0]).deep.contains({ id: 1, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 1, value: 3840, data: 'invoice' });
                expect(data[1]).deep.contains({ id: 2, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 1, value: 160, data: 'tip' });
                expect(data[2]).deep.contains({ id: 3, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 3, value: 3420, data: 'invoice' });
                expect(data[3]).deep.contains({ id: 4, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 6, value: 100, data: 'invoice' });
                expect(data[4]).deep.contains({ id: 5, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 6, value: 50, data: 'tip' });
                expect(data[5]).deep.contains({ id: 6, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 7, value: 0, data: 'invoice' });
                expect(data[6]).deep.contains({ id: 7, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 9, value: 100, data: 'invoice' });
            });

            it("returns finances of customer 1", async () => {
                const result = await m.execute("getFinances", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(7);
                expect(data[0]).deep.contains({ id: 1, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 1, value: 3840, data: 'invoice' });
                expect(data[1]).deep.contains({ id: 2, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 1, value: 160, data: 'tip' });
                expect(data[2]).deep.contains({ id: 4, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 6, value: 100, data: 'invoice' });
                expect(data[3]).deep.contains({ id: 5, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 6, value: 50, data: 'tip' });
                expect(data[4]).deep.contains({ id: 6, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 7, value: 0, data: 'invoice' });
                expect(data[5]).deep.contains({ id: 8, type: BackendJS.Balance.EventType.Increase, account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, order: 0, value: 1000, data: 'deposit' });
                expect(data[6]).deep.contains({ id: 10, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, order: 0, value: 900, data: 'withdraw' });
            });

            it("returns finances of customer 2", async () => {
                const result = await m.execute("getFinances", { account: 1, customer: 2 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(0);
            });

            it("returns finances of customer 3", async () => {
                const result = await m.execute("getFinances", { account: 1, customer: 3 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(0);
            });

            it("returns finances of customer 4", async () => {
                const result = await m.execute("getFinances", { account: 1, customer: 4 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ id: 3, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 3, value: 3420, data: 'invoice' });
                expect(data[1]).deep.contains({ id: 7, type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 9, value: 100, data: 'invoice' });
                expect(data[2]).deep.contains({ id: 9, type: BackendJS.Balance.EventType.Increase, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 0, value: 5000, data: 'deposit' });
            });

            it("catches missing account", () => m.execute("getFinances").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
        });
    });

    describe("Deinitialization", () => {
        it("reverts", () => m.execute('revert').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("closes", () => m.deinit());
    });
});
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
import { BalanceEvent, OrderState, PaymentMethod, LabelType } from '../src/enums';

const args = {
    debug: true
};

const config = BackendJS.loadConfig("config.json");

const app: any = {
    onMessage: new CoreJS.Event<any, string>('app.onMessage'),
    onError: new CoreJS.Event<any, Error>('app.onError'),
    config: new CoreJS.Config(),
    execute: async () => CoreJS.RESPONSE_OK
};

app.updateLoop = new CoreJS.Updateloop('update loop', app);

const m = new Module(app, args, config);
const log = BackendJS.Log.Log.createFileLog('./test.log', true);

app.onMessage.on(message => log.write(message));

describe("Commands", () => {
    describe("Initialization", () => {
        it("initializes", () => m.init());
        it("resets", () => m.execute('reset').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("updates", () => m.execute('update').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    });

    describe("Labels", () => {
        describe("Create", () => {
            it("first deposit label", () => m.execute('createLabel', { account: 1, type: LabelType.Deposit, name: 'my_first_deposit_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("first withdraw label", () => m.execute('createLabel', { account: 1, type: LabelType.Withdraw, name: 'my_first_withdraw_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("first product category label", () => m.execute('createLabel', { account: 1, type: LabelType.ProductCategory, name: 'my_first_category_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("second deposit label", () => m.execute('createLabel', { account: 1, type: LabelType.Deposit, name: 'my_second_deposit_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("second withdraw label", () => m.execute('createLabel', { account: 1, type: LabelType.Withdraw, name: 'my_second_withdraw_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("second product category label", () => m.execute('createLabel', { account: 1, type: LabelType.ProductCategory, name: 'my_second_category_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("deposit label for another account", () => m.execute('createLabel', { account: 2, type: LabelType.Deposit, name: 'my_first_deposit_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("withdraw label for another account", () => m.execute('createLabel', { account: 2, type: LabelType.Withdraw, name: 'my_first_withdraw_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("product category label for another account", () => m.execute('createLabel', { account: 2, type: LabelType.ProductCategory, name: 'my_first_category_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("another product category label", () => m.execute('createLabel', { account: 1, type: LabelType.ProductCategory, name: 'my_another_category_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));
            it("label with priority", () => m.execute('createLabel', { account: 1, type: LabelType.ProductCategory, name: 'my_label_with_prio', priority: 1337 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON })));

            it("catches missing account", () => m.execute('createLabel', { type: LabelType.Deposit, name: 'test' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing type", () => m.execute('createLabel', { account: 1, name: 'test' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'type', type: 'number' } })));
            it("catches missing name", () => m.execute('createLabel', { account: 1, type: LabelType.Deposit }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'name', type: 'string' } })));
            it("catches duplicate name", () => m.execute('createLabel', { account: 1, type: LabelType.Deposit, name: 'my_first_deposit_label' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: '#_label_duplicate_name' })));
        });

        describe("Get", () => {
            it("all of account 1", async () => {
                const result = await m.execute('getLabels', { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(9);
                expect(data[0]).deep.contains({ id: 1, account: 0, type: LabelType.Default, name: '#_title_default', priority: 0 });
                expect(data[1]).deep.contains({ id: 2, account: 1, type: LabelType.Deposit, name: 'my_first_deposit_label', priority: 0 });
                expect(data[2]).deep.contains({ id: 3, account: 1, type: LabelType.Withdraw, name: 'my_first_withdraw_label', priority: 0 });
                expect(data[3]).deep.contains({ id: 4, account: 1, type: LabelType.ProductCategory, name: 'my_first_category_label', priority: 0 });
                expect(data[4]).deep.contains({ id: 5, account: 1, type: LabelType.Deposit, name: 'my_second_deposit_label', priority: 0 });
                expect(data[5]).deep.contains({ id: 6, account: 1, type: LabelType.Withdraw, name: 'my_second_withdraw_label', priority: 0 });
                expect(data[6]).deep.contains({ id: 7, account: 1, type: LabelType.ProductCategory, name: 'my_second_category_label', priority: 0 });
                expect(data[7]).deep.contains({ id: 11, account: 1, type: LabelType.ProductCategory, name: 'my_another_category_label', priority: 0 });
                expect(data[8]).deep.contains({ id: 12, account: 1, type: LabelType.ProductCategory, name: 'my_label_with_prio', priority: 1337 });
            });

            it("all of account 2", async () => {
                const result = await m.execute('getLabels', { account: 2 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ id: 1, account: 0, type: LabelType.Default, name: '#_title_default', priority: 0 });
                expect(data[1]).deep.contains({ id: 8, account: 2, type: LabelType.Deposit, name: 'my_first_deposit_label', priority: 0 });;
                expect(data[2]).deep.contains({ id: 9, account: 2, type: LabelType.Withdraw, name: 'my_first_withdraw_label', priority: 0 });;
                expect(data[3]).deep.contains({ id: 10, account: 2, type: LabelType.ProductCategory, name: 'my_first_category_label', priority: 0 });;
            });

            it("single type specific", async () => {
                const result = await m.execute('getLabels', { account: 1, type: LabelType.ProductCategory }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ id: 4, account: 1, type: LabelType.ProductCategory, name: 'my_first_category_label', priority: 0 });;
                expect(data[1]).deep.contains({ id: 7, account: 1, type: LabelType.ProductCategory, name: 'my_second_category_label', priority: 0 });;
                expect(data[2]).deep.contains({ id: 11, account: 1, type: LabelType.ProductCategory, name: 'my_another_category_label', priority: 0 });
                expect(data[3]).deep.contains({ id: 12, account: 1, type: LabelType.ProductCategory, name: 'my_label_with_prio', priority: 1337 });
            });

            it("multiple type specific", async () => {
                const result = await m.execute('getLabels', { account: 1, type: [LabelType.Deposit, LabelType.Withdraw] }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ id: 2, account: 1, type: LabelType.Deposit, name: 'my_first_deposit_label', priority: 0 });
                expect(data[1]).deep.contains({ id: 3, account: 1, type: LabelType.Withdraw, name: 'my_first_withdraw_label', priority: 0 });
                expect(data[2]).deep.contains({ id: 5, account: 1, type: LabelType.Deposit, name: 'my_second_deposit_label', priority: 0 });
                expect(data[3]).deep.contains({ id: 6, account: 1, type: LabelType.Withdraw, name: 'my_second_withdraw_label', priority: 0 });
            });

            it("catches missing account", () => m.execute('getLabels', { type: LabelType.Deposit, name: 'test' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
        });
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
                const result = await m.execute("addCustomer", { account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance', paymentmethods: PaymentMethod.Balance }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 3, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
            });

            it("adds customer with payment method balance and cash", async () => {
                const result = await m.execute("addCustomer", { account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance+cash', paymentmethods: PaymentMethod.Balance | PaymentMethod.Cash }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 4, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'balance+cash', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
            });

            it("adds customer without lastname", async () => {
                const result = await m.execute("addCustomer", { account: 1, firstname: 'IHaveNoLastNameAndNoNickNameBro', paymentmethods: PaymentMethod.Cash }) as CoreJS.JSONResponse;

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

            it("adds additional customers", async () => {
                let result = await m.execute("addCustomer", { account: 1, firstname: 'additional customer' }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).contains({ id: 7, account: 1, firstname: 'additional customer', lastname: '', nickname: '' });

                result = await m.execute("addCustomer", { account: 1, firstname: 'additional customer 2' }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).contains({ id: 8, account: 1, firstname: 'additional customer 2', lastname: '', nickname: '' });
            });

            it("catches missing account", () => m.execute("addCustomer", { firstname: 'world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing firstname", () => m.execute("addCustomer", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'firstname', type: 'string' } })));
            it("catches duplicate", () => m.execute("addCustomer", { account: 1, firstname: 'hello', lastname: 'world', nickname: '2' }).then(result => expect(result).contains({ code: CoreJS.ResponseCode.Forbidden, data: '#_customer_duplicate_name' })));
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

                expect(data).has.length(6);
                expect(data[0], 'customer at 0').contains({ id: 1, account: 1, firstname: 'test1', lastname: 'world', nickname: '', paymentMethods: -1 });
                expect(data[1], 'customer at 1').contains({ id: 3, account: 1, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
                expect(data[2], 'customer at 2').contains({ id: 4, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'test3', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
                expect(data[3], 'customer at 3').contains({ id: 5, account: 1, firstname: 'IHaveNoLastNameAndNoNickNameBro', lastname: '', nickname: '', paymentMethods: PaymentMethod.Cash });
                expect(data[4], 'customer at 4').contains({ id: 7, account: 1, firstname: 'additional customer', lastname: '', nickname: '', paymentMethods: -1 });
                expect(data[5], 'customer at 5').contains({ id: 8, account: 1, firstname: 'additional customer 2', lastname: '', nickname: '', paymentMethods: -1 });
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

                expect(data).has.length(5);
                expect(data[0], 'customer at 0').contains({ id: 3, account: 1, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
                expect(data[1], 'customer at 1').contains({ id: 4, account: 1, firstname: 'with', lastname: 'payment method', nickname: 'test3', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
                expect(data[2], 'customer at 2').contains({ id: 5, account: 1, firstname: 'IHaveNoLastNameAndNoNickNameBro', lastname: '', nickname: '', paymentMethods: PaymentMethod.Cash });
                expect(data[3], 'customer at 3').contains({ id: 7, account: 1, firstname: 'additional customer', lastname: '', nickname: '', paymentMethods: -1 });
                expect(data[4], 'customer at 4').contains({ id: 8, account: 1, firstname: 'additional customer 2', lastname: '', nickname: '', paymentMethods: -1 });
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
                const result = await m.execute("addProduct", { account: 1, name: 'product 1', price: 100, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 1, account: 1, name: 'product 1', price: 100, discount: 0, category: 4 });
            });

            it("adds product with discount", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'product 2', price: 150, discount: 10, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 2, account: 1, name: 'product 2', price: 150, discount: 10, category: 4 });
            });

            it("adds product third", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'product 3', price: 150, discount: 10, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 3, account: 1, name: 'product 3', price: 150, discount: 10, category: 4 });
            });

            it("adds product fourth", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'product 4', price: 150, discount: 10, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 10, category: 4 });
            });

            it("adds product for additional account", async () => {
                const result = await m.execute("addProduct", { account: 2, name: 'product 4', price: 150, discount: 10, category: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 5, account: 2, name: 'product 4', price: 150, discount: 10, category: 10 });
            });

            it("adds started product", async () => {
                const start = CoreJS.reduceDate({ days: 1 });
                const result = await m.execute("addProduct", { account: 1, name: 'started', price: 150, start, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 6, account: 1, name: 'started', price: 150, start: Number(start), category: 4 });
            });

            it("adds almost ended product", async () => {
                const end = CoreJS.addDate({ days: 1 });
                const result = await m.execute("addProduct", { account: 1, name: 'almost ended', price: 150, end, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 7, account: 1, name: 'almost ended', price: 150, end: Number(end), category: 4 });
            });

            it("adds outdated product", async () => {
                const end = CoreJS.reduceDate({ days: 2 });
                const result = await m.execute("addProduct", { account: 1, name: 'outdated', price: 150, end, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 8, account: 1, name: 'outdated', price: 150, end: Number(end), category: 4 });
            });

            it("adds future product", async () => {
                const start = CoreJS.addDate({ days: 2 });
                const result = await m.execute("addProduct", { account: 1, name: 'future', price: 150, start, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 9, account: 1, name: 'future', price: 150, start: Number(start), category: 4 });
            });

            it("adds product with priority", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'priority', price: 150, priority: 2, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 10, account: 1, name: 'priority', price: 150, priority: 2, category: 4 });
            });

            it("adds product with different category", async () => {
                const result = await m.execute("addProduct", { account: 1, name: 'category', price: 150, category: 7 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 11, account: 1, name: 'category', price: 150, category: 7 });
            });

            it("catches missing account", () => m.execute("addProduct", { name: 'test', price: 100, category: "test" }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing name", () => m.execute("addProduct", { account: 1, price: 100, category: "test" }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'name', type: 'string' } })));
            it("catches missing price", () => m.execute("addProduct", { account: 1, name: 'test', category: "test" }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'price', type: 'number' } })));
        });

        describe("Edit", () => {
            it("changes name", () => m.execute("editProduct", { account: 1, product: 1, name: 'test1' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes price", () => m.execute("editProduct", { account: 1, product: 3, price: 200 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes discount", () => m.execute("editProduct", { account: 1, product: 4, discount: 20 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes category", () => m.execute("editProduct", { account: 1, product: 1, category: 11 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes priority", () => m.execute("editProduct", { account: 1, product: 1, priority: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes start", () => m.execute("editProduct", { account: 1, product: 1, start: CoreJS.addDate({ days: 1 }) }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes end", () => m.execute("editProduct", { account: 1, product: 3, end: CoreJS.reduceDate({ days: 1 }) }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
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

                expect(data).has.length(9);
                expect(data[0]).contains({ id: 1, account: 1, name: 'test1', price: 100, discount: 0, category: 11, priority: 1 });
                expect(data[1]).contains({ id: 3, account: 1, name: 'product 3', price: 200, discount: 10, category: 4, priority: 0 });
                expect(data[2]).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20, category: 4, priority: 0 });
                expect(data[3]).contains({ id: 6, account: 1, name: 'started', price: 150, category: 4, priority: 0 });
                expect(data[4]).contains({ id: 7, account: 1, name: 'almost ended', price: 150, category: 4, priority: 0 });
                expect(data[5]).contains({ id: 8, account: 1, name: 'outdated', price: 150, category: 4, priority: 0 });
                expect(data[6]).contains({ id: 9, account: 1, name: 'future', price: 150, category: 4, priority: 0 });
                expect(data[7]).contains({ id: 10, account: 1, name: 'priority', price: 150, category: 4, priority: 2 });
                expect(data[8]).contains({ id: 11, account: 1, name: 'category', price: 150, category: 7, priority: 0 });
            });

            it("returns all from account 2", async () => {
                const result = await m.execute("getProducts", { account: 2 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0]).contains({ id: 5, account: 2, name: 'product 4', price: 150, discount: 10 });
            });

            it("returns first id 7", async () => {
                const result = await m.execute("getProducts", { account: 1, firstID: 7 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(5);
                expect(data[0]).contains({ id: 7, account: 1, name: 'almost ended', price: 150, category: 4, priority: 0 });
                expect(data[1]).contains({ id: 8, account: 1, name: 'outdated', price: 150, category: 4, priority: 0 });
                expect(data[2]).contains({ id: 9, account: 1, name: 'future', price: 150, category: 4, priority: 0 });
                expect(data[3]).contains({ id: 10, account: 1, name: 'priority', price: 150, category: 4, priority: 2 });
                expect(data[4]).contains({ id: 11, account: 1, name: 'category', price: 150, category: 7, priority: 0 });
            });

            it("returns last id 6", async () => {
                const result = await m.execute("getProducts", { account: 1, lastID: 6 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).contains({ id: 1, account: 1, name: 'test1', price: 100, discount: 0, category: 11, priority: 1 });
                expect(data[1]).contains({ id: 3, account: 1, name: 'product 3', price: 200, discount: 10, category: 4, priority: 0 });
                expect(data[2]).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20, category: 4, priority: 0 });
                expect(data[3]).contains({ id: 6, account: 1, name: 'started', price: 150, category: 4, priority: 0 });
            });

            it("returns current products", async () => {
                const result = await m.execute("getProducts", { account: 1, time: CoreJS.calcDate() }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(5);
                expect(data[0]).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20 });
                expect(data[1]).contains({ id: 6, account: 1, name: 'started', price: 150 });
                expect(data[2]).contains({ id: 7, account: 1, name: 'almost ended', price: 150 });
                expect(data[3]).contains({ id: 10, account: 1, name: 'priority', price: 150, priority: 2 });
                expect(data[4]).contains({ id: 11, account: 1, name: 'category', price: 150, category: 7, priority: 0 });
            });

            it("returns past products", async () => {
                const result = await m.execute("getProducts", { account: 1, time: CoreJS.reduceDate({ days: 2 }) }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(6);
                expect(data[0]).contains({ id: 3, account: 1, name: 'product 3', price: 200, discount: 10, category: 4, priority: 0 });
                expect(data[1]).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20 });
                expect(data[2]).contains({ id: 7, account: 1, name: 'almost ended', price: 150 });
                expect(data[3]).contains({ id: 8, account: 1, name: 'outdated', price: 150, category: 4, priority: 0 });
                expect(data[4]).contains({ id: 10, account: 1, name: 'priority', price: 150, priority: 2 });
                expect(data[5]).contains({ id: 11, account: 1, name: 'category', price: 150, category: 7, priority: 0 });
            });

            it("returns future products", async () => {
                const result = await m.execute("getProducts", { account: 1, time: CoreJS.addDate({ days: 2 }) }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(6);
                expect(data[0]).contains({ id: 1, account: 1, name: 'test1', price: 100, discount: 0, category: 11, priority: 1 });
                expect(data[1]).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20 });
                expect(data[2]).contains({ id: 6, account: 1, name: 'started', price: 150 });
                expect(data[3]).contains({ id: 9, account: 1, name: 'future', price: 150, category: 4, priority: 0 });
                expect(data[4]).contains({ id: 10, account: 1, name: 'priority', price: 150, priority: 2 });
                expect(data[5]).contains({ id: 11, account: 1, name: 'category', price: 150, category: 7, priority: 0 });
            });

            it("returns by category", async () => {
                const result = await m.execute("getProducts", { account: 1, category: 4 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(7);
                expect(data[0]).contains({ id: 3, account: 1, name: 'product 3', price: 200, discount: 10, category: 4, priority: 0 });
                expect(data[1]).contains({ id: 4, account: 1, name: 'product 4', price: 150, discount: 20, category: 4, priority: 0 });
                expect(data[2]).contains({ id: 6, account: 1, name: 'started', price: 150, category: 4, priority: 0 });
                expect(data[3]).contains({ id: 7, account: 1, name: 'almost ended', price: 150, category: 4, priority: 0 });
                expect(data[4]).contains({ id: 8, account: 1, name: 'outdated', price: 150, category: 4, priority: 0 });
                expect(data[5]).contains({ id: 9, account: 1, name: 'future', price: 150, category: 4, priority: 0 });
                expect(data[6]).contains({ id: 10, account: 1, name: 'priority', price: 150, category: 4, priority: 2 });
            });

            it("catches missing account", () => m.execute("getProducts", {}).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
        });
    });

    describe("Orders", () => {
        describe("Order Products", () => {
            it("orders product 1 for customer 1", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 100, amount: 1 });
            });

            it("orders product 1 for customer 1 with amount 9", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 1, amount: 9 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 100, amount: 10 });
            });

            it("orders product 3 for customer 1 with amount 10", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 3, amount: 10 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 3, price: 180, amount: 10 });
            });

            it("orders product 4 for customer 1", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 4 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 4, price: 120, amount: 1 });
            });

            it("orders product 1 for customer 3", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 3, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 2, product: 1, price: 100 });
            });

            it("orders product 1 for customer 4", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 4, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 1 });
            });

            it("orders product 3 for customer 4 with amount 10 and discount 0", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 4, product: 3, amount: 10, discount: 0 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 3, price: 200, amount: 10 });
            });

            it("orders product 4 for customer 4 with amount 10 and discount 5", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 4, product: 4, amount: 10, discount: 5 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 4, price: 142, amount: 10 });
            });

            it("creates permanently open order", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 5, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 4, product: 1 });
            });

            it("orders product 1 for customer 6 at account 2", async () => {
                const result = await m.execute("orderProduct", { account: 2, customer: 6, product: 5 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 5, product: 5, price: 135, amount: 1 });
            });

            it("creates orders for additional customers", async () => {
                let result = await m.execute("orderProduct", { account: 1, customer: 7, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 6, product: 1 });

                result = await m.execute("orderProduct", { account: 1, customer: 8, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 7, product: 1 });

                result = await m.execute("orderProduct", { account: 1, customer: 8, product: 3 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 7, product: 3 });
            });

            it("catches missing account", () => m.execute("orderProduct", { customer: 1, product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches invalid account", () => m.execute("orderProduct", { account: 1, product: 5, customer: 6 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches invalid account for product", () => m.execute("orderProduct", { account: 2, product: 1, customer: 6 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing customer", () => m.execute("orderProduct", { account: 1, product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches invalid customer", () => m.execute("orderProduct", { account: 1, product: 1, customer: Number.MAX_SAFE_INTEGER }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_customer_invalid" })));
            it("catches missing product", () => m.execute("orderProduct", { account: 1, customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "product", type: "number" } })));
            it("catches deleted product", () => m.execute("orderProduct", { account: 1, customer: 1, product: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
        });

        describe("Update Orders", () => {
            it("decreases amount of product 3 for customer 1", async () => {
                const result = await m.execute("updateOrder", { account: 1, customer: 1, product: 3, amount: 3 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 3, price: 180, amount: 3 });
            });

            it("increases amount of product 4 for customer 1", async () => {
                const result = await m.execute("updateOrder", { account: 1, customer: 1, product: 4, amount: 20 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 4, price: 120, amount: 20 });
            });

            it("changes discount of product 1 for customer 1", async () => {
                const result = await m.execute("updateOrder", { account: 1, customer: 1, product: 1, discount: 10 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 90, amount: 10 });
            });

            it("removes order product by decreasing amount to 0", async () => {
                const result = await m.execute("updateOrder", { account: 1, customer: 8, product: 1, amount: 0 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 7, product: 1, amount: 0 });
            });

            it("deletes order by decreasing amount of last order product to 0", async () => {
                const result = await m.execute("updateOrder", { account: 1, customer: 7, product: 1, amount: 0 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: '#_order_deleted' });
            });

            it("catches no changes", () => m.execute("updateOrder", { account: 1, customer: 1, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "0" })));
            it("catches missing account", () => m.execute("updateOrder", { customer: 1, product: 1, amount: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches invalid account", () => m.execute("updateOrder", { account: 1, customer: 6, product: 1, amount: 9 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing customer", () => m.execute("updateOrder", { account: 1, product: 1, amount: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches invalid order", () => m.execute("updateOrder", { account: 1, customer: Number.MAX_SAFE_INTEGER, product: 1, amount: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches missing product", () => m.execute("updateOrder", { account: 1, customer: 1, amount: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "product", type: "number" } })));
            it("catches deleted product", () => m.execute("updateOrder", { account: 1, customer: 1, product: 2, amount: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
            it("catches not ordered product", () => m.execute("updateOrder", { account: 1, customer: 1, product: Number.MAX_SAFE_INTEGER, amount: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
        });

        describe("Cancel Products", () => {
            it("cancels product 1 for customer 4", () => m.execute("cancelProduct", { account: 1, customer: 4, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("cancels order by canceling last order product", () => m.execute("cancelProduct", { account: 1, customer: 8, product: 3 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "#_order_deleted" })));
            it("catches missing account", () => m.execute("cancelProduct", { customer: 1, product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches invalid account", () => m.execute("cancelProduct", { account: 1, customer: 6, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches not existing product", () => m.execute("cancelProduct", { account: 1, customer: 4, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "0" })));
            it("catches missing customer", () => m.execute("cancelProduct", { account: 1, product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches invalid order", () => m.execute("cancelProduct", { account: 1, customer: Number.MAX_SAFE_INTEGER, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches missing product", () => m.execute("cancelProduct", { account: 1, customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "product", type: "number" } })));
            it("catches deleted product", () => m.execute("cancelProduct", { account: 1, customer: 1, product: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
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
            it("catches invalid order payment method", () => m.execute("closeOrder", { account: 1, order: 2, amount: 10000, paymentmethod: -1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_payment_method" })));
            it("catches invalid customer payment method", () => m.execute("closeOrder", { account: 1, order: 2, amount: 10000, paymentmethod: PaymentMethod.Cash }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_customer_invalid_payment_method" })));
            it("catches missing amount", () => m.execute("closeOrder", { account: 1, order: 2, paymentmethod: PaymentMethod.Balance }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "amount", type: "number" } })));
            it("catches invalid amount", () => m.execute("closeOrder", { account: 1, order: 2, amount: 1, paymentmethod: PaymentMethod.Balance }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_not_enough_amount" })));
        });

        describe("Delete Open Orders", () => {
            it("deletes open order 2", () => m.execute("deleteOrder", { account: 1, order: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing account", () => m.execute("deleteOrder", { order: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches invalid account", () => m.execute("deleteOrder", { account: 1, order: 5 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing order", () => m.execute("deleteOrder", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
            it("catches invalid order", () => m.execute("deleteOrder", { account: 1, order: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches closed order", () => m.execute("deleteOrder", { account: 1, order: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_not_open" })));
        });

        describe("Create Orders after closing previous", () => {
            it("creates second", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 8, product: 1, price: 100, amount: 1 });
            });

            it("closes second", async () => {
                const result = await m.execute("closeOrder", { account: 1, order: 8, paymentmethod: PaymentMethod.Cash, amount: 150 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 8, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
            });

            it("creates third", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 9, product: 1, price: 100, amount: 1 });
            });

            it("closes third", async () => {
                const result = await m.execute("closeOrder", { account: 1, order: 9, paymentmethod: PaymentMethod.Cash, amount: 100 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 9, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
            });

            it("creates balance order", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 3, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 10, product: 1, price: 100, amount: 1 });
            });

            it("creates reopen 1", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 11, product: 1, price: 100, amount: 1 });
            });

            it("closes reopen 1", async () => {
                let result = await m.execute("closeOrder", { account: 1, order: 11, paymentmethod: PaymentMethod.Cash, amount: 150 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 11, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
            });

            it("creates reopen 2", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 1, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 12, product: 1, price: 100, amount: 1 });
            });

            it("closes reopen 2", async () => {
                let result = await m.execute("closeOrder", { account: 1, order: 12, paymentmethod: PaymentMethod.Cash, amount: 150 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 12, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
            });

            it("creates reopen 3", async () => {
                const result = await m.execute("orderProduct", { account: 1, customer: 4, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 13, product: 1, price: 100, amount: 1 });
            });
        });

        describe("Close All Open Balance Orders", () => {
            it("closes all open balance orders", async () => {
                const result = await m.execute("closeAllOpenBalanceOrders", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0]).deep.contains({ id: 10, account: 1, state: OrderState.Closed, customer: 3, paymentMethod: PaymentMethod.Balance, tip: 0 });
                expect(data[1]).deep.contains({ id: 13, account: 1, state: OrderState.Closed, customer: 4, paymentMethod: PaymentMethod.Balance, tip: 0 });
            });

            it("catches missing account", () => m.execute("closeAllOpenBalanceOrders").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
        });

        describe("Reopen Orders", () => {
            it("reopens reopen 1", async () => {
                const result = await m.execute("reopenOrder", { account: 1, order: 11 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 11, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("reopens reopen 2", async () => {
                const result = await m.execute("reopenOrder", { account: 1, order: 12 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 12, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("closes reopen 2", async () => {
                let result = await m.execute("closeOrder", { account: 1, order: 12, paymentmethod: PaymentMethod.Cash, amount: 250 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 12, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 150 });
            });

            it("reopens reopen 3", async () => {
                const result = await m.execute("reopenOrder", { account: 1, order: 13 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 13, account: 1, state: OrderState.Open, customer: 4, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("catches missing account", () => m.execute("reopenOrder", { order: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches invalid account", () => m.execute("reopenOrder", { account: 2, order: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing order", () => m.execute("reopenOrder", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
        });

        describe("Get Orders", () => {
            it("returns all orders of account 1 with his products", async () => {
                const result = await m.execute("getOrders", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(9);
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

                expect(data[3]).deep.contains({ id: 8, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
                expect(data[3].products, "products of order at index 3").has.length(1);
                expect(data[3].products[0], "product at index 0 of order at index 3").deep.contains({ order: 8, product: 1, price: 100, amount: 1 });

                expect(data[4]).deep.contains({ id: 9, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
                expect(data[4].products, "products of order at index 4").has.length(1);
                expect(data[4].products[0], "product at index 0 of order at index 4").deep.contains({ order: 9, product: 1, price: 100, amount: 1 });

                expect(data[5]).deep.contains({ id: 10, account: 1, state: OrderState.Closed, customer: 3, paymentMethod: PaymentMethod.Balance, tip: 0 });
                expect(data[5].products, "products of order at index 5").has.length(1);
                expect(data[5].products[0], "product at index 0 of order at index 5").deep.contains({ order: 10, product: 1, price: 100, amount: 1 });

                expect(data[6]).deep.contains({ id: 11, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[6].products, "products of order at index 6").has.length(1);
                expect(data[6].products[0], "product at index 0 of order at index 6").deep.contains({ order: 11, product: 1, price: 100, amount: 1 });

                expect(data[7]).deep.contains({ id: 12, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 150 });
                expect(data[7].products, "products of order at index 7").has.length(1);
                expect(data[7].products[0], "product at index 0 of order at index 7").deep.contains({ order: 12, product: 1, price: 100, amount: 1 });

                expect(data[8]).deep.contains({ id: 13, account: 1, state: OrderState.Open, customer: 4, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[8].products, "products of order at index 6").has.length(1);
                expect(data[8].products[0], "product at index 0 of order at index 6").deep.contains({ order: 13, product: 1, price: 100, amount: 1 });
            });

            it("returns all orders of account 2", async () => {
                const result = await m.execute("getOrders", { account: 2 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0]).deep.contains({ id: 5, account: 2, state: OrderState.Open, customer: 6, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[0].products, "products of order at index 0").has.length(1);
                expect(data[0].products[0], "product at index 0 of order at index 0").deep.contains({ order: 5, product: 5, price: 135, amount: 1 });
            });

            it("returns open orders", async () => {
                const result = await m.execute("getOrders", { account: 1, state: OrderState.Open }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ id: 4, account: 1, state: OrderState.Open, customer: 5, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[1]).deep.contains({ id: 11, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[2]).deep.contains({ id: 13, account: 1, state: OrderState.Open, customer: 4, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("returns customer orders", async () => {
                const result = await m.execute("getOrders", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(5);
                expect(data[0]).deep.contains({ id: 1, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 160 });
                expect(data[1]).deep.contains({ id: 8, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
                expect(data[2]).deep.contains({ id: 9, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
                expect(data[3]).deep.contains({ id: 11, account: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
                expect(data[4]).deep.contains({ id: 12, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 150 });
            });

            it("returns closed customer orders", async () => {
                const result = await m.execute("getOrders", { account: 1, customer: 1, state: OrderState.Closed }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ id: 1, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 160 });
                expect(data[1]).deep.contains({ id: 8, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 50 });
                expect(data[2]).deep.contains({ id: 9, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 0 });
                expect(data[3]).deep.contains({ id: 12, account: 1, state: OrderState.Closed, customer: 1, paymentMethod: PaymentMethod.Cash, tip: 150 });
            });

            it("returns orders by start", async () => {
                let result = await m.execute("getOrders", { account: 1, start: "2022-09-25" }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);

                result = await m.execute("getOrders", { account: 1, start: CoreJS.calcDate() }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).has.length(9);
            });

            it("returns orders by end", async () => {
                let result = await m.execute("getOrders", { account: 1, end: CoreJS.calcDate() }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);

                result = await m.execute("getOrders", { account: 1, end: Date.now() + CoreJS.Milliseconds.Hour }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).has.length(9);
            });

            it("catches missing account", () => m.execute("getOrders", {}).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
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

                expect(data).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1580 });
            });

            it("deposits to remove", async () => {
                const result = await m.execute("depositBalance", { account: 1, customer: 4, value: 5000 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 6580 });
            });

            it("catches missing account", () => m.execute("depositBalance", { customer: 1, value: 1000 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches invalid account", () => m.execute("depositBalance", { account: 2, customer: 1, value: 1000 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing customer", () => m.execute("depositBalance", { account: 1, value: 1000 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches missing value", () => m.execute("depositBalance", { account: 1, customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "value", type: "number" } })));
        });

        describe("Withdraw", () => {
            it("withdraws for customer 1", async () => {
                const result = await m.execute("withdrawBalance", { account: 1, customer: 1, value: 900 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
            });

            it("withdraw to undo", async () => {
                const result = await m.execute("withdrawBalance", { account: 1, customer: 1, value: 200 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: -100 });
            });

            it("catches missing account", () => m.execute("withdrawBalance", { customer: 1, value: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches invalid account", () => m.execute("withdrawBalance", { account: 2, customer: 1, value: 1000 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing customer", () => m.execute("withdrawBalance", { account: 1, value: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches missing value", () => m.execute("withdrawBalance", { account: 1, customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "value", type: "number" } })));
        });

        describe("Undo Transfers", () => {
            it("undo deposit", async () => {
                const result = await m.execute("undoTransfer", { account: 1, id: 22 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1580 });
            });

            it("undo withdraw", async () => {
                const result = await m.execute("undoTransfer", { account: 1, id: 24 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
            });

            it("catches missing account", () => m.execute("undoTransfer", { id: 23 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches invalid account", () => m.execute("undoTransfer", { account: 2, id: 23 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
            it("catches missing id", () => m.execute("undoTransfer", { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "id", type: "number" } })));
            it("catches invalid data", () => m.execute("undoTransfer", { account: 1, id: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_transaction_data_invalid" })));
        });

        describe("Get Current", () => {
            it("returns balance of customer 1", () => m.execute("getBalance", { account: 1, customer: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "100" })));
            it("returns balance of customer 3", () => m.execute("getBalance", { account: 1, customer: 3 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-100" })));
            it("returns balance of customer 4", () => m.execute("getBalance", { account: 1, customer: 4 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "1580" })));
            it("returns balance of customer 5", () => m.execute("getBalance", { account: 1, customer: 5 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "0" })));
            it("returns balance of customer 6", () => m.execute("getBalance", { account: 2, customer: 6 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "0" })));

            it("catches missing account", () => m.execute("getBalance", { customer: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches invalid account", () => m.execute("getBalance", { account: 2, customer: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
        });

        describe("Get All", () => {
            it("returns all balances", async () => {
                const result = await m.execute("getBalance", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
                expect(data[1]).deep.contains({ account: 1, customer: 3, paymentMethod: PaymentMethod.Balance, value: -100 });
                expect(data[2]).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1580 });
            });

            it("catches missing account", () => m.execute("getBalance").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
        });

        describe("Finances", () => {
            it("returns all of account 1", async () => {
                let result = await m.execute("getFinances", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
                expect(data[1]).deep.contains({ account: 1, customer: 3, paymentMethod: PaymentMethod.Balance, value: -100 });
                expect(data[2]).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1580 });
                expect(data[3]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, value: -4500 });
            });

            it("returns all of account 2", async () => {
                let result = await m.execute("getFinances", { account: 2 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);
            });

            it("returns by start", async () => {
                let result = await m.execute("getFinances", { account: 1, start: "2022-09-25" }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);

                result = await m.execute("getFinances", { account: 1, start: CoreJS.calcDate() }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
                expect(data[1]).deep.contains({ account: 1, customer: 3, paymentMethod: PaymentMethod.Balance, value: -100 });
                expect(data[2]).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1580 });
                expect(data[3]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, value: -4500 });
            });

            it("returns by end", async () => {
                let result = await m.execute("getFinances", { account: 1, end: CoreJS.calcDate() }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);

                result = await m.execute("getFinances", { account: 1, end: Date.now() + CoreJS.Milliseconds.Hour }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).has.length(4);
                expect(data[0]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 100 });
                expect(data[1]).deep.contains({ account: 1, customer: 3, paymentMethod: PaymentMethod.Balance, value: -100 });
                expect(data[2]).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 1580 });
                expect(data[3]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, value: -4500 });
            });

            it("returns invoices and tips", async () => {
                const result = await m.execute("getFinances", { account: 1, data: [BalanceEvent.Invoice, BalanceEvent.Tip, BalanceEvent.UndoInvoice, BalanceEvent.UndoTip] }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ account: 1, customer: 3, paymentMethod: PaymentMethod.Balance, value: -100 });
                expect(data[1]).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: -3420 });
                expect(data[2]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, value: -4500 });
            });

            it("returns deposits", async () => {
                const result = await m.execute("getFinances", { account: 1, data: [BalanceEvent.Deposit] }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0]).deep.contains({ account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, value: 1000 });
                expect(data[1]).deep.contains({ account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, value: 5000 });
            });

            it("returns finances of customer 1", async () => {
                const result = await m.execute("getFinances", { account: 1, customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(18);
                expect(data[0]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 1, value: 3840, data: BalanceEvent.Invoice });
                expect(data[1]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 1, value: 160, data: BalanceEvent.Tip });
                expect(data[2]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 8, value: 100, data: BalanceEvent.Invoice });
                expect(data[3]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 8, value: 50, data: BalanceEvent.Tip });
                expect(data[4]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 9, value: 100, data: BalanceEvent.Invoice });
                expect(data[5]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 11, value: 100, data: BalanceEvent.Invoice });
                expect(data[6]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 11, value: 50, data: BalanceEvent.Tip });
                expect(data[7]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 12, value: 100, data: BalanceEvent.Invoice });
                expect(data[8]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 12, value: 50, data: BalanceEvent.Tip });
                expect(data[9]).deep.contains({ type: BackendJS.Balance.EventType.Increase, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 11, value: 100, data: BalanceEvent.UndoInvoice });
                expect(data[10]).deep.contains({ type: BackendJS.Balance.EventType.Increase, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 11, value: 50, data: BalanceEvent.UndoTip });
                expect(data[11]).deep.contains({ type: BackendJS.Balance.EventType.Increase, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 12, value: 100, data: BalanceEvent.UndoInvoice });
                expect(data[12]).deep.contains({ type: BackendJS.Balance.EventType.Increase, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 12, value: 50, data: BalanceEvent.UndoTip });
                expect(data[13]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 12, value: 100, data: BalanceEvent.Invoice });
                expect(data[14]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Cash, order: 12, value: 150, data: BalanceEvent.Tip });
                expect(data[15]).deep.contains({ type: BackendJS.Balance.EventType.Increase, account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, order: 0, value: 1000, data: BalanceEvent.Deposit });
                expect(data[16]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.Balance, order: 0, value: 900, data: BalanceEvent.Withdraw });
                expect(data[17]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 1, paymentMethod: PaymentMethod.None, order: 11, value: 100, data: BalanceEvent.OpenInvoice });
            });

            it("returns finances of customer 3", async () => {
                const result = await m.execute("getFinances", { account: 1, customer: 3 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 3, paymentMethod: PaymentMethod.Balance, order: 10, value: 100, data: BalanceEvent.Invoice });
            });

            it("returns finances of customer 4", async () => {
                const result = await m.execute("getFinances", { account: 1, customer: 4 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(5);
                expect(data[0]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 3, value: 3420, data: BalanceEvent.Invoice });
                expect(data[1]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 13, value: 100, data: BalanceEvent.Invoice });
                expect(data[2]).deep.contains({ type: BackendJS.Balance.EventType.Increase, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 13, value: 100, data: BalanceEvent.UndoInvoice });
                expect(data[3]).deep.contains({ type: BackendJS.Balance.EventType.Increase, account: 1, customer: 4, paymentMethod: PaymentMethod.Balance, order: 0, value: 5000, data: BalanceEvent.Deposit });
                expect(data[4]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 1, customer: 4, paymentMethod: PaymentMethod.None, order: 13, value: 100, data: BalanceEvent.OpenInvoice });
            });

            it("returns finances of customer 6", async () => {
                const result = await m.execute("getFinances", { account: 2, customer: 6 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0]).deep.contains({ type: BackendJS.Balance.EventType.Decrease, account: 2, customer: 6, paymentMethod: PaymentMethod.None, order: 5, value: 135, data: BalanceEvent.OpenInvoice });
            });

            it("catches missing account", () => m.execute("getFinances").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
            it("catches invalid account", () => m.execute("getFinances", { account: 2, customer: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_permission_denied" })));
        });

        describe("Transfers", () => {
            it("returns all of account 1", async () => {
                let result = await m.execute("getTransfers", { account: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ account: 1, customer: 1, data: BalanceEvent.Deposit, value: 1000 });
                expect(data[1]).deep.contains({ account: 1, customer: 4, data: BalanceEvent.Deposit, value: 5000 });
                expect(data[2]).deep.contains({ account: 1, customer: 1, data: BalanceEvent.Withdraw, value: 900 });
            });

            it("returns all of account 2", async () => {
                let result = await m.execute("getTransfers", { account: 2 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);
            });

            it("returns by start", async () => {
                let result = await m.execute("getTransfers", { account: 1, start: "2022-09-25" }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);

                result = await m.execute("getTransfers", { account: 1, start: CoreJS.calcDate() }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ account: 1, customer: 1, data: BalanceEvent.Deposit, value: 1000 });
                expect(data[1]).deep.contains({ account: 1, customer: 4, data: BalanceEvent.Deposit, value: 5000 });
                expect(data[2]).deep.contains({ account: 1, customer: 1, data: BalanceEvent.Withdraw, value: 900 });
            });

            it("returns by end", async () => {
                let result = await m.execute("getTransfers", { account: 1, end: CoreJS.calcDate() }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                let data = JSON.parse(result.data);

                expect(data).has.length(0);

                result = await m.execute("getTransfers", { account: 1, end: Date.now() + CoreJS.Milliseconds.Hour }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0]).deep.contains({ account: 1, customer: 1, data: BalanceEvent.Deposit, value: 1000 });
                expect(data[1]).deep.contains({ account: 1, customer: 4, data: BalanceEvent.Deposit, value: 5000 });
                expect(data[2]).deep.contains({ account: 1, customer: 1, data: BalanceEvent.Withdraw, value: 900 });
            });

            it("catches missing account", () => m.execute("getTransfers").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "account", type: "number" } })));
        });
    });

    describe("Remove Customers", () => {
        describe("Remove Customer", () => {
            it("catches open orders", () => m.execute('removeCustomer', { account: 1, customer: 4 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: '#_customer_has_open_order' })));
        });

        describe("Remove All Customers", () => {
            it("all without open order", () => m.execute('removeAllCustomers', { account: 1, paymentmethod: PaymentMethod.Cash }).then(result => {
                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "1" });

                return m.customerRepository.getAll(1, { paymentMethods: PaymentMethod.Cash }).then(result => expect(result.map(data => data.id)).deep.equals([1, 4, 5]));
            }));

            it("catches missing account", () => m.execute('removeAllCustomers', { paymentmethod: PaymentMethod.Cash }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'account', type: 'number' } })));
            it("catches missing paymentmethod", () => m.execute('removeAllCustomers', { account: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'paymentmethod', type: 'number' } })));
            it("catches zero customers to delete", () => m.execute('removeAllCustomers', { account: 1, paymentmethod: PaymentMethod.Cash }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "1" })));
        });
    });

    describe("Bonus handling", () => {
        describe("deposit before", () => {
            it("deposits for customer 12", async () => {
                const result = await m.execute("depositBalance", { date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 1 }), account: 3, customer: 12, value: 100 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ customer: 12, value: 100 });
            });

            it("deposits for customer 13", async () => {
                const result = await m.execute("depositBalance", { date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 1 }), account: 3, customer: 13, value: 780 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ customer: 13, value: 780 });
            });
        });

        describe("deposit after", () => {
            it("deposits for customer 14", async () => {
                const result = await m.execute("depositBalance", { date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 4 }), account: 3, customer: 14, value: 400 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ customer: 14, value: -380 });
            });

            it("deposits for customer 15", async () => {
                const result = await m.execute("depositBalance", { date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 4 }), account: 3, customer: 15, value: 780 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ customer: 15, value: 150 });
            });

            it("deposits for customer 16", async () => {
                const result = await m.execute("depositBalance", { date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 4 }), account: 3, customer: 16, value: 750 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ customer: 16, value: -150 });
            });

            it("deposits for customer 17", async () => {
                const result = await m.execute("depositBalance", { date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 4 }), account: 3, customer: 17, value: 900 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ customer: 17, value: 150 });
            });
        }).beforeAll(async () => {
            await m.execute("orderProduct", { account: 3, customer: 11, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 12, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 13, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 14, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 15, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 16, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 17, product: 12, discount: 0 });

            await m.database.query(`UPDATE orders SET \`state\`=${OrderState.Closed},\`paymentMethod\`=${PaymentMethod.Balance},\`tip\`=0,\`updated\`=FROM_UNIXTIME(${Number(CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 })) / 1000}) WHERE account=3 AND \`state\`=${OrderState.Open}`);

            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 }), account: 3, depot: 11, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 }), account: 3, depot: 12, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 }), account: 3, depot: 13, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 }), account: 3, depot: 14, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 }), account: 3, depot: 15, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 }), account: 3, depot: 16, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 2 }), account: 3, depot: 17, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });

            await m.execute("orderProduct", { account: 3, customer: 11, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 12, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 13, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 14, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 15, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 16, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 17, product: 12, discount: 0 });

            await m.execute("orderProduct", { account: 3, customer: 11, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 12, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 13, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 14, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 15, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 16, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 17, product: 13, discount: 0 });

            await m.database.query(`UPDATE orders SET \`state\`=${OrderState.Closed},\`paymentMethod\`=${PaymentMethod.Balance},\`tip\`=0,\`updated\`=FROM_UNIXTIME(${Number(CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 })) / 1000}) WHERE account=3 AND \`state\`=${OrderState.Open}`);

            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 }), account: 3, depot: 11, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 }), account: 3, depot: 12, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 }), account: 3, depot: 13, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 }), account: 3, depot: 14, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 }), account: 3, depot: 15, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 }), account: 3, depot: 16, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 3 }), account: 3, depot: 17, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });

            await m.execute("orderProduct", { account: 3, customer: 11, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 12, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 13, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 14, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 15, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 16, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 17, product: 13, discount: 0 });

            await m.database.query(`UPDATE orders SET \`state\`=${OrderState.Closed},\`paymentMethod\`=${PaymentMethod.Balance},\`tip\`=0,\`updated\`=FROM_UNIXTIME(${Number(CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 })) / 1000}) WHERE account=3 AND \`state\`=${OrderState.Open}`);

            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 }), account: 3, depot: 11, order: 0, asset: PaymentMethod.Balance, value: 200, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 }), account: 3, depot: 12, order: 0, asset: PaymentMethod.Balance, value: 200, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 }), account: 3, depot: 13, order: 0, asset: PaymentMethod.Balance, value: 200, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 }), account: 3, depot: 14, order: 0, asset: PaymentMethod.Balance, value: 200, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 }), account: 3, depot: 15, order: 0, asset: PaymentMethod.Balance, value: 200, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 }), account: 3, depot: 16, order: 0, asset: PaymentMethod.Balance, value: 200, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 2 }), account: 3, depot: 17, order: 0, asset: PaymentMethod.Balance, value: 200, data: BalanceEvent.Invoice });

            await m.execute("orderProduct", { account: 3, customer: 11, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 12, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 13, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 14, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 15, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 16, product: 12, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 17, product: 12, discount: 0 });

            await m.execute("orderProduct", { account: 3, customer: 11, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 12, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 13, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 14, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 15, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 16, product: 13, discount: 0 });
            await m.execute("orderProduct", { account: 3, customer: 17, product: 13, discount: 0 });

            await m.database.query(`UPDATE orders SET \`state\`=${OrderState.Closed},\`paymentMethod\`=${PaymentMethod.Balance},\`tip\`=0,\`updated\`=FROM_UNIXTIME(${Number(CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 })) / 1000}) WHERE account=3 AND \`state\`=${OrderState.Open}`);

            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 }), account: 3, depot: 11, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 }), account: 3, depot: 12, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 }), account: 3, depot: 13, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 }), account: 3, depot: 14, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 }), account: 3, depot: 15, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 }), account: 3, depot: 16, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 2 }), monthDay: 3 }), account: 3, depot: 17, order: 0, asset: PaymentMethod.Balance, value: 300, data: BalanceEvent.Invoice });
        });

        describe("first bonus execution", () => {
            it("executes", () => m.execute("executeBonus", { account: 3, time: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 4 }) }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "1" })));
            it("results", async () => {
                await m.execute("getBalance", { account: 3, customer: 10 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "0" }));
                await m.execute("getBalance", { account: 3, customer: 11 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-900" }));
                await m.execute("getBalance", { account: 3, customer: 12 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-800" }));
                await m.execute("getBalance", { account: 3, customer: 13 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "150" }));
                await m.execute("getBalance", { account: 3, customer: 14 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-380" }));
                await m.execute("getBalance", { account: 3, customer: 15 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "150" }));
                await m.execute("getBalance", { account: 3, customer: 16 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-150" }));
                await m.execute("getBalance", { account: 3, customer: 17 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "150" }));
            });
        });

        describe("second bonus execution", () => {
            it("executes", () => m.execute("executeBonus", { account: 3, time: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 3 }), monthDay: 4 }) }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "1" })));
            it("results", async () => {
                await m.execute("getBalance", { account: 3, customer: 10 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "0" }));
                await m.execute("getBalance", { account: 3, customer: 11 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-900" }));
                await m.execute("getBalance", { account: 3, customer: 12 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-800" }));
                await m.execute("getBalance", { account: 3, customer: 13 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "150" }));
                await m.execute("getBalance", { account: 3, customer: 14 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-380" }));
                await m.execute("getBalance", { account: 3, customer: 15 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "150" }));
                await m.execute("getBalance", { account: 3, customer: 16 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "-150" }));
                await m.execute("getBalance", { account: 3, customer: 17 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "150" }));
                await m.execute("getBalance", { account: 3, customer: 18 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.Text, data: "30" }));
            });
        }).beforeAll(async () => {
            await m.execute("addCustomer", { account: 3, firstname: "additional_execution", paymentMethods: PaymentMethod.Balance });
            await m.execute("depositBalance", { date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 1 }), monthDay: 1 }), account: 3, customer: 18, value: 100 });
            await m.execute("orderProduct", { account: 3, customer: 18, product: 12, discount: 0 });
            await m.database.query(`UPDATE orders SET \`state\`=${OrderState.Closed},\`paymentMethod\`=${PaymentMethod.Balance},\`tip\`=0,\`updated\`=FROM_UNIXTIME(${Number(CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 1 }), monthDay: 2 })) / 1000}) WHERE account=3 AND \`state\`=${OrderState.Open}`);
            await m.balanceRepository.decrease({ date: CoreJS.calcDate({ date: CoreJS.reduceDate({ months: 1 }), monthDay: 2 }), account: 3, depot: 18, order: 0, asset: PaymentMethod.Balance, value: 100, data: BalanceEvent.Invoice });
        });
    }).beforeAll(async () => {
        await m.execute("addCustomer", { account: 3, firstname: "do_nothing", paymentMethods: PaymentMethod.Balance });
        await m.execute("addCustomer", { account: 3, firstname: "no_balance", paymentMethods: PaymentMethod.Balance });
        await m.execute("addCustomer", { account: 3, firstname: "deposit_first_not_enough", paymentMethods: PaymentMethod.Balance });
        await m.execute("addCustomer", { account: 3, firstname: "deposit_first_enough", paymentMethods: PaymentMethod.Balance });
        await m.execute("addCustomer", { account: 3, firstname: "deposit_between_not_enough", paymentMethods: PaymentMethod.Balance });
        await m.execute("addCustomer", { account: 3, firstname: "deposit_between_enough", paymentMethods: PaymentMethod.Balance });
        await m.execute("addCustomer", { account: 3, firstname: "deposit_after_not_enough", paymentMethods: PaymentMethod.Balance });
        await m.execute("addCustomer", { account: 3, firstname: "deposit_after_enough", paymentMethods: PaymentMethod.Balance });

        await m.execute("addProduct", { account: 3, name: 'product_1', price: 100, category: 1, discount: 1 });
        await m.execute("addProduct", { account: 3, name: 'product_2', price: 200, category: 1, discount: 1 });
    });

    // describe("Backup", () => {
    //     it("creates", () => m.execute('backup', config.backup).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK })));
    // });

    describe("Deinitialization", () => {
        it("reverts", () => m.execute('revert').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("closes", () => m.deinit());
    });
});
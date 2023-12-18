import * as CoreJS from "corejs";
import { Customer } from "../models";
import { BalanceEvent, OrderState, PaymentMethod } from "../enums";
import { Context } from "../core";

export async function executeBonus(account: number, customer: Customer, context: Context, time?: number) {
    const firstDayOfCurrentMonth = CoreJS.calcDate({ monthDay: 1 });
    const firstDayOfStartMonth = time
        ? CoreJS.calcDate({ date: new Date(time), monthDay: 1 })
        : CoreJS.reduceDate({ date: firstDayOfCurrentMonth, months: 1 });

    for (let start = firstDayOfStartMonth, end = CoreJS.addDate({ date: start, months: 1 }); start < firstDayOfCurrentMonth; start = end, end = CoreJS.addDate({ date: end, months: 1 })) {
        // get paid out bonus
        const paidBonus = await context.balanceRepository.getEvents(account, {
            start: Number(start),
            end: Number(end),
            data: BalanceEvent.Bonus
        });

        // skip bonus that has already been paid out
        if (0 < paidBonus.length)
            return;

        // get balance at end of month
        const balance = await context.balanceRepository.getBalance(account, {
            time: Number(end),
            depot: customer.id,
            asset: PaymentMethod.Balance
        });

        // if there is no balance for customer
        // the customer has no orders
        if (0 == balance.length)
            return;

        // skip bonus if balance is negative
        if (0 > balance[0].value)
            return;

        let bonus = 0;

        // caluclate bonus by orders of month
        await context.orderRepository.fetchOrders(account, async order => bonus += CoreJS.Currency.percentage(await context.orderRepository.getInvoice(order.id), 100 - context.discount), {
            customer: customer.id,
            start: Number(start),
            end: Number(end),
            state: OrderState.Closed,
            paymentMethod: PaymentMethod.Balance
        });

        // pay out bonus
        await context.balanceRepository.increase({
            date: end,
            account: account,
            depot: customer.id,
            order: 0,
            asset: PaymentMethod.Balance,
            value: bonus,
            data: BalanceEvent.Bonus
        });
    }
}
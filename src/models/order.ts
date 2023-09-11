import { PaymentMethod } from "../enums";

export interface Order {
    readonly id: number;
    readonly created: number;
    readonly customer: number;
    readonly paymentMethod: PaymentMethod;
    readonly tip: number;
}
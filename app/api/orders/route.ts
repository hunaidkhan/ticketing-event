// app/api/orders/route.ts
import { NextResponse } from "next/server";
import {
  Client,
  Environment,
  OrdersController,
  ApiError,
  LogLevel,
  PaymentsController,
} from "@paypal/paypal-server-sdk";
import { connectToDatabase } from "@/lib/database";

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { eventId, eventTitle, isFree, price, buyerId, totalAmount, tickets, dietaryRestriction } = data;

    // Create the PayPal order with proper camelCase keys.
    const { body } = await ordersController.ordersCreate({
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            amount: {
              currencyCode: "CAD",
              value: totalAmount.toString(),
            },
            description: `Tickets: ${
              tickets.filter((t: any) => t.gender === "male").length
            } male, ${
              tickets.filter((t: any) => t.gender === "female").length
            } female`,
            // Encode extra data into customId.
            customId: JSON.stringify({ eventId, eventTitle, isFree, price, buyerId, tickets, dietaryRestriction }),
          },
        ],
        eventTitle: eventTitle,
        isFree: isFree,
        price: price,
        buyerId: buyerId,
        eventId: eventId,
      },
    });

    const paypalOrder = JSON.parse(body);
    return NextResponse.json(paypalOrder);
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      {
        details: [
          {
            issue: "ORDER_CREATE_FAILED",
            description: error.message,
          },
        ],
        debug_id: Date.now().toString(),
      },
      { status: 500 }
    );
  }
}

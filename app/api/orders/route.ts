// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { 
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController } from "@paypal/paypal-server-sdk";
import { connectToDatabase } from "@/lib/database";
import Order from "@/lib/database/models/order.model";
import Event from "@/lib/database/models/event.model";

// Initialize PayPal client
const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
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


// app/api/orders/route.ts
export async function POST(req: Request) {
    try {
      await connectToDatabase();
      
      const orderData = await req.json();
      const { eventId, buyerId, totalAmount, tickets, dietaryRestriction } = orderData;
  
      // Create PayPal order first

      const { body } = await ordersController.ordersCreate({
        body: {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "CAD",
                value: totalAmount,
              },
              description: `Tickets: ${tickets.filter(t => t.gender === "male").length} male, ${tickets.filter(t => t.gender === "female").length} female`,
              custom_id: eventId,
            },
          ],
        },
      });
  
      const paypalOrder = JSON.parse(body);
  
     
  
      // Return format matching PayPal's expected response
      return NextResponse.json(paypalOrder);
  
    } catch (error) {
      console.error("Failed to create order:", error);
      return NextResponse.json({
        details: [{
          issue: "ORDER_CREATE_FAILED",
          description: error.message
        }],
        debug_id: Date.now().toString()
      }, { status: 500 });
    }
  }
  
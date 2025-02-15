import { NextResponse } from "next/server";
import { Client, Environment, OrdersController } from "@paypal/paypal-server-sdk";
import { connectToDatabase } from "@/lib/database";
import Order from "@/lib/database/models/order.model";

// Use the same authentication property as in your order creation route.
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  environment: Environment.Sandbox,
});

const ordersController = new OrdersController(client);

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectToDatabase();
    const { orderId } = params;

    // Build the capture payload as a plain object.
    const captureRequestPayload = {
      id: orderId,
      prefer: "return=minimal",
    };

    // Capture the order.
    const { body } = await ordersController.ordersCapture(captureRequestPayload);
    console.log("body", body);
    const captureData = JSON.parse(body);

    // Check that the capture response contains the purchase units.
    if (captureData.status === "COMPLETED") {
      if (
        !captureData.purchase_units ||
        captureData.purchase_units.length === 0
      ) {
        throw new Error("No purchase units found in capture response");
      }
      
      // Access the first purchase unit.
      const purchaseUnit = captureData.purchase_units[0];
      
      // Access the first capture within payments.
      if (
        !purchaseUnit.payments ||
        !purchaseUnit.payments.captures ||
        purchaseUnit.payments.captures.length === 0
      ) {
        throw new Error("No capture information found in purchase unit");
      }
      
      const capture = purchaseUnit.payments.captures[0];
      
      // Parse the extra data that was encoded into custom_id (or customId) in the capture object.
      const customData = JSON.parse(capture.custom_id || capture.customId);
      console.log("customData", customData);

      // Use capture.amount.value (instead of purchaseUnit.amount.value) for the total amount.
      await Order.create({
        paypalId: orderId,
        eventId: customData.eventId,
        eventTitle: customData.eventTitle,
        isFree: customData.isFree,
        price: customData.price,
        buyerId: customData.buyerId,
        totalAmount: capture.amount.value, // <-- Updated here
        tickets: customData.tickets,
        dietaryRestriction: customData.dietaryRestriction,
        createdAt: new Date()
      });
    }
    
    return NextResponse.json(captureData);
  } catch (error: any) {
    console.error("Failed to capture order:", error);
    return NextResponse.json(
      {
        details: [
          {
            issue: "CAPTURE_FAILED",
            description: error.message,
          },
        ],
        debug_id: Date.now().toString()
      },
      { status: 500 }
    );
  }
}

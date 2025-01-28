// app/api/orders/[orderId]/capture/route.ts
import { NextResponse } from "next/server";
import { Client, Environment } from "@paypal/paypal-server-sdk";
import { connectToDatabase } from "@/lib/database";
import Order from "@/lib/database/models/order.model";

const client = new Client({
  clientCredentials: {
    clientId: process.env.PAYPAL_CLIENT_ID!,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  environment: Environment.SANDBOX
});

  // app/api/orders/[orderId]/capture/route.ts
  export async function POST(
    req: Request,
    { params }: { params: { orderId: string } }
  ) {
    try {
      await connectToDatabase();
      
      const orderId = params.orderId;

      
      const { body } = await ordersController.ordersCapture(orderId);
      const captureData = JSON.parse(body);
  
      if (captureData.status === 'COMPLETED') {
        const purchaseUnit = captureData.purchase_units[0];
        const customData = JSON.parse(purchaseUnit.custom_data);
  
        // Now create the order in MongoDB
        await Order.create({
          paypalId: orderId,
          eventId: customData.eventId,
          buyerId: customData.buyerId,
          totalAmount: purchaseUnit.amount.value,
          tickets: customData.tickets,
          dietaryRestriction: customData.dietaryRestriction,
          createdAt: new Date()
        });
    }
     
     
  
      return NextResponse.json(captureData);
    } catch (error) {
      console.error("Failed to capture order:", error);
      return NextResponse.json({
        details: [{
          issue: "CAPTURE_FAILED",
          description: error.message
        }],
        debug_id: Date.now().toString()
      }, { status: 500 });
    }
  }
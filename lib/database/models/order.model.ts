import { Schema, model, models, Document } from "mongoose";

export interface IOrder extends Document {
  createdAt: Date;
  paypalId: string;
  totalAmount: string;
  event: {
    _id: string;
    title: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  tickets: {
    gender: "male" | "female"; // Gender of the ticket holder
    dietaryRestriction?: string; // Optional dietary restriction for the ticket
  }[];
}

const OrderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paypalId: {
    type: String,
    required: true,
    unique: true,
  },
  totalAmount: {
    type: String,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  tickets: [
    {
      gender: { type: String, enum: ["male", "female"], required: true },
      dietaryRestriction: { type: String }, // Add this field
    },
  ],
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;
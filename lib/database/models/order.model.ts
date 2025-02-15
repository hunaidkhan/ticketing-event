import { Schema, model, models, Document } from "mongoose";

export interface IOrder extends Document {
  createdAt: Date;
  paypalId: string;
  totalAmount: string;
  // New fields:
  eventTitle: string;
  isFree: boolean;
  price: string;
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
    gender: "male" | "female";
    dietaryRestriction?: string;
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
  // Add the new fields here:
  eventTitle: {
    type: String,
  },
  isFree: {
    type: Boolean,
  },
  price: {
    type: String,
  },
  eventId: {
    type: String,
  },
  buyerId: {
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
      dietaryRestriction: { type: String },
    },
  ],
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;

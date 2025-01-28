"use client";
import React, { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { IEvent } from "@/lib/database/models/event.model";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  const [maleTickets, setMaleTickets] = useState(0);
  const [femaleTickets, setFemaleTickets] = useState(0);
  const [dietaryRestriction, setDietaryRestriction] = useState("");
  const [message, setMessage] = useState("");

  const MAX_TICKETS = 10;

  const validateTickets = useCallback(() => {
    const totalTickets = maleTickets + femaleTickets;
    
    // if (totalTickets === 0) {
    //   alert("Please select at least one ticket.");
    //   throw new Error("No tickets selected.");
    // }

    // if (totalTickets > MAX_TICKETS) {
    //   alert(`You cannot purchase more than ${MAX_TICKETS} tickets.`);
    //   throw new Error("Ticket limit exceeded.");
    // }

    return totalTickets;
  }, [maleTickets, femaleTickets]); // Add dependencies here

  const initialOptions = {
    "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    "enable-funding": "venmo",
    "disable-funding": "",
    "buyer-country": "CA",
    currency: "CAD",
    "data-page-type": "product-details",
    components: "buttons",
    "data-sdk-integration-source": "developer-studio",
  };

  const handleMaleTicketsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setMaleTickets(value);
  };

  const handleFemaleTicketsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setFemaleTickets(value);
  };

  return (
    <>
      <div>
        <div className="flex flex-col gap-4">
          {/* Brother Tickets Dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="maleTickets">Number of Brother Tickets</label>
            <select
              id="maleTickets"
              value={maleTickets}
              onChange={handleMaleTicketsChange}
              className="input-field2"
            >
              <option value="0">0</option>
              {[...Array(MAX_TICKETS + 1).keys()].slice(1).map((val) => (
                <option key={`male-${val}`} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          {/* Sister Tickets Dropdown */}
          <div className="flex flex-col gap-2 font-bold">
            <label htmlFor="femaleTickets">Number of Sister Tickets</label>
            <select
              id="femaleTickets"
              value={femaleTickets}
              onChange={handleFemaleTicketsChange}
              className="input-field2 bg-white"
            >
              <option value="0">0</option>
              {[...Array(MAX_TICKETS + 1).keys()].slice(1).map((val) => (
                <option key={`female-${val}`} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Restrictions */}
          <div className="flex flex-col gap-2">
            <label htmlFor="dietaryRestriction">Dietary Restrictions</label>
            <textarea
              id="dietaryRestriction"
              value={dietaryRestriction}
              onChange={(e) => setDietaryRestriction(e.target.value)}
              className="input-field"
              placeholder="E.g., No nuts, Halal only"
            />
          </div>

          {/* Display total tickets for debugging */}
          <div className="text-sm text-gray-600">
            Total Tickets Selected: {maleTickets + femaleTickets}
          </div>
        </div>
      </div>

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          }}
          createOrder={async () => {
            try {
              const totalTickets = validateTickets();
              const totalAmount = event.isFree
                ? 0
                : parseFloat(event.price) * totalTickets;

              const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  paypalId: null,
                  eventId: event._id,
                  buyerId: userId,
                  totalAmount: totalAmount.toString(),
                  createdAt: new Date(),
                  tickets: [
                    ...Array(maleTickets).fill({ gender: "male" }),
                    ...Array(femaleTickets).fill({ gender: "female" }),
                   
                  ],
                  dietaryRestriction: dietaryRestriction || undefined,
                }),
              });

              //console log the values of response.body as object
              console.log("HIGHIHIHI")
             //consoler log the vlaues of tickets in response.body as object
              console.log(response.body.createdAt)

              const orderData = await response.json();

              if (orderData.id) {
                return orderData.id;
              } else {
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                  ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                  : JSON.stringify(orderData);

                throw new Error(errorMessage);
              }
            } catch (error) {
              console.error(error);
              setMessage(`Could not initiate PayPal Checkout...${error}`);
              throw error; // Re-throw to prevent PayPal from proceeding
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const response = await fetch(`/api/orders/${data.orderID}/capture`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              const orderData = await response.json();
              const errorDetail = orderData?.details?.[0];

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
              } else if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
              } else {
                const transaction = orderData.purchase_units[0].payments.captures[0];
                setMessage(`Transaction ${transaction.status}: ${transaction.id}`);
                console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
              }
            } catch (error) {
              console.error(error);
              setMessage(`Sorry, your transaction could not be processed...${error}`);
            }
          }}
        />
      </PayPalScriptProvider>

      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {message}
        </div>
      )}
    </>
  );
};

export default Checkout;
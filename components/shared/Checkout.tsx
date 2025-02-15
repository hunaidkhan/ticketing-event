"use client";
import React, { useState, useCallback } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { IEvent } from "@/lib/database/models/event.model"; // adjust the path as needed

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  const [maleTickets, setMaleTickets] = useState(0);
  const [femaleTickets, setFemaleTickets] = useState(0);
  const [dietaryRestriction, setDietaryRestriction] = useState("");
  const [message, setMessage] = useState("");

  const MAX_TICKETS = 10;

  const validateTickets = useCallback(() => {
    const totalTickets = maleTickets + femaleTickets;
    if (totalTickets === 0) {
      alert("Please select at least one ticket.");
      throw new Error("No tickets selected.");
    }
    if (totalTickets > MAX_TICKETS) {
      alert(`You cannot purchase more than ${MAX_TICKETS} tickets.`);
      throw new Error("Ticket limit exceeded.");
    }
    return totalTickets;
  }, [maleTickets, femaleTickets]);
  console.log(process.env.PAYPAL_CLIENT_ID);
  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    "enable-funding": "venmo",
    "disable-funding": "",
    "buyer-country": "CA",
    currency: "CAD",
    "data-page-type": "product-details",
    components: "buttons",
    "data-sdk-integration-source": "developer-studio",
  };

  const handleMaleTicketsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaleTickets(Number(e.target.value));
  };

  const handleFemaleTicketsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFemaleTickets(Number(e.target.value));
  };

  return (
    <>
      <div className="mb-6">
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
              {[...Array(MAX_TICKETS + 1).keys()]
                .slice(1)
                .map((val) => (
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
              {[...Array(MAX_TICKETS + 1).keys()]
                .slice(1)
                .map((val) => (
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

          {/* Display total tickets */}
          <div className="text-sm text-gray-600">
            Total Tickets Selected: {maleTickets + femaleTickets}
          </div>
        </div>
      </div>

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          // Force re-render of the PayPal buttons whenever these values change.
          forceReRender={[maleTickets, femaleTickets, event.title, event.price, event.isFree, event.price, event.isFree, dietaryRestriction]}
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          }}
          createOrder={async () => {
            try {
              const totalTickets = validateTickets();
              const ticketPrice = parseFloat(event.price);
              const totalAmount = event.isFree
                ? 0
                : ticketPrice * totalTickets;

              console.log("Total tickets:", totalTickets);
              console.log("Event price:", ticketPrice);
              console.log("Total amount:", totalAmount);

              if (event.isFree) {
                alert(
                  "This event is free. Please use our free registration flow instead of PayPal."
                );
                throw new Error("Free event - bypassing PayPal");
              }

              if (totalAmount <= 0) {
                throw new Error("Total amount must be greater than 0");
              }

              const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  eventId: event._id,
                  eventTitle: event.title,
                  isFree: event.isFree,
                  price: event.price,
                  buyerId: userId,
                  totalAmount: totalAmount.toString(),
                  tickets: [
                    ...Array(maleTickets).fill({ gender: "male" }),
                    ...Array(femaleTickets).fill({ gender: "female" }),
                  ],
                  dietaryRestriction: dietaryRestriction || "",
                }),
              });

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
            } catch (error: any) {
              console.error(error);
              setMessage(`Could not initiate PayPal Checkout... ${error.message}`);
              throw error;
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const response = await fetch(`/api/orders/${data.orderID}/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            } catch (error: any) {
              console.error(error);
              setMessage(`Sorry, your transaction could not be processed... ${error.message}`);
            }
          }}
        />
      </PayPalScriptProvider>

      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">{message}</div>
      )}
    </>
  );
};

export default Checkout;

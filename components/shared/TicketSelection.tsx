'use client'

import { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export type TicketDetails = {
  gender: 'male' | 'female';
  dietaryRestriction?: string;
};

type TicketSelectionProps = {
  onTicketsChange: (tickets: TicketDetails[]) => void;
  maxTickets: number;
};

const TicketSelection = ({ onTicketsChange, maxTickets }: TicketSelectionProps) => {
  const [numTickets, setNumTickets] = useState<number>(1);
  const [tickets, setTickets] = useState<TicketDetails[]>([{ gender: 'male' }]);

  const handleTicketChange = (index: number, field: keyof TicketDetails, value: string) => {
    const updatedTickets = [...tickets];
    updatedTickets[index] = {
      ...updatedTickets[index],
      [field]: value,
    };
    setTickets(updatedTickets);
    onTicketsChange(updatedTickets);
  };

  const handleNumTicketsChange = (value: number) => {
    const newValue = Math.min(Math.max(1, value), maxTickets);
    setNumTickets(newValue);
    
    const updatedTickets = Array(newValue).fill(null).map((_, i) => 
      tickets[i] || { gender: 'male' }
    );
    setTickets(updatedTickets);
    onTicketsChange(updatedTickets);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Number of Tickets</label>
        <Input 
          type="number" 
          min={1} 
          max={maxTickets}
          value={numTickets}
          onChange={(e) => handleNumTicketsChange(parseInt(e.target.value))}
        />
      </div>

      {tickets.map((ticket, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <h3 className="font-medium">Ticket {index + 1}</h3>
          
          <div>
            <label className="block text-sm mb-1">Gender</label>
            <Select
              value={ticket.gender}
              onValueChange={(value) => handleTicketChange(index, 'gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-1">Dietary Restrictions (Optional)</label>
            <Input
              placeholder="e.g., Vegetarian, Vegan, Gluten-free"
              value={ticket.dietaryRestriction || ''}
              onChange={(e) => handleTicketChange(index, 'dietaryRestriction', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketSelection;
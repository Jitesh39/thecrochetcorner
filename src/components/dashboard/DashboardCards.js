"use client";

import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Heart 
} from "lucide-react";

const cardData = [
  { label: "Total Orders", value: "0", icon: ShoppingBag, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
  { label: "Pending Orders", value: "0", icon: Clock, color: "bg-orange-50 text-orange-600", border: "border-orange-100" },
  { label: "Completed Orders", value: "0", icon: CheckCircle, color: "bg-green-50 text-green-600", border: "border-green-100" },
  { label: "Wishlist Items", value: "0", icon: Heart, color: "bg-pink-50 text-pink-600", border: "border-pink-100" },
];

export default function DashboardCards({ stats }) {
  // Use provided stats or default to placeholder data
  const data = cardData.map(card => ({
    ...card,
    value: stats?.[card.label] || card.value
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index} 
            className={`bg-white p-6 rounded-2xl shadow-sm border ${card.border} transition-all duration-300 hover:shadow-md hover:-translate-y-1 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color} transition-all duration-300 group-hover:scale-110`}>
                <Icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

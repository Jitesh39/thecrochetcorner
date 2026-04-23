"use client";

import {
  Package,
  ShoppingBag,
  Clock,
  IndianRupee
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardCards({ stats }) {
  const router = useRouter();

  const displayStats = [
    { label: "Total Products", value: stats?.totalProducts || "0", icon: Package, color: "bg-blue-50 text-blue-600", border: "border-blue-100", path: "/admin/products" },
    { label: "Total Orders", value: stats?.totalOrders || "0", icon: ShoppingBag, color: "bg-green-50 text-green-600", border: "border-green-100", path: "/admin/orders" },
    { label: "Pending Orders", value: stats?.pendingOrders || "0", icon: Clock, color: "bg-orange-50 text-orange-600", border: "border-orange-100", path: "/admin/pending" },
    { label: "Revenue", value: `₹${(stats?.revenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-purple-50 text-purple-600", border: "border-purple-100", path: "/admin/orders" },
    { label: "Custom Orders", value: stats?.customOrders || "0", icon: ShoppingBag, color: "bg-pink-50 text-pink-600", border: "border-pink-100", path: "/admin/custom-orders" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {displayStats.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            onClick={() => card.path && router.push(card.path)}
            className={`bg-white p-6 rounded-2xl shadow-sm border ${card.border} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer hover:bg-gray-50/30 group active:scale-95`}
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

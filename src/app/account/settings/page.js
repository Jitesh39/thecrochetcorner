"use client";

import { Settings, Bell, Palette, Globe, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const options = [
    { title: "Notification Settings", desc: "Manage how you receive alerts and updates.", icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Appearance", desc: "Customize your visual experience and themes.", icon: Palette, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Language & Region", desc: "Set your preferred language and location.", icon: Globe, color: "text-green-500", bg: "bg-green-50" },
    { title: "Privacy & Security", desc: "Control your account privacy and data permissions.", icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-400 font-medium">Fine-tune your preferences for The Crochet Corner.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {options.map((opt, i) => {
           const Icon = opt.icon;
           return (
             <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer group">
                <div className={`p-4 ${opt.bg} ${opt.color} rounded-x2l group-hover:scale-110 transition-transform`}>
                   <Icon size={24} />
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-gray-800 mb-1">{opt.title}</h3>
                   <p className="text-xs text-gray-500 leading-relaxed font-medium">{opt.desc}</p>
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );
}

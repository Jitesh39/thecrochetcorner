"use client";

import { useState } from "react";
import HeroSettings from "@/components/admin/HeroSettings";
import CustomOrderSettings from "@/components/admin/CustomOrderSettings";
import OurPromiseSettings from "@/components/admin/OurPromiseSettings";
import HappyCustomersSettings from "@/components/admin/HappyCustomersSettings";
import ContactSettings from "@/components/admin/ContactSettings";
import { Settings as SettingsIcon, ChevronDown } from "lucide-react";

const sections = [
  { id: "hero", name: "Hero Section", description: "Manage homepage banner images and text." },
  { id: "custom", name: "Custom Order Images", description: "Manage images for the custom design section." },
  { id: "promise", name: "Our Promise", description: "Manage the quality assurance feature image." },
  { id: "feedback", name: "Happy Customers", description: "Manage customer reviews and feedback." },
  { id: "contact", name: "Contact Settings", description: "Manage email, phone, and store address." },
];

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedData = sections.find(s => s.id === activeSection);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Dynamic Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <SettingsIcon size={14} />
            Site Configuration
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            {selectedData.name}
          </h1>
          <p className="text-sm text-gray-400 font-medium">{selectedData.description}</p>
        </div>

        {/* Section Selector Dropdown */}
        <div className="relative min-w-[240px]">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all group active:scale-95"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
              Select Section
            </span>
            <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-3 right-0 w-full bg-white border border-gray-50 rounded-2xl shadow-2xl z-[100] py-2 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-4 text-sm font-medium transition-all flex flex-col gap-0.5 ${
                    activeSection === section.id 
                      ? "bg-[var(--color-secondary)]/50 text-[var(--color-primary)] border-l-4 border-[var(--color-primary)]" 
                      : "text-gray-600 hover:bg-gray-50 hover:pl-7"
                  }`}
                >
                  <span className="font-bold">{section.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Content Rendering */}
      <div className="relative">
        {activeSection === "hero" && <HeroSettings />}
        {activeSection === "custom" && <CustomOrderSettings />}
        {activeSection === "promise" && <OurPromiseSettings />}
        {activeSection === "feedback" && <HappyCustomersSettings />}
        {activeSection === "contact" && <ContactSettings />}
      </div>
    </div>
  );
}

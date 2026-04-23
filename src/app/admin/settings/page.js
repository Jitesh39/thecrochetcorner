"use client";

import { useState } from "react";
import HeroSettings from "@/components/admin/HeroSettings";
import CustomOrderSettings from "@/components/admin/CustomOrderSettings";
import OurPromiseSettings from "@/components/admin/OurPromiseSettings";
import HappyCustomersSettings from "@/components/admin/HappyCustomersSettings";
import ContactSettings from "@/components/admin/ContactSettings";
import CategoriesSettings from "@/components/admin/CategoriesSettings";
import AboutSettings from "@/components/admin/AboutSettings";
import AdminProfileSettings from "@/components/admin/AdminProfileSettings";
import CustomPricingSettings from "@/components/admin/CustomPricingSettings";
import { Settings as SettingsIcon, ChevronDown, User, IndianRupee } from "lucide-react";

const sections = [
  { id: "hero", name: "Hero Section", description: "Manage homepage banner images and text." },
  { id: "custom", name: "Custom Order Images", description: "Manage images for the custom design section." },
  { id: "promise", name: "Our Promise", description: "Manage the quality assurance feature image." },
  { id: "feedback", name: "Happy Customers", description: "Manage customer reviews and feedback." },
  { id: "contact", name: "Contact Settings", description: "Manage email, phone, and store address." },
  { id: "categories", name: "Categories Management", description: "Manage product categories." },
  { id: "about", name: "About Section", description: "Manage about page story image." },
  { id: "pricing", name: "Custom Order Pricing", description: "Manage pricing for personalized crochet requests." },
];

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedData = sections.find(s => s.id === activeSection);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (!isProfileOpen) {
      setActiveSection(null);
      setIsPricingOpen(false);
    }
  };

  const togglePricing = () => {
    setIsPricingOpen(!isPricingOpen);
    if (!isPricingOpen) {
      setActiveSection(null);
      setIsProfileOpen(false);
    }
  };

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setIsProfileOpen(false);
    setIsPricingOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Profile Settings Section (Collapsible) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
        <button
          onClick={toggleProfile}
          className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 hover:bg-gray-50/50 transition-all group"
        >
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <User size={14} />
              Personal Account
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Profile Settings</h1>
            <p className="text-sm text-gray-400 font-medium">Manage your name, contact info, and profile photo.</p>
          </div>
          <div className={`p-4 rounded-2xl bg-gray-50 text-gray-400 transition-all group-hover:scale-110 ${isProfileOpen ? "rotate-180 bg-[var(--color-secondary)] text-[var(--color-primary)]" : ""}`}>
            <ChevronDown size={20} />
          </div>
        </button>

        {isProfileOpen && (
          <div className="p-6 pt-0 animate-in slide-in-from-top-4 duration-500">
            <div className="h-px bg-gray-50 mb-8"></div>
            <AdminProfileSettings />
          </div>
        )}
      </div>

      {/* Custom Pricing Section (Collapsible) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
        <button
          onClick={togglePricing}
          className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 hover:bg-gray-50/50 transition-all group"
        >
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <IndianRupee size={14} />
              Revenue Control
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Custom Order Pricing</h1>
            <p className="text-sm text-gray-400 font-medium">Manage base prices, size modifiers, and color premiums.</p>
          </div>
          <div className={`p-4 rounded-2xl bg-gray-50 text-gray-400 transition-all group-hover:scale-110 ${isPricingOpen ? "rotate-180 bg-[var(--color-secondary)] text-[var(--color-primary)]" : ""}`}>
            <ChevronDown size={20} />
          </div>
        </button>

        {isPricingOpen && (
          <div className="p-6 pt-0 animate-in slide-in-from-top-4 duration-500">
            <div className="h-px bg-gray-50 mb-8"></div>
            <CustomPricingSettings />
          </div>
        )}
      </div>

      {/* Site Configuration Box */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <SettingsIcon size={14} />
              Site Configuration
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {selectedData ? selectedData.name : "Select Section"}
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              {selectedData ? selectedData.description : "Please select a section to manage its settings."}
            </p>
          </div>

          {/* Section Selector Dropdown */}
          <div className="relative min-w-[240px]">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all group active:scale-95"
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeSection ? "bg-green-500" : "bg-[var(--color-primary)]"} animate-pulse`}></span>
                {activeSection ? "Change Section" : "Select Section"}
              </span>
              <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-3 right-0 w-full bg-white border border-gray-50 rounded-2xl shadow-2xl z-[100] py-2 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionSelect(section.id)}
                    className={`w-full text-left px-5 py-4 text-sm font-medium transition-all flex flex-col gap-0.5 ${activeSection === section.id
                      ? "bg-[var(--color-secondary)]/50 text-[var(--color-primary)] border-l-4 border-[var(--color-primary)]"
                      : "text-gray-600 hover:bg-gray-50 hover:pl-7"
                      }`}
                  >
                    <span className="font-bold">{section.name}</span>
                  </button>
                ))}
                {activeSection && (
                  <button
                    onClick={() => {
                      setActiveSection(null);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-4 text-xs font-bold text-red-500 hover:bg-red-50 transition-all border-t border-gray-50 uppercase tracking-widest"
                  >
                    Close Current Section
                  </button>
                )}
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
          {activeSection === "categories" && <CategoriesSettings />}
          {activeSection === "about" && <AboutSettings />}
        </div>
      </div>
    </div>
  );
}

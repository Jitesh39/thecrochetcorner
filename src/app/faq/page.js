"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Package, Truck, CreditCard, RefreshCcw, User } from "lucide-react";

const faqData = [
  {
    title: "Product & Custom Orders",
    icon: <Package className="text-pink-500" size={20} />,
    items: [
      {
        q: "Are all products handmade?",
        a: "Yes, all our products are 100% handmade with love and care using high-quality yarn."
      },
      {
        q: "Can I request a custom crochet item?",
        a: "Yes! You can use our Custom Order section to personalize your product (color, size, design, etc.)."
      },
      {
        q: "How long does it take to make a custom order?",
        a: "Custom orders usually take 2–5 days depending on complexity."
      },
      {
        q: "Will my product look exactly like the picture?",
        a: "Since all items are handmade, slight variations may occur, making each piece unique."
      }
    ]
  },
  {
    title: "Shipping & Delivery",
    icon: <Truck className="text-blue-500" size={20} />,
    items: [
      {
        q: "What are the delivery charges?",
        a: "Delivery charges depend on your location and will be shown at checkout."
      },
      {
        q: "How long does delivery take?",
        a: "Delivery usually takes 3–7 working days after dispatch."
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your order is shipped, you will receive a tracking link."
      }
    ]
  },
  {
    title: "Payments",
    icon: <CreditCard className="text-green-500" size={20} />,
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, Debit/Credit Cards, and Net Banking."
      },
      {
        q: "Is Cash on Delivery (COD) available?",
        a: "COD may be available in selected locations."
      }
    ]
  },
  {
    title: "Returns & Refunds",
    icon: <RefreshCcw className="text-orange-500" size={20} />,
    items: [
      {
        q: "Do you accept returns?",
        a: "Since products are handmade, returns are only accepted in case of damage or defects."
      },
      {
        q: "What if I receive a damaged product?",
        a: "Please contact us within 24 hours with photos, and we’ll resolve it quickly."
      }
    ]
  },
  {
    title: "Account & Orders",
    icon: <User className="text-purple-500" size={20} />,
    items: [
      {
        q: "How can I check my order status?",
        a: "Go to My Account → Orders to track your order."
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be canceled before they are shipped."
      },
      {
        q: "Do you offer bulk orders or gifting?",
        a: "Yes, we accept bulk and gifting orders. Contact us for special pricing."
      },
      {
        q: "How can I contact you?",
        a: "You can contact us via email, our website contact form, or simply send us a message on Instagram—we’d love to help!"
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaq = faqData.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-4"
          >
            <HelpCircle size={16} className="text-[var(--color-primary)]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Help Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Frequently Asked Questions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to know about our products and services. Can't find the answer you're looking for? Feel free to contact our support team.
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-gray-700"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-10">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((section, sIndex) => (
              <div key={sIndex}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-gray-800">{section.title}</h2>
                </div>

                <div className="space-y-3">
                  {section.items.map((item, i) => {
                    const index = `${sIndex}-${i}`;
                    const isOpen = openIndex === index;

                    return (
                      <motion.div
                        key={index}
                        layout
                        className={`bg-white border rounded-2xl transition-all duration-300 ${isOpen ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/5' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          className="w-full flex justify-between items-center px-6 py-5 text-left transition-colors"
                        >
                          <span className={`font-bold text-sm md:text-base ${isOpen ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                            {item.q}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className={`${isOpen ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}
                          >
                            <ChevronDown size={20} />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-5 pt-0 border-t border-gray-50 mt-1">
                                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                                  {item.a}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-400 text-sm">We couldn't find any answers matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 text-[var(--color-primary)] font-bold text-sm hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Footer Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center"
        >
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Still have questions?</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Can't find the answer you're looking for? Our friendly team is here to help you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@thecrochetcorner.com" className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all">
              Email Us
            </a>
            <a href="/contact" className="px-8 py-3 bg-gray-50 text-gray-700 rounded-full font-bold border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
              Contact Form
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

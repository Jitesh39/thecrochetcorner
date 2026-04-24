"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function ContactPage() {
  const [status, setStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
  const [contactInfo, setContactInfo] = useState({
    email: "thecrochetcorner@gmail.com",
    phone: "+91 9867453627",
    address: "Uttarpradesh, India",
    instagram: "thecrochetcorner"
  });
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "contact"), (docSnap) => {
      if (docSnap.exists()) {
        setContactInfo(docSnap.data());
      }
      setInfoLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://formspree.io/f/mvzdkjlq", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        e.target.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[var(--color-secondary)] py-10 sm:py-12 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-[var(--color-text-main)] mb-4 sm:mb-6"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            Have a question? We're here to help! Whether you're curious about a custom order or need help with a purchase, we'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-10 sm:py-12 lg:py-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 sm:gap-16 lg:gap-32">
          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3 order-last lg:order-first"
          >
            <h2 className="text-3xl font-serif text-[var(--color-text-main)] mb-6 sm:mb-10">Get in Touch</h2>
            <div className="space-y-4 sm:space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-secondary)] p-3 rounded-2xl text-[var(--color-primary)]">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-1 uppercase text-xs tracking-widest">Email</h3>
                  {infoLoading ? <div className="h-4 w-48 bg-gray-100 animate-pulse rounded"></div> : <p className="text-[var(--color-text-muted)]">{contactInfo.email}</p>}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-secondary)] p-3 rounded-2xl text-[var(--color-primary)]">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-1 uppercase text-xs tracking-widest">Phone</h3>
                  {infoLoading ? <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div> : <p className="text-[var(--color-text-muted)]">{contactInfo.phone}</p>}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-secondary)] p-3 rounded-2xl text-[var(--color-primary)]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-1 uppercase text-xs tracking-widest">Location</h3>
                  {infoLoading ? <div className="h-12 w-48 bg-gray-100 animate-pulse rounded"></div> : <p className="text-[var(--color-text-muted)] whitespace-pre-wrap">{contactInfo.address}</p>}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-6 uppercase text-xs tracking-widest">Connect With Us</h3>
              <div className="flex gap-4">
                <a
                  href={contactInfo.instagram?.startsWith('http') ? contactInfo.instagram : `https://instagram.com/${contactInfo.instagram?.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 text-[var(--color-text-muted)] rounded-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300"
                >
                  <Instagram size={22} />
                </a>
                <a href="#" className="p-3 bg-gray-50 text-[var(--color-text-muted)] rounded-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300">
                  <Facebook size={22} />
                </a>
                <a href="#" className="p-3 bg-gray-50 text-[var(--color-text-muted)] rounded-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300">
                  <Twitter size={22} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-2/3 bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 flex flex-col min-h-[500px]"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center h-full py-20"
                >
                  <div className="bg-green-50 p-6 rounded-full text-green-500 mb-6">
                    <CheckCircle2 size={64} />
                  </div>
                  <h3 className="text-3xl font-serif text-[var(--color-text-main)] mb-4">Message Sent!</h3>
                  <p className="text-[var(--color-text-muted)] max-w-sm mb-8 leading-relaxed">
                    Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-primary px-8 py-3 rounded-xl"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                      <input
                        required
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        required
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@gmail.com"
                        className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Custom Order">Custom Order</option>
                      <option value="Order Support">Order Support</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      required
                      id="message"
                      name="message"
                      rows="4"
                      placeholder="How can we help you?"
                      className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`btn-primary w-full sm:w-auto px-12 py-4 flex justify-center items-center gap-2 group transition-opacity ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                    {status !== 'loading' && <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </button>

                  {status === 'error' && (
                    <p className="text-red-500 text-sm mt-4">Something went wrong. Please try again later.</p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

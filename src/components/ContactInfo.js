"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Mail, Instagram } from "lucide-react";

export default function ContactInfo({ title = "Need Help?" }) {
  const [contact, setContact] = useState({
    email: "hello@thecrochetcorner.com",
    instagram: "https://www.instagram.com/"
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "contact"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContact({
          email: data.email || "hello@thecrochetcorner.com",
          instagram: data.instagram || "https://www.instagram.com/"
        });
      }
    });
    return () => unsub();
  }, []);

  return (
    <section className="pt-10 border-t border-gray-100 mt-10">
      <h3 className="font-bold text-gray-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">If you have any questions, please reach out to us:</p>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[var(--color-primary)]">
            <Mail size={16} />
          </div>
          <span className="font-medium text-gray-700">{contact.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[var(--color-primary)]">
            <Instagram size={16} />
          </div>
          <a 
            href={contact.instagram.startsWith('http') ? contact.instagram : `https://instagram.com/${contact.instagram.replace('@', '')}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors"
          >
            {contact.instagram.includes('instagram.com') ? '@' + contact.instagram.split('/').filter(Boolean).pop() : 'Message on Instagram'}
          </a>
        </div>
      </div>
    </section>
  );
}

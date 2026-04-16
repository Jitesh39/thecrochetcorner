import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[var(--color-secondary)] py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-[var(--color-text-main)] mb-6">Contact Us</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
            Have a question? We're here to help! Whether you're curious about a custom order or need help with a purchase, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-32">
          {/* Info Section */}
          <div className="w-full lg:w-1/3 order-last lg:order-first">
            <h2 className="text-3xl font-serif text-[var(--color-text-main)] mb-10">Get in Touch</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-secondary)] p-3 rounded-2xl text-[var(--color-primary)]">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-1 uppercase text-xs tracking-widest">Email</h3>
                  <p className="text-[var(--color-text-muted)]">hello@thecrochetcorner.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-secondary)] p-3 rounded-2xl text-[var(--color-primary)]">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-1 uppercase text-xs tracking-widest">Phone</h3>
                  <p className="text-[var(--color-text-muted)]">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-secondary)] p-3 rounded-2xl text-[var(--color-primary)]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-1 uppercase text-xs tracking-widest">Location</h3>
                  <p className="text-[var(--color-text-muted)]">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-16 border-t border-gray-100">
              <h3 className="font-serif text-lg font-bold text-[var(--color-text-main)] mb-6 uppercase text-xs tracking-widest">Follow Our Journey</h3>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-gray-50 text-[var(--color-text-muted)] rounded-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300">
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
          </div>

          {/* Form Section */}
          <div className="w-full lg:w-2/3 bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 flex flex-col">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input required type="text" placeholder="Jane Doe" className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input required type="email" placeholder="jane@example.com" className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all">
                  <option>General Inquiry</option>
                  <option>Custom Commission</option>
                  <option>Order Support</option>
                  <option>Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea required rows="4" placeholder="How can we help you?" className="w-full border-b border-gray-200 py-3 focus:border-[var(--color-primary)] outline-none bg-transparent transition-all resize-none"></textarea>
              </div>

              <button type="submit" className="btn-primary w-full sm:w-auto px-12 py-4 flex justify-center items-center gap-2 group">
                Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Placeholder Section */}
      <section className="h-[400px] w-full bg-gray-100 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-400 font-serif italic text-xl">Interactive Map Coming Soon...</p>
        </div>
      </section>
    </div>
  );
}

import { User, ShoppingCart, Palette, AlertTriangle, Shield } from "lucide-react";
import ContactInfo from "@/components/ContactInfo";

export default function TermsConditionsPage() {

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 2024</p>

        <div className="space-y-12 text-gray-700 leading-relaxed">
          {/* Account Responsibility */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Account Responsibility</h2>
            </div>
            <p className="text-gray-600">
              When you create an account with us, you are responsible for maintaining the confidentiality of your account details and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          {/* Orders & Pricing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Orders & Pricing</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>We reserve the right to cancel orders if we detect suspicious activity or incorrect pricing.</li>
              <li>Product prices are subject to change without prior notice.</li>
              <li>Availability of products is not guaranteed and is subject to stock levels.</li>
            </ul>
          </section>

          {/* Product Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                <Palette size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Product Disclaimer</h2>
            </div>
            <p className="text-gray-600">
              Since our products are 100% handmade, slight variations in color, size, and design are possible. These are not defects but a characteristic of the artisanal process that makes each piece unique.
            </p>
          </section>

          {/* Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Liability</h2>
            </div>
            <p className="text-gray-600">
              The Crochet Corner is not responsible for delays caused by courier services, weather conditions, or other factors outside of our direct control.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Intellectual Property</h2>
            </div>
            <p className="text-gray-600">
              All content on this website, including images, designs, and text, is the property of The Crochet Corner and cannot be copied or used without our explicit permission.
            </p>
          </section>
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}

import { Database, Target, Lock, Share2, Cookie } from "lucide-react";
import ContactInfo from "@/components/ContactInfo";

export default function PrivacyPolicyPage() {

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 2024</p>

        <div className="space-y-12 text-gray-700 leading-relaxed">
          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Database size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Information We Collect</h2>
            </div>
            <p className="text-gray-600">
              We collect essential information to process your orders and provide a personalized experience, including your name, email address, phone number, and shipping address.
            </p>
          </section>

          {/* How We Use Data */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Target size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">How We Use Data</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>To process and fulfill your orders accurately.</li>
              <li>To provide efficient customer support and respond to inquiries.</li>
              <li>To improve our services and website user experience.</li>
              <li>To send order updates and promotional offers (if opted in).</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Data Protection</h2>
            </div>
            <p className="text-gray-600">
              Your data is stored securely and protected using industry-standard encryption methods. We take all reasonable precautions to prevent unauthorized access or disclosure of your personal information.
            </p>
          </section>

          {/* No Data Selling */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Share2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">No Data Selling</h2>
            </div>
            <p className="text-gray-600">
              We value your privacy. We do **NOT** sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <Cookie size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Cookies</h2>
            </div>
            <p className="text-gray-600">
              We use cookies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can choose to disable cookies in your browser settings if you prefer.
            </p>
          </section>
          <ContactInfo title="Privacy Concerns?" />
        </div>
      </div>
    </div>
  );
}

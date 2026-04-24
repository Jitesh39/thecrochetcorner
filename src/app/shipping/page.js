import { Truck, RefreshCcw, XCircle } from "lucide-react";
import ContactInfo from "@/components/ContactInfo";

export default function ShippingPage() {

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Shipping & Returns</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 2024</p>

        <div className="space-y-12 text-gray-700 leading-relaxed">
          {/* Shipping Policy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Truck size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Shipping Policy</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Orders are processed within 1–3 working days from the date of order.</li>
              <li>Standard delivery takes 5-7 working days depending on your location.</li>
              <li>Shipping charges are calculated and displayed at the time of checkout.</li>
              <li>A tracking link will be provided via email/SMS after your order is dispatched.</li>
            </ul>
          </section>

          {/* Returns & Refunds */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <RefreshCcw size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Returns & Refunds</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>As our products are 100% handmade, we do not accept returns unless the item is received damaged or defective.</li>
              <li>Please report any damages within 24 hours of delivery with clear photos and videos of the product.</li>
              <li>Once approved, refunds are processed within 3–5 working days to your original payment method.</li>
            </ul>
          </section>

          {/* Cancellation */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <XCircle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Cancellation</h2>
            </div>
            <p className="text-gray-600">
              Orders can be canceled only before they are shipped. Once the order has been dispatched, cancellation is not possible.
            </p>
          </section>
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}

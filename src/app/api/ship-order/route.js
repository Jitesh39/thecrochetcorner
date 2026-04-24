import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket";

export async function POST(req) {
  try {
    const { orderId, userId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing authentication" }, { status: 401 });
    }

    // Verify Admin
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    // 1. Fetch Order Details from Firestore
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data();

    // Verify order status
    if (orderData.status !== "Accepted" && orderData.status !== "Pending") {
      return NextResponse.json({ error: "Order must be in Pending or Accepted status" }, { status: 400 });
    }
    
    // 2. Generate Shiprocket Token
    const token = await getShiprocketToken();

    // 3. Convert Order to Shiprocket Format
    // Format required by POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc
    const nameParts = orderData.customerName?.split(' ') || ['Customer'];
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

    const shiprocketOrderData = {
      order_id: orderId,
      order_date: new Date().toISOString(),
      pickup_location: "Primary", // Requires you to have 'Primary' setup in Shiprocket settings
      billing_customer_name: firstName,
      billing_last_name: lastName || firstName,
      billing_address: orderData.shippingAddress?.address || "Address unavailable",
      billing_city: orderData.shippingAddress?.city || "City unavailable",
      billing_pincode: orderData.shippingAddress?.pincode || "000000",
      billing_state: orderData.shippingAddress?.state || "State unavailable",
      billing_country: "India",
      billing_email: orderData.customerEmail,
      billing_phone: orderData.customerPhone || "0000000000",
      shipping_is_billing: true,
      order_items: orderData.items?.map(item => ({
        name: item.name,
        sku: item.productId || item.id || "SKU-01",
        units: item.quantity || 1,
        selling_price: item.price || 0,
        discount: 0,
        tax: 0,
        hsn: ""
      })) || [],
      payment_method: "Prepaid",
      sub_total: orderData.totalAmount || 0,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    // 4. Call Shiprocket API
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(shiprocketOrderData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Shiprocket create error:", data);
      return NextResponse.json({ error: data.message || "Failed to create Shiprocket shipment" }, { status: response.status });
    }

    // Extract relevant data
    const shipmentId = data.shipment_id;
    const trackingId = data.awb_code;
    const courierName = data.courier_name;

    // 5. Update Firestore
    const updateData = {
      status: "Shipped",
      shipmentId: shipmentId || null,
      trackingId: trackingId || null,
      courier: courierName || "Shiprocket Courier",
      shippedAt: new Date()
    };

    await updateDoc(orderRef, updateData);

    return NextResponse.json({ 
      success: true, 
      message: "Order successfully submitted to Shiprocket",
      trackingId,
      courierName
    });

  } catch (error) {
    console.error("API /ship-order Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

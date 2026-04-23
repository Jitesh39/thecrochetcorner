import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const payload = await req.json();

    // Verification step (optional but recommended depending on shiprocket header HMAC if provided)
    // If Shiprocket sends `x-shiprocket-signature`, we might verify it. 
    // For now we'll accept the payload directly as per basic requirements.
    
    // Shiprocket typically sends 'current_status' and 'order_id'
    const status = payload.current_status || payload.status;
    const orderId = payload.order_id;
    const awb = payload.awb;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing order_id or status in payload" }, { status: 400 });
    }

    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let updateData = {};
    const normalizedStatus = status.toUpperCase();

    // Map Shiprocket status to our platform status
    if (normalizedStatus === "SHIPPED") {
      updateData.status = "Shipped";
    } else if (normalizedStatus === "OUT FOR DELIVERY") {
      updateData.status = "Out for Delivery";
    } else if (normalizedStatus === "DELIVERED") {
      updateData.status = "Delivered";
    } else if (normalizedStatus === "RTO INITIATED" || normalizedStatus === "RTO DELIVERED") {
      updateData.status = "Returned";
    } else if (normalizedStatus === "CANCELED" || normalizedStatus === "CANCELLED") {
      updateData.status = "Cancelled";
    }

    if (Object.keys(updateData).length > 0) {
      // Add optional webhook delivery timestamp
      updateData.lastTrackingUpdate = new Date();
      await updateDoc(orderRef, updateData);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });

  } catch (error) {
    console.error("API /shiprocket-webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

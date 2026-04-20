import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const docRef = doc(db, "settings", "contact");
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json({
        email: "hello@thecrochetcorner.com",
        phone: "+91 98765 43210",
        address: "Artisan Lane, Crochet City",
        instagram: "@thecrochetcorner"
      });
    }

    return NextResponse.json(docSnap.data());
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch contact settings" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const docRef = doc(db, "settings", "contact");
    
    await setDoc(docRef, body, { merge: true });
    
    return NextResponse.json({ message: "Contact settings updated successfully", data: body });
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ error: "Failed to update contact settings" }, { status: 500 });
  }
}

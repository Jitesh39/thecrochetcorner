"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore";
import { Bell, CheckCircle, Eye, ShoppingBag, Loader2, Clock, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const notifyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifyData);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        isRead: true
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, "notifications", n.id), { isRead: true });
    });
    await batch.commit();
  };

  const handleAcceptOrder = async (notifyId, orderId) => {
    setActionId(notifyId);
    try {
      // Update Order Status
      await updateDoc(doc(db, "orders", orderId), {
        status: "Accepted"
      });
      // Mark notification as accepted and read
      await updateDoc(doc(db, "notifications", notifyId), {
        isAccepted: true,
        isRead: true
      });
      alert("Order accepted successfully!");
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Notifications</h1>
          <p className="text-sm text-gray-400 font-medium">Keep track of new orders and activity.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          Mark All as Read
        </button>
      </div>

      <div className="max-w-4xl space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={32} className="animate-spin mb-2" />
            <p>Fetching notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-100">
            <Bell size={48} className="mx-auto mb-4 opacity-10 text-gray-400" />
            <p className="text-gray-400 font-medium">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border ${notification.isRead ? "border-gray-50" : "border-blue-100 ring-1 ring-blue-50"} transition-all hover:shadow-md`}
            >
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${notification.isRead ? "bg-gray-50 text-gray-400" : "bg-blue-50 text-blue-500"}`}>
                  <ShoppingBag size={28} />
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">New Order Placed</h3>
                    {!notification.isRead && (
                      <span className="bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">New</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    <span className="text-gray-900 font-bold">{notification.customerName}</span> ({notification.customerEmail}) just placed an order.
                  </p>
                  <p className="text-xs text-gray-400 italic">
                    Items: {notification.productNames}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock size={12} /> {notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleString() : "Just now"}</span>
                    <span className="text-[var(--color-primary)]">Total: ₹{notification.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!notification.isRead && !notification.isAccepted && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                      title="Mark as Read"
                    >
                      <Eye size={20} />
                    </button>
                  )}
                  {notification.isAccepted ? (
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 border border-green-100 rounded-2xl text-xs font-bold uppercase tracking-widest">
                      <CheckCircle size={16} /> Accepted
                    </div>
                  ) : (
                    <button
                      disabled={actionId === notification.id}
                      onClick={() => handleAcceptOrder(notification.id, notification.orderId)}
                      className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-[var(--color-primary)]/10 disabled:opacity-50"
                    >
                      {actionId === notification.id ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Accept Order</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

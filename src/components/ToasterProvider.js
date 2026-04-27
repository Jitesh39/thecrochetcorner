"use client";

import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Toaster
      position={isMobile ? "top-center" : "bottom-right"}
      containerStyle={
        isMobile
          ? {
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "400px",
            zIndex: 100000,
          }
          : {
            bottom: "20px",
            right: "20px",
            zIndex: 100000,
          }
      }
      toastOptions={{
        duration: 2500,
        style: {
          background: "#ffffff",
          color: "#222",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
          border: "1px solid #e5e5e5",
          fontSize: "14px",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "6px", // Reduced gap between emoji/icon and text
        },
      }}
    />
  );
}
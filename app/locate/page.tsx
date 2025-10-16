"use client";

import { useEffect, useRef, useState } from "react";
import GoogleMapsLoader from "@/components/GoogleMapsLoader";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export default function MapPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const mapRef = useRef<HTMLDivElement>(null);

  // Step 1: Get user position (works in Capacitor + web)
  async function getCurrentLocation() {
    try {
      if (Capacitor.isNativePlatform()) {
        // ✅ Native path
        await Geolocation.requestPermissions();
        const pos = await Geolocation.getCurrentPosition();
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } else {
        // ✅ Browser fallback
        return await new Promise<{ lat: number; lng: number }>(
          (resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Browser does not support geolocation"));
            }
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                resolve({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }),
              (err) => reject(err),
              { enableHighAccuracy: true }
            );
          }
        );
      }
    } catch (err) {
      console.error("Location error:", err);
      throw err;
    }
  }

  // Step 2: Initialize map when Google API & coords available
  useEffect(() => {
    if (!coords || !window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    new window.google.maps.Marker({
      position: coords,
      map,
      title: "You’re here 🚀",
    });
  }, [coords]);

  return (
    <GoogleMapsLoader
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
    >
      <div className="h-screen w-full relative">
        <div
          ref={mapRef}
          className="absolute top-0 left-0 right-0 bottom-0 rounded-lg"
        />

        {!coords && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <p className="text-gray-600">Finding your location...</p>
          </div>
        )}
      </div>
    </GoogleMapsLoader>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import GoogleMapsLoader from "@/components/GoogleMapsLoader";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export default function MapPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);

  async function getCurrentLocation() {
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== "granted") {
          throw new Error("Location permission denied");
        }
        const pos = await Geolocation.getCurrentPosition();
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } else {
        return await new Promise<{ lat: number; lng: number }>(
          (resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Browser does not support geolocation"));
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                resolve({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          }
        );
      }
    } catch (err) {
      console.error("Location error:", err);
      throw err;
    }
  }

  useEffect(() => {
    async function initLocation() {
      try {
        const loc = await getCurrentLocation();
        setCoords(loc);
        setError(null);
      } catch (err) {
        console.error("Failed to get location:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to get your location. Please check permissions."
        );
      }
    }

    initLocation();
  }, []);

  useEffect(() => {
    if (!coords || !window.google || !mapRef.current) return;

    // Only initialize map once
    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      new window.google.maps.Marker({
        position: coords,
        map: googleMapRef.current,
        title: "You're here 🚀",
      });
    } else {
      // Update existing map center if coords change
      googleMapRef.current.setCenter(coords);
    }
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
        {!coords && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <p className="text-gray-600">Finding your location...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="text-center p-4">
              <p className="text-red-600 font-semibold mb-2">Location Error</p>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </GoogleMapsLoader>
  );
}

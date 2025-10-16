"use client";

import { useEffect, useRef, useState } from "react";
import GoogleMapsLoader from "@/components/GoogleMapsLoader";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

import { MapPin,  Navigation } from "lucide-react";
import { toast } from "sonner";

export default function MapPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  async function getCurrentLocation() {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== "granted") {
          throw new Error("Location permission denied");
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        return { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy 
        };
      } else {
        return await new Promise<{ lat: number; lng: number; accuracy: number }>(
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
                  accuracy: pos.coords.accuracy,
                }),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
          }
        );
      }
    } catch (err) {
      console.error("Location error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }



  const initializeMap = () => {
    if (!coords || !window.google || !mapRef.current) return;

    const mapStyles = [
      {
        featureType: "all",
        elementType: "geometry.fill",
        stylers: [{ saturation: -20 }, { lightness: 20 }]
      },
      {
        featureType: "water",
        elementType: "all",
        stylers: [{ color: "#3b82f6" }, { visibility: "on" }]
      },
      {
        featureType: "road",
        elementType: "all",
        stylers: [{ saturation: -30 }, { lightness: 30 }]
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "simplified" }, { saturation: -50 }]
      },
      {
        featureType: "landscape",
        elementType: "all",
        stylers: [{ saturation: -20 }, { lightness: 30 }]
      }
    ];

    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 17,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        gestureHandling: "greedy",
        disableDefaultUI: false,
        clickableIcons: false,
      });

      const customMarker = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#ff0000',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 4,
        scale: 12,
      };

      markerRef.current = new google.maps.Marker({
        position: coords,
        map: googleMapRef.current,
        title: "Your Current Location",
        icon: customMarker,
      });
    } else {
      googleMapRef.current.setCenter(coords);
      if (markerRef.current) {
        markerRef.current.setPosition(coords);
      }
    }
  };


  useEffect(() => {
    async function initLocation() {
      try {
        const location = await getCurrentLocation();
        setCoords({ lat: location.lat, lng: location.lng });
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
    if (coords) {
      initializeMap();
    }
  }, [coords]);

  return (
    <GoogleMapsLoader apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <div className="h-screen w-full relative bg-gray-50">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Your Location</h1>
                <p className="text-sm text-gray-600">Real-time position tracking</p>
              </div>
            </div>
    
          </div>
        </div>

        {/* Map Container */}
        <div className="absolute top-21 left-0 right-0 bottom-14 rounded-t-3xl overflow-hidden shadow-xl">
          <div
            ref={mapRef}
            className="w-full h-full"
          />
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white/95 backdrop-blur-sm">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding Your Location</h3>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Connecting ...</span>
                </div>
              </div>
            </div>
          )}

 
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-white/95 backdrop-blur-sm">
              <div className="text-center p-6 max-w-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Location Unavailable</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{error}</p>
     
              </div>
            </div>
          )}
        </div>

  
      </div>
    </GoogleMapsLoader>
  );
}

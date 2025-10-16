"use client";
import { useRouter, usePathname } from "next/navigation";
import { Home, Map, User } from "lucide-react";

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: <Home size={22} />, label: "Home", path: "/" },
    { icon: <Map size={22} />, label: "Locate", path: "/locate" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`flex flex-col items-center transition ${
              isActive ? "text-blue-600" : "text-gray-600 hover:text-black"
            }`}
          >
            {/* clone icon with dynamic color */}
            <tab.icon.type size={24} strokeWidth={isActive ? 3 : 2} />
            <span
              className={`text-xs ${
                isActive ? "font-semibold text-blue-600" : "text-gray-600"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

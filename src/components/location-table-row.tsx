"use client";

import { formatPrice } from "@/lib/formatPrice";
import { useRouter } from "next/navigation";

type LocationTableRowProps = {
  location: {
    id: string;
    name: string;
    notes: string;
    averageRent: number;
    propertyCount: number;
    highlights: string[];
  };
};

export function LocationTableRow({ location }: LocationTableRowProps) {
  const router = useRouter();

  const handleLocationClick = () => {
    router.push(`/rentals/location/${location.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLocationClick();
    }
  };

  return (
    <tr
      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-800/50 transition-colors"
      onClick={handleLocationClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`View rentals in ${location.name}`}
    >
      <td className="py-4 px-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {location.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {location.notes}
          </div>
        </div>
      </td>
      <td className="py-4 px-4 font-semibold text-green-600 dark:text-green-400">
        {formatPrice(location.averageRent)}
      </td>
      <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
        {location.propertyCount} available
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-wrap gap-1">
          {location.highlights.map((highlight) => (
            <span
              key={highlight}
              className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
            >
              {highlight}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

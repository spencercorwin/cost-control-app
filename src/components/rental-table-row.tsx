"use client";

import { formatDate } from "@/lib/formatDate";
import { formatPrice } from "@/lib/formatPrice";
import { useRouter } from "next/navigation";

type RentalTableRowProps = {
  rental: {
    id: string;
    propertyName: string;
    propertyAddress: string;
    url: string;
    notes: string;
    averagePrice?: {
      monthlyRent: number;
      sizeSqFt: number;
    } | null;
    pricePerSqFt?: number | null;
  };
};

export function RentalTableRow({ rental }: RentalTableRowProps) {
  const router = useRouter();

  const handleRentalClick = () => {
    router.push(`/rentals/rental/${rental.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRentalClick();
    }
  };

  return (
    <tr
      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-800/50 transition-colors"
      onClick={handleRentalClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`View details for ${rental.propertyName}`}
    >
      <td className="py-4 px-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {rental.propertyName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {rental.propertyAddress}
          </div>
          {rental.notes && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {rental.notes}
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        {rental.averagePrice ? (
          <div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              {formatPrice(rental.averagePrice.monthlyRent)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {Math.round(rental.averagePrice.sizeSqFt)} sq ft
            </div>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-600">
            No price data
          </span>
        )}
      </td>
      <td className="py-4 px-4">
        {rental.pricePerSqFt ? (
          <div className="font-semibold text-purple-600 dark:text-purple-400">
            {formatPrice(rental.pricePerSqFt)}/sq ft
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-600">—</span>
        )}
      </td>
      <td className="py-4 px-4">
        {rental.url && (
          <a
            href={rental.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            View Listing
          </a>
        )}
      </td>
    </tr>
  );
}

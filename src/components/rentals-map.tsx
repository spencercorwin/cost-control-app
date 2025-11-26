"use client";

import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";

type Rental = {
  id: string;
  propertyName: string;
  propertyAddress: string;
  url: string;
  latitude: string;
  longitude: string;
};

type RentalsMapProps = {
  rentals: Rental[];
  centerLat?: number;
  centerLng?: number;
};

function RentalMarker({ rental }: { rental: Rental }) {
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const lat = Number.parseFloat(rental.latitude);
  const lng = Number.parseFloat(rental.longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    console.warn(`Invalid coordinates for rental ${rental.id}`);
    return null;
  }

  const position = { lat, lng };

  return (
    <>
      <AdvancedMarker
        position={position}
        title={rental.propertyName}
        onClick={() => setInfoWindowOpen(true)}
      />
      {infoWindowOpen && (
        <InfoWindow
          position={position}
          onCloseClick={() => setInfoWindowOpen(false)}
        >
          <div className="p-2 max-w-[200px]">
            <h3 className="font-semibold text-sm mb-1">
              {rental.propertyName}
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              {rental.propertyAddress}
            </p>
            {rental.url && (
              <a
                href={rental.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs underline"
              >
                View Listing →
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function MapContent({ rentals }: { rentals: Rental[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || rentals.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let validRentals = 0;

    for (const rental of rentals) {
      const lat = Number.parseFloat(rental.latitude);
      const lng = Number.parseFloat(rental.longitude);

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        bounds.extend({ lat, lng });
        validRentals++;
      }
    }

    if (validRentals > 1) {
      map.fitBounds(bounds);
    } else if (validRentals === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(15);
    }
  }, [map, rentals]);

  return (
    <>
      {rentals.map((rental) => (
        <RentalMarker key={rental.id} rental={rental} />
      ))}
    </>
  );
}

export function RentalsMap({ rentals, centerLat, centerLng }: RentalsMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Google Maps API key not configured
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-[400px] rounded-lg overflow-hidden">
        <GoogleMap
          defaultCenter={{ lat: centerLat || 0, lng: centerLng || 0 }}
          defaultZoom={13}
          mapId="rental_map"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <MapContent rentals={rentals} />
        </GoogleMap>
      </div>
    </APIProvider>
  );
}

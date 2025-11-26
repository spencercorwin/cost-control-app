"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  notes: z.string(),
  address: z
    .string()
    .min(5, "Please enter a valid address or neighborhood")
    .max(200, "Address must be at most 200 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export default function CreateLocation() {
  const router = useRouter();
  const [isGeocoding, setIsGeocoding] = useState(false);

  const form = useForm({
    defaultValues: {
      id: "",
      name: "",
      notes: "",
      address: "",
      latitude: 0,
      longitude: 0,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch("/api/locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: value.id,
            name: value.name,
            description: value.notes || undefined,
            latitude: value.latitude,
            longitude: value.longitude,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || "Failed to create location");
          return;
        }

        toast.success("Location created successfully");
        router.push(`/rentals/locations/${value.id}`);
      } catch (error) {
        toast.error("An error occurred while creating the location");
        console.error(error);
      }
    },
  });

  const handleGeocodeAddress = async (address: string) => {
    if (!address || address.length < 3) {
      toast.error("Please enter a valid address or neighborhood");
      return;
    }

    setIsGeocoding(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        toast.error("Google Maps API key not configured");
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${apiKey}`,
      );

      const data = await response.json();

      if (data.status === "OK" && data.results[0]) {
        const location = data.results[0].geometry.location;
        form.setFieldValue("latitude", location.lat);
        form.setFieldValue("longitude", location.lng);
        toast.success(
          `Coordinates found: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        );
      } else {
        toast.error("Could not find coordinates for this address");
      }
    } catch (error) {
      toast.error("Error geocoding address");
      console.error(error);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Location</CardTitle>
          <CardDescription>
            Add a new rental location with coordinates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="id">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Location ID</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="unique-location-id"
                        autoComplete="off"
                      />
                      <FieldDescription>
                        A unique identifier for this location
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Location Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Downtown Apartment"
                        autoComplete="off"
                      />
                      <FieldDescription>
                        A descriptive name for this rental location
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="notes">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Notes (Optional)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Additional notes about this location"
                        autoComplete="off"
                      />
                      <FieldDescription>
                        Any additional information or notes
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="address">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Address or Neighborhood
                      </FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="123 Main St, City, State"
                          autoComplete="off"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            handleGeocodeAddress(field.state.value)
                          }
                          disabled={isGeocoding || !field.state.value}
                        >
                          {isGeocoding ? "Loading..." : "Get Coordinates"}
                        </Button>
                      </div>
                      <FieldDescription>
                        Enter an address or neighborhood to automatically fetch
                        coordinates
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="latitude">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Latitude</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="any"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          aria-invalid={isInvalid}
                          placeholder="37.7749"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="longitude">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Longitude</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="any"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          aria-invalid={isInvalid}
                          placeholder="-122.4194"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            </FieldGroup>

            <div className="flex gap-3 mt-6">
              <Button type="submit">Create Location</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/rentals")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

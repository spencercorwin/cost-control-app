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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  id: z.string().min(1, "ID is required"),
  propertyName: z
    .string()
    .min(1, "Property name is required")
    .max(100, "Property name must be at most 100 characters"),
  locationId: z.string().min(1, "Location ID is required"),
  description: z.string(),
  propertyAddress: z
    .string()
    .min(5, "Please enter a valid address")
    .max(200, "Address must be at most 200 characters"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  url: z.string().url("Please enter a valid URL"),
});

type Location = {
  id: string;
  name: string;
  notes: string;
  latitude: string;
  longitude: string;
};

type CreateRentalFormProps = {
  locations: Location[];
};

export function CreateRentalForm({ locations }: CreateRentalFormProps) {
  const router = useRouter();
  const [isGeocoding, setIsGeocoding] = useState(false);

  const form = useForm({
    defaultValues: {
      id: "",
      propertyName: "",
      locationId: "",
      description: "",
      propertyAddress: "",
      latitude: "",
      longitude: "",
      url: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch("/api/rentals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: value.id,
            propertyName: value.propertyName,
            locationId: value.locationId,
            description: value.description || undefined,
            propertyAddress: value.propertyAddress,
            latitude: value.latitude,
            longitude: value.longitude,
            url: value.url,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || "Failed to create rental");
          return;
        }

        toast.success("Rental created successfully");
        router.push(`/rentals/rental/${value.id}`);
      } catch (error) {
        toast.error("An error occurred while creating the rental");
        console.error(error);
      }
    },
  });

  const handleGeocodeAddress = async (address: string) => {
    if (!address || address.length < 3) {
      toast.error("Please enter a valid address");
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
        form.setFieldValue("latitude", location.lat.toString());
        form.setFieldValue("longitude", location.lng.toString());
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
    <Card>
      <CardHeader>
        <CardTitle>Create New Rental</CardTitle>
        <CardDescription>
          Add a new rental property with coordinates
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
                    <FieldLabel htmlFor={field.name}>Rental ID</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="unique-rental-id"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      A unique identifier for this rental
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="propertyName">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Property Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Sunset Apartments Unit 5B"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      A descriptive name for this rental property
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="locationId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No locations available
                          </div>
                        ) : (
                          locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      The location this rental belongs to
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Description (Optional)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Additional notes about this rental"
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

            <form.Field name="propertyAddress">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Property Address
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
                        onClick={() => handleGeocodeAddress(field.state.value)}
                        disabled={isGeocoding || !field.state.value}
                      >
                        {isGeocoding ? "Loading..." : "Get Coordinates"}
                      </Button>
                    </div>
                    <FieldDescription>
                      Enter the property address to automatically fetch
                      coordinates
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="url">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Property URL</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://example.com/listing"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      A link to the property listing or website
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
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
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
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
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
            <Button type="submit">Create Rental</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

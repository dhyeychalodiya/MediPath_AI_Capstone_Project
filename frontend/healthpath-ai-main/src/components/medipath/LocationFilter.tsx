import { MapPin, LocateFixed, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CITY_COORDS, STATES_WITH_CITIES, loadCitiesFromHospitals } from "@/services/hospitalService";
import { toast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";

export type LocationValue = {
  state: string;
  city: string;
  lat: number;
  lng: number;
  source: "city" | "geo";
  scope: "city" | "state" | "country";
};

type Props = {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  language?: string;
};

export const LocationFilter = ({ value, onChange, language = "en" }: Props) => {
  const [, setReloadTrigger] = useState(0);
  
  // Force re-render when cities load
  useEffect(() => {
    loadCitiesFromHospitals().then(() => {
      setReloadTrigger(t => t + 1);
    });
  }, []);

  const cities = STATES_WITH_CITIES[value.state] ?? [];
  const [locating, setLocating] = useState(false);

  const setState = (state: string) => {
    const firstCity = STATES_WITH_CITIES[state][0];
    const c = CITY_COORDS[firstCity];
    onChange({ state, city: firstCity, lat: c.lat, lng: c.lng, source: "city", scope: "city" });
  };

  const setCity = (city: string) => {
    const c = CITY_COORDS[city];
    onChange({ state: value.state, city, lat: c.lat, lng: c.lng, source: "city", scope: "city" });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<{ city?: string; state?: string }> => {
    // 1. Try BigDataCloud Client API (fast, high precision, CORS-friendly, zero rate-limit)
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality;
        const state = data.principalSubdivision;
        if (city) {
          return { city, state };
        }
      }
    } catch {
      // Continue to next provider
    }

    // 2. Try backend reverse-geocode endpoint (which uses OpenStreetMap Nominatim with proper User-Agent)
    try {
      const res = await fetch(`/api/hospitals/reverse-geocode?lat=${lat}&lng=${lng}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.city) {
          return { city: data.city, state: data.state };
        }
      }
    } catch {
      // Fall through to nearest city
    }

    // 3. Mathematical nearest city fallback using CITY_COORDS
    let closestCity = "";
    let closestDist = Infinity;
    let closestState = "";

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    for (const [cityName, coord] of Object.entries(CITY_COORDS)) {
      if (coord && typeof coord.lat === "number" && typeof coord.lng === "number") {
        const dist = calcDist(lat, lng, coord.lat, coord.lng);
        if (dist < closestDist) {
          closestDist = dist;
          closestCity = cityName;
          closestState = coord.state;
        }
      }
    }

    if (closestCity && closestDist < 80) {
      return { city: closestCity, state: closestState };
    }

    return {};
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support location detection. Please select your city from the dropdown.",
        variant: "destructive",
      });
      return;
    }

    setLocating(true);

    const applyLocation = (lat: number, lng: number, city?: string, state?: string) => {
      // Find matching state in STATES_WITH_CITIES if possible
      let matchedState = value.state;
      if (state) {
        const found = Object.keys(STATES_WITH_CITIES).find(
          (s) => s.toLowerCase() === state.toLowerCase() || state.toLowerCase().includes(s.toLowerCase())
        );
        if (found) matchedState = found;
      }

      // If city is detected, register it in the dropdown if not already present
      const finalCity = city || value.city || "Current location";
      if (matchedState && STATES_WITH_CITIES[matchedState]) {
        if (!STATES_WITH_CITIES[matchedState].includes(finalCity) && finalCity !== "Current location") {
          STATES_WITH_CITIES[matchedState] = [finalCity, ...STATES_WITH_CITIES[matchedState]].sort();
        }
      }
      if (finalCity !== "Current location" && !CITY_COORDS[finalCity]) {
        CITY_COORDS[finalCity] = { lat, lng, state: matchedState };
      }

      onChange({
        state: matchedState,
        city: finalCity,
        lat,
        lng,
        source: "geo",
        scope: "city",
      });
      toast({
        title: "Precise location detected",
        description: `Showing nearby hospitals for ${finalCity}${matchedState ? `, ${matchedState}` : ""}.`,
      });
      setLocating(false);
    };

    const handleSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const { city, state } = await reverseGeocode(latitude, longitude);
      applyLocation(latitude, longitude, city, state);
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.TIMEOUT) {
        // High-accuracy GPS timed out; try standard accuracy once before reporting failure
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          () => {
            setLocating(false);
            toast({
              title: "Location request timed out",
              description: "Could not obtain a satellite or network fix in time. Please select your city from the dropdown.",
              variant: "destructive",
            });
          },
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
        );
        return;
      }

      setLocating(false);
      if (error.code === error.PERMISSION_DENIED) {
        toast({
          title: "Location permission denied",
          description: "Please allow location access in your browser / Windows Settings to use automatic location.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Location unavailable",
          description: "Your device was unable to determine its current position. Please select your city from the dropdown.",
          variant: "destructive",
        });
      }
    };

    // Primary attempt: True high-accuracy GPS / Wi-Fi positioning (10s timeout, fresh coordinates)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5 bg-card border border-border rounded-2xl shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pl-1">
        <MapPin className="w-4 h-4 text-primary" />
        {t("showing_hospitals_near", language).replace(":", "")}
      </div>
      <Select value={value.state || undefined} onValueChange={setState}>
        <SelectTrigger className="w-[155px] h-10 rounded-xl"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.keys(STATES_WITH_CITIES).map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.city} onValueChange={setCity}>
        <SelectTrigger className="w-[165px] h-10 rounded-xl"><SelectValue /></SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={useMyLocation}
        disabled={locating}
        className="h-10 px-3.5 rounded-xl gap-2 cursor-pointer font-medium"
      >
        {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <LocateFixed className="w-3.5 h-3.5 text-primary" />}
        {locating ? "..." : t("use_my_location", language)}
      </Button>
      {value.source === "geo" && (
        <span className="text-xs text-teal font-medium pl-1">📍 GPS · {value.city}</span>
      )}
    </div>
  );
};
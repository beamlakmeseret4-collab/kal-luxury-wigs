'use client';

import { useEffect, useRef, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { Textarea, Field } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';

let mapsLoadPromise = null;
function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (mapsLoadPromise) return mapsLoadPromise;
  mapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return mapsLoadPromise;
}

const ADDIS_CENTER = { lat: 9.0054, lng: 38.7636 };

/**
 * value: { lat, lng, fullAddress, notes }
 * onChange(next) is called whenever any part changes.
 * Falls back to a plain text address field if no Google Maps key is
 * configured yet, so checkout still works before that's set up.
 */
export default function LocationPicker({ apiKey, value, onChange }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerObj = useRef(null);
  const [status, setStatus] = useState(apiKey ? 'loading' : 'no-key');

  useEffect(() => {
    if (!apiKey) return undefined;
    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled || !mapRef.current) return;
        const startCenter = value?.lat ? { lat: value.lat, lng: value.lng } : ADDIS_CENTER;

        const map = new google.maps.Map(mapRef.current, {
          center: startCenter,
          zoom: 14,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        const marker = new google.maps.Marker({ position: startCenter, map, draggable: true });
        mapObj.current = map;
        markerObj.current = marker;

        const geocoder = new google.maps.Geocoder();
        const reverseGeocode = (latLng) => {
          geocoder.geocode({ location: latLng }, (results, geoStatus) => {
            const address = geoStatus === 'OK' && results[0] ? results[0].formatted_address : '';
            onChange({
              ...value,
              lat: typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat,
              lng: typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng,
              fullAddress: address,
            });
          });
        };

        marker.addListener('dragend', () => reverseGeocode(marker.getPosition()));
        map.addListener('click', (e) => {
          marker.setPosition(e.latLng);
          reverseGeocode(e.latLng);
        });

        setStatus('ready');
      })
      .catch(() => setStatus('error'));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const useMyLocation = () => {
    if (!navigator.geolocation || !mapObj.current || !markerObj.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapObj.current.setCenter(loc);
        mapObj.current.setZoom(16);
        markerObj.current.setPosition(loc);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: loc }, (results, geoStatus) => {
          const address = geoStatus === 'OK' && results[0] ? results[0].formatted_address : '';
          onChange({ ...value, ...loc, fullAddress: address });
        });
      },
      () => {
        /* permission denied or unavailable — user can still click the map */
      }
    );
  };

  if (status === 'no-key' || status === 'error') {
    return (
      <div className="space-y-4">
        {status === 'error' && (
          <p className="text-xs text-garnet">Map failed to load — you can still enter your address below.</p>
        )}
        <Field label="Delivery address" required>
          <Textarea
            required
            value={value?.fullAddress || ''}
            onChange={(e) => onChange({ ...value, fullAddress: e.target.value })}
            placeholder="e.g. Bole, near Edna Mall, House #14, blue gate"
          />
        </Field>
        <Field label="Delivery notes (optional)">
          <Textarea
            rows={2}
            value={value?.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder="Floor number, landmark, best time to deliver…"
          />
        </Field>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
        <LocateFixed className="h-4 w-4" /> Use My Current Location
      </Button>

      <div ref={mapRef} className="h-72 w-full overflow-hidden rounded-xl2 border border-ink/10 bg-ink/5" />

      {status === 'loading' && <p className="text-xs text-charcoal/50">Loading map…</p>}

      <Field label="Address" hint="Drag the pin or tap the map to fine-tune this.">
        <Textarea
          value={value?.fullAddress || ''}
          onChange={(e) => onChange({ ...value, fullAddress: e.target.value })}
          placeholder="Confirmed address will appear here — you can edit it"
        />
      </Field>
      <Field label="Delivery notes (optional)">
        <Textarea
          rows={2}
          value={value?.notes || ''}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="Floor number, landmark, best time to deliver…"
        />
      </Field>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

let mapsPromise = null;
function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return mapsPromise;
}

/** Small read-only map pin for a single delivery order — reuses the same
 * Maps JavaScript API already loaded for the customer-facing LocationPicker
 * (no extra Google API needs enabling). */
export default function OrderMap({ lat, lng, apiKey, className }) {
  const ref = useRef(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!apiKey || !lat || !lng) return;
    setStatus('loading');
    loadGoogleMaps(apiKey)
      .then((google) => {
        const center = { lat, lng };
        const map = new google.maps.Map(ref.current, {
          center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
        });
        // eslint-disable-next-line no-new
        new google.maps.Marker({ position: center, map });
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [apiKey, lat, lng]);

  if (!lat || !lng) {
    return <p className="text-xs text-charcoal/40">No pinned location for this order.</p>;
  }
  if (!apiKey) {
    return (
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-gold-dark underline"
      >
        Open location in Google Maps ({lat.toFixed(5)}, {lng.toFixed(5)})
      </a>
    );
  }

  return <div ref={ref} className={className || 'h-48 w-full rounded-lg bg-ink/5'} />;
}

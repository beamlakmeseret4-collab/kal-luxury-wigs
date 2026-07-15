'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Smartphone, Landmark, Banknote, Upload, Check } from 'lucide-react';
import { RadioCard, Input, Field } from '@/components/ui/FormFields';
import { cn } from '@/lib/utils';

export default function PaymentMethodPanel({ config, value, onChange }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const setMethod = (method) => onChange({ ...value, method, screenshot: null, payerName: value.payerName, payerPhone: value.payerPhone });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ ...value, screenshot: file });
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <RadioCard
          name="paymentMethod"
          value="telebirr"
          checked={value.method === 'telebirr'}
          onChange={() => setMethod('telebirr')}
          title="TeleBirr"
          description="Pay via your TeleBirr app"
          icon={<Smartphone className="h-4 w-4 text-gold-dark" />}
        />
        <RadioCard
          name="paymentMethod"
          value="cbe"
          checked={value.method === 'cbe'}
          onChange={() => setMethod('cbe')}
          title="CBE Bank"
          description="Bank transfer"
          icon={<Landmark className="h-4 w-4 text-gold-dark" />}
        />
        <RadioCard
          name="paymentMethod"
          value="cash"
          checked={value.method === 'cash'}
          onChange={() => setMethod('cash')}
          title="Cash"
          description="Pay on delivery or pickup"
          icon={<Banknote className="h-4 w-4 text-gold-dark" />}
        />
      </div>

      {value.method === 'telebirr' && (
        <div className="rounded-xl2 border border-gold/30 bg-gold/5 p-5">
          <p className="text-sm font-medium text-charcoal">Send payment to:</p>
          <p className="mt-1 font-display text-xl text-ink">{config?.telebirr?.number || 'Set TELEBIRR_NUMBER in backend .env'}</p>
          <p className="text-sm text-charcoal/60">{config?.telebirr?.accountName}</p>
          <p className="mt-2 text-xs text-charcoal/50">
            Open your TeleBirr app, send the exact order total to this number, then upload a screenshot below.
          </p>
        </div>
      )}

      {value.method === 'cbe' && (
        <div className="rounded-xl2 border border-gold/30 bg-gold/5 p-5">
          <p className="text-sm font-medium text-charcoal">Transfer to:</p>
          <p className="mt-1 font-display text-xl text-ink">{config?.cbe?.accountNumber || 'Set CBE_ACCOUNT_NUMBER in backend .env'}</p>
          <p className="text-sm text-charcoal/60">{config?.cbe?.accountName} · {config?.cbe?.branch}</p>
          <p className="mt-2 text-xs text-charcoal/50">
            Transfer the exact order total via CBE mobile banking or in person, then upload a screenshot or receipt photo below.
          </p>
        </div>
      )}

      {value.method === 'cash' && (
        <div className="rounded-xl2 border border-ink/10 bg-white p-5 text-sm text-charcoal/70">
          You&rsquo;ll pay in cash when your order is delivered or when you pick it up in-store. No screenshot needed.
        </div>
      )}

      {(value.method === 'telebirr' || value.method === 'cbe') && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name (as sent from)" required>
            <Input
              required
              value={value.payerName || ''}
              onChange={(e) => onChange({ ...value, payerName: e.target.value })}
              placeholder="Full name"
            />
          </Field>
          <Field label="Your phone (as sent from)" required>
            <Input
              required
              value={value.payerPhone || ''}
              onChange={(e) => onChange({ ...value, payerPhone: e.target.value })}
              placeholder="09XXXXXXXX"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Payment screenshot" required hint="A clear screenshot or photo of your payment confirmation.">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl2 border-2 border-dashed p-6 text-sm transition',
                  value.screenshot ? 'border-gold bg-gold/5 text-charcoal' : 'border-ink/20 text-charcoal/50 hover:border-ink/40'
                )}
              >
                {value.screenshot ? <Check className="h-4 w-4 text-gold-dark" /> : <Upload className="h-4 w-4" />}
                {value.screenshot ? value.screenshot.name : 'Tap to upload screenshot'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFile}
              />
            </Field>
            {preview && (
              <div className="relative mt-3 h-40 w-32 overflow-hidden rounded-lg border border-ink/10">
                <Image src={preview} alt="Payment screenshot preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useFacets } from '@/lib/hooks';
import { textureLabels, laceLabels, styleTagLabels } from '@/lib/siteConfig';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function FiltersSidebar({ filters, onChange, onClear, className }) {
  const { data: facets } = useFacets();

  const toggle = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });
  };

  const hasActiveFilters = Boolean(
    filters.hairType || filters.laceType || filters.texture || filters.style || filters.brand || filters.minPrice || filters.maxPrice
  );

  return (
    <aside className={cn('space-y-7', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-charcoal">Filters</h2>
        {hasActiveFilters && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-charcoal/50 hover:text-garnet">
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Hair Type">
        {(facets?.hairTypes || []).map((v) => (
          <FilterPill key={v} label={v === 'human-hair' ? 'Human Hair' : 'Synthetic'} active={filters.hairType === v} onClick={() => toggle('hairType', v)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Texture">
        {(facets?.textures || []).map((v) => (
          <FilterPill key={v} label={textureLabels[v] || v} active={filters.texture === v} onClick={() => toggle('texture', v)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Lace Type">
        {(facets?.laceTypes || []).filter((v) => v !== 'none').map((v) => (
          <FilterPill key={v} label={laceLabels[v] || v} active={filters.laceType === v} onClick={() => toggle('laceType', v)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Style">
        {(facets?.styleTags || []).map((v) => (
          <FilterPill key={v} label={styleTagLabels[v] || v} active={filters.style === v} onClick={() => toggle('style', v)} />
        ))}
      </FilterGroup>

      {facets?.brands?.length > 0 && (
        <FilterGroup title="Brand">
          {facets.brands.map((v) => (
            <FilterPill key={v} label={v} active={filters.brand === v} onClick={() => toggle('brand', v)} />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price (ETB)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value || undefined })}
            className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-gold"
          />
          <span className="text-charcoal/40">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value || undefined })}
            className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-gold"
          />
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal/50">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs transition',
        active ? 'border-ink bg-ink text-cream' : 'border-ink/15 text-charcoal/70 hover:border-ink/40'
      )}
    >
      {label}
    </button>
  );
}

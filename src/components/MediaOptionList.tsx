import { optionDetail, optionLabel } from '@/lib/labels';
import type { MediaItem } from '@/lib/types';

type Props = {
  media: MediaItem[];
  selected: number;
  onSelect: (index: number) => void;
};

export function MediaOptionList({ media, selected, onSelect }: Props) {
  return (
    <fieldset>
      <legend className="label-caps mb-3">Pilih format ({media.length})</legend>
      <ul className="divide-y-2 divide-ink border-2 border-ink bg-white">
        {media.map((item, i) => {
          const detail = optionDetail(item);
          const id = `media-option-${i}`;
          return (
            <li key={`${i}-${item.quality ?? ''}-${item.extension ?? ''}`}>
              <label
                htmlFor={id}
                className={`flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 ${
                  selected === i ? 'bg-acid' : 'hover:bg-paper'
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name="media-option"
                  checked={selected === i}
                  onChange={() => onSelect(i)}
                  className="h-5 w-5 shrink-0 accent-ink"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold">{optionLabel(item)}</span>
                  {detail ? <span className="block text-sm text-ink/70">{detail}</span> : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

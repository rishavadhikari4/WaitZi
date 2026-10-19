import { useRef, useState, type ChangeEvent } from 'react';
import { Icon } from '@iconify/react';

export default function FileUpload({
  label,
  onChange,
  accept = 'image/*',
  preview: existingPreview,
}: {
  label?: string;
  onChange: (file: File | null) => void;
  accept?: string;
  preview?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(existingPreview || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
          <button
            onClick={handleClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
            type="button"
          >
            <Icon icon="mdi:close" className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <Icon icon="mdi:upload-outline" className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Click to upload</p>
          <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
    </div>
  );
}

interface VisionAiOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const VisionAiOperatorConfig = ({ config, onChange }: VisionAiOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'annotate_image'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="annotate_image">Annotate Image</option>
          <option value="detect_text">Detect Text (OCR)</option>
          <option value="detect_labels">Detect Labels</option>
          <option value="detect_faces">Detect Faces</option>
          <option value="detect_objects">Detect Objects</option>
          <option value="detect_logos">Detect Logos</option>
          <option value="detect_landmarks">Detect Landmarks</option>
          <option value="detect_safe_search">Safe Search Detection</option>
          <option value="detect_web">Web Detection</option>
          <option value="document_text">Document Text Detection</option>
          <option value="product_search">Product Search</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Image Source</label>
        <select
          value={config.imageSource || 'gcs'}
          onChange={(e) => updateConfig('imageSource', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="gcs">Google Cloud Storage</option>
          <option value="url">Public URL</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          {config.imageSource === 'url' ? 'Image URL *' : 'GCS URI *'}
        </label>
        <input
          type="text"
          value={config.imageUri || ''}
          onChange={(e) => updateConfig('imageUri', e.target.value)}
          placeholder={config.imageSource === 'url' ? 'https://example.com/image.jpg' : 'gs://bucket/image.jpg'}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      {config.operation === 'annotate_image' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Features (select multiple)</label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {['LABEL_DETECTION', 'TEXT_DETECTION', 'FACE_DETECTION', 'OBJECT_LOCALIZATION',
              'LOGO_DETECTION', 'LANDMARK_DETECTION', 'SAFE_SEARCH_DETECTION', 'IMAGE_PROPERTIES'].map(feature => (
              <label key={feature} className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={(config.features || []).includes(feature)}
                  onChange={(e) => {
                    const features = config.features || [];
                    if (e.target.checked) {
                      updateConfig('features', [...features, feature]);
                    } else {
                      updateConfig('features', features.filter((f: string) => f !== feature));
                    }
                  }}
                  className="rounded border-gray-600 bg-gray-800"
                />
                {feature.replace(/_/g, ' ').toLowerCase()}
              </label>
            ))}
          </div>
        </div>
      )}

      {config.operation === 'product_search' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Product Set ID *</label>
            <input
              type="text"
              value={config.productSetId || ''}
              onChange={(e) => updateConfig('productSetId', e.target.value)}
              placeholder="my-product-set"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Product Category</label>
            <select
              value={config.productCategory || 'general-v1'}
              onChange={(e) => updateConfig('productCategory', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="general-v1">General</option>
              <option value="homegoods-v2">Home Goods</option>
              <option value="apparel-v2">Apparel</option>
              <option value="toys-v2">Toys</option>
              <option value="packagedgoods-v1">Packaged Goods</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Max Results</label>
        <input
          type="number"
          value={config.maxResults || 10}
          onChange={(e) => updateConfig('maxResults', parseInt(e.target.value))}
          min={1}
          max={100}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output GCS Path (optional)</label>
        <input
          type="text"
          value={config.outputUri || ''}
          onChange={(e) => updateConfig('outputUri', e.target.value)}
          placeholder="gs://bucket/vision-output/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Language Hints (comma-separated)</label>
        <input
          type="text"
          value={config.languageHints || ''}
          onChange={(e) => updateConfig('languageHints', e.target.value)}
          placeholder="en, es, fr"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">GCP Connection ID</label>
        <input
          type="text"
          value={config.gcpConnId || ''}
          onChange={(e) => updateConfig('gcpConnId', e.target.value)}
          placeholder="google_cloud_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
};

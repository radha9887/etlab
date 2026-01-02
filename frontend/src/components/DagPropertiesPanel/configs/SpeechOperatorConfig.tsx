interface SpeechOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SpeechOperatorConfig = ({ config, onChange }: SpeechOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'speech_to_text'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="speech_to_text">Speech to Text</option>
          <option value="text_to_speech">Text to Speech</option>
          <option value="batch_recognize">Batch Recognize (Long Audio)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Project ID</label>
        <input
          type="text"
          value={config.projectId || ''}
          onChange={(e) => updateConfig('projectId', e.target.value)}
          placeholder="my-gcp-project"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'speech_to_text' || config.operation === 'batch_recognize') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Audio GCS URI *</label>
            <input
              type="text"
              value={config.audioUri || ''}
              onChange={(e) => updateConfig('audioUri', e.target.value)}
              placeholder="gs://bucket/audio.wav"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Language Code *</label>
            <select
              value={config.languageCode || 'en-US'}
              onChange={(e) => updateConfig('languageCode', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="es-MX">Spanish (Mexico)</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Mandarin)</option>
              <option value="hi-IN">Hindi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Audio Encoding</label>
            <select
              value={config.encoding || 'LINEAR16'}
              onChange={(e) => updateConfig('encoding', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="LINEAR16">Linear PCM (WAV)</option>
              <option value="FLAC">FLAC</option>
              <option value="MP3">MP3</option>
              <option value="OGG_OPUS">OGG Opus</option>
              <option value="WEBM_OPUS">WebM Opus</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Sample Rate (Hz)</label>
            <input
              type="number"
              value={config.sampleRate || 16000}
              onChange={(e) => updateConfig('sampleRate', parseInt(e.target.value))}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Model</label>
            <select
              value={config.model || 'default'}
              onChange={(e) => updateConfig('model', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="latest_long">Latest Long</option>
              <option value="latest_short">Latest Short</option>
              <option value="phone_call">Phone Call</option>
              <option value="video">Video</option>
              <option value="medical_dictation">Medical Dictation</option>
              <option value="medical_conversation">Medical Conversation</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableAutomaticPunctuation || false}
              onChange={(e) => updateConfig('enableAutomaticPunctuation', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Automatic Punctuation</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableWordTimeOffsets || false}
              onChange={(e) => updateConfig('enableWordTimeOffsets', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Word Time Offsets</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableSpeakerDiarization || false}
              onChange={(e) => updateConfig('enableSpeakerDiarization', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Speaker Diarization</label>
          </div>

          {config.enableSpeakerDiarization && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Expected Speaker Count</label>
              <input
                type="number"
                value={config.speakerCount || 2}
                onChange={(e) => updateConfig('speakerCount', parseInt(e.target.value))}
                min={1}
                max={10}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          )}
        </>
      )}

      {config.operation === 'text_to_speech' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Text to Synthesize *</label>
            <textarea
              value={config.text || ''}
              onChange={(e) => updateConfig('text', e.target.value)}
              placeholder="Enter text to convert to speech..."
              rows={4}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Language Code *</label>
            <select
              value={config.languageCode || 'en-US'}
              onChange={(e) => updateConfig('languageCode', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Mandarin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Voice Name</label>
            <input
              type="text"
              value={config.voiceName || ''}
              onChange={(e) => updateConfig('voiceName', e.target.value)}
              placeholder="en-US-Wavenet-D"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Audio Encoding</label>
            <select
              value={config.audioEncoding || 'MP3'}
              onChange={(e) => updateConfig('audioEncoding', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="MP3">MP3</option>
              <option value="LINEAR16">Linear PCM (WAV)</option>
              <option value="OGG_OPUS">OGG Opus</option>
              <option value="MULAW">Mu-law</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Speaking Rate (0.25 - 4.0)</label>
            <input
              type="number"
              value={config.speakingRate || 1.0}
              onChange={(e) => updateConfig('speakingRate', parseFloat(e.target.value))}
              step={0.1}
              min={0.25}
              max={4.0}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Pitch (-20 to 20)</label>
            <input
              type="number"
              value={config.pitch || 0}
              onChange={(e) => updateConfig('pitch', parseFloat(e.target.value))}
              step={0.5}
              min={-20}
              max={20}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Output GCS URI *</label>
            <input
              type="text"
              value={config.outputUri || ''}
              onChange={(e) => updateConfig('outputUri', e.target.value)}
              placeholder="gs://bucket/audio-output.mp3"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'batch_recognize' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Output GCS URI *</label>
          <input
            type="text"
            value={config.outputUri || ''}
            onChange={(e) => updateConfig('outputUri', e.target.value)}
            placeholder="gs://bucket/transcription-output/"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

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

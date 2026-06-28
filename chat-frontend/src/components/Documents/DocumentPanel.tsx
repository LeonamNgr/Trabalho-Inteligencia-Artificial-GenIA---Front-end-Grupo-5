import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Globe, X, Loader } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-400',
  PROCESSING: 'text-blue-400',
  COMPLETED: 'text-green-400',
  FAILED: 'text-red-400',
};

const STATUS_DOT: Record<string, string> = {
  PENDING: 'bg-yellow-400',
  PROCESSING: 'bg-blue-400 animate-pulse',
  COMPLETED: 'bg-green-400',
  FAILED: 'bg-red-400',
};

export function DocumentPanel() {
  const {
    documents,
    isLoading,
    error,
    ingestFile,
    ingestUrl,
    fetchDocuments,
    removeDocument,
    isIngesting,
  } = useDocuments();

  const [open, setOpen] = useState(false);
  const [showIngest, setShowIngest] = useState<'file' | 'url' | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchDocuments();
    }
  }, [open, fetchDocuments]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await ingestFile(file);
      setShowIngest(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    await ingestUrl(urlInput.trim());
    setUrlInput('');
    setShowIngest(null);
  };

  return (
    <div className="border-t border-[#1a3d6b]/40">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-2 text-slate-400 hover:text-white py-2.5 px-3 rounded-lg transition-all cursor-pointer text-left"
      >
        <FileText className="w-4 h-4" />
        <span className="text-sm">Documentos</span>
        <span className="ml-auto text-xs text-gray-500">
          {open ? '▼' : '▶'}
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-2 pb-2 space-y-2"
        >
          <button
            onClick={() => setShowIngest('file')}
            disabled={isIngesting}
            className="w-full flex items-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-[#0d2040] py-1.5 px-2 rounded transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            Ingerir Arquivo
          </button>

          <button
            onClick={() => setShowIngest('url')}
            disabled={isIngesting}
            className="w-full flex items-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-[#0d2040] py-1.5 px-2 rounded transition-all cursor-pointer disabled:opacity-50"
          >
            <Globe className="w-3 h-3" />
            Ingerir URL
          </button>

          {showIngest === 'file' && (
            <div className="bg-[#0a1a3a] border border-[#1a3d6b]/40 rounded p-2 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.md,.html"
                onChange={handleFileSelect}
                className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#ED1D24] file:text-white file:cursor-pointer"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setShowIngest(null)}
                  className="text-xs text-gray-500 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {showIngest === 'url' && (
            <div className="bg-[#0a1a3a] border border-[#1a3d6b]/40 rounded p-2 space-y-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://pt.wikipedia.org/..."
                className="w-full text-xs bg-[#071428] border border-[#1a3d6b]/40 text-white rounded px-2 py-1.5 focus:border-[#ED1D24] focus:outline-none placeholder:text-gray-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUrlSubmit();
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowIngest(null)}
                  className="text-xs text-gray-500 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || isIngesting}
                  className="text-xs bg-[#ED1D24] text-white px-2 py-1 rounded hover:bg-[#F0141E] disabled:opacity-50 cursor-pointer"
                >
                  Ingerir
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 px-1">{error}</p>
          )}

          {isIngesting && (
            <div className="flex items-center gap-2 text-xs text-blue-400 px-1">
              <Loader className="w-3 h-3 animate-spin" />
              Processando...
            </div>
          )}

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {isLoading && documents.length === 0 && (
              <p className="text-xs text-gray-500 px-1">Carregando...</p>
            )}

            {!isLoading && documents.length === 0 && (
              <p className="text-xs text-gray-500 px-1">Nenhum documento.</p>
            )}

            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-start gap-2 bg-[#0a1a3a] border border-[#1a3d6b]/30 rounded p-2"
              >
                <span
                  className={`block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${STATUS_DOT[doc.status] ?? 'bg-gray-500'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 truncate">
                    {doc.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] ${STATUS_COLOR[doc.status] ?? 'text-gray-500'}`}
                    >
                      {STATUS_LABEL[doc.status] ?? doc.status}
                    </span>
                    {doc.status === 'COMPLETED' && doc.totalChunks > 0 && (
                      <span className="text-[10px] text-gray-500">
                        {doc.totalChunks} chunks
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                  title="Remover documento"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

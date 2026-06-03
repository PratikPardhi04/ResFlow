import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

function FileUpload({ onFileSelect, isUploading = false, accept = { 'application/pdf': ['.pdf'] } }) {
  const [file, setFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        if (onFileSelect) onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
        transition-all duration-300 group
        ${isDragActive
          ? 'border-cyan-400 bg-cyan-500/10 shadow-glow-cyan'
          : file
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-white/[0.1] bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/5'
        }
        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300 font-medium">{file.name}</span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={removeFile}
                className="p-1 rounded-full hover:bg-white/[0.1] transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-rose-400" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/15 transition-colors"
            >
              <Upload className="w-7 h-7 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-300 font-medium">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF files up to 10MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploading overlay */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-dark/60 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-cyan-400 font-medium">Analyzing resume...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default FileUpload;

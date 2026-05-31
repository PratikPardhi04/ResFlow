import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { uploadResume, parseRawText } from '../lib/api';

function LoadingOverlay({ message }) {
  return (
    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center rounded-xl">
      <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6"></div>
      <h3 className="text-xl font-display text-white mb-2">{message}</h3>
      <p className="text-zinc-400 font-mono text-sm max-w-sm">This may take up to 30 seconds as our AI models analyze 5-dimensional metrics.</p>
    </div>
  );
}

export default function ResumeUpload() {
  const [tab, setTab] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await uploadResume(formData);
      navigate(`/resume/${res.resume.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await parseRawText({ text });
      navigate(`/resume/${res.resume.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Parsing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-12 items-center px-4">
      <div className="w-full max-w-2xl relative">
        <header className="mb-8 pl-1 border-l-2 border-accent/50">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Initialize Profile</h1>
          <p className="text-sm font-mono text-zinc-400">Upload document or paste text for structural ingestion</p>
        </header>

        <div className="flex gap-1 mb-1 border-b border-zinc-800">
          <button 
            onClick={() => setTab('upload')} 
            className={`px-6 py-3 font-mono text-sm relative ${tab === 'upload' ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Upload File
            {tab === 'upload' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
          <button 
            onClick={() => setTab('paste')} 
            className={`px-6 py-3 font-mono text-sm relative ${tab === 'paste' ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Paste Text
            {tab === 'paste' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
        </div>

        <div className="bg-surface border border-zinc-800 rounded-b-xl rounded-tr-xl p-8 relative overflow-hidden min-h-[400px]">
          <AnimatePresence>
            {isLoading && <LoadingOverlay message="ResFlow is analyzing your profile..." />}
          </AnimatePresence>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded">
              {error}
            </div>
          )}

          {tab === 'upload' ? (
            <div className="h-full flex flex-col justify-center">
              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition flex justify-center items-center flex-col h-[300px]
                    ${isDragActive ? 'border-accent bg-accent/5' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50'}`}
                >
                  <input {...getInputProps()} />
                  <Upload className={`mb-4 ${isDragActive ? 'text-accent' : 'text-zinc-500'}`} size={32} />
                  <p className="text-white font-medium mb-1">Drag & drop your file here, or click to browse</p>
                  <p className="text-zinc-500 text-sm font-mono">Supports PDF, DOCX (Max 10MB)</p>
                </div>
              ) : (
                <div className="flex flex-col h-[300px] justify-center items-center border border-zinc-800 rounded-xl bg-zinc-900/30 p-8">
                  <div className="w-16 h-16 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4 border border-accent/20">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-white font-medium mb-1 truncate max-w-full px-4">{file.name}</h3>
                  <p className="text-zinc-500 text-sm font-mono mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setFile(null)}
                      className="px-4 py-2 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-sm font-mono rounded transition flex gap-2 items-center"
                    >
                      <X size={16} /> Clear
                    </button>
                    <button 
                      onClick={handleUpload}
                      className="px-6 py-2 bg-accent hover:bg-accent/90 text-background font-bold text-sm font-mono rounded shadow-[0_0_15px_rgba(110,231,183,0.2)] transition"
                    >
                      Parse Resume →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col h-[300px]">
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="flex-1 w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-zinc-300 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition mb-4"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-500">{text.length} characters</span>
                <button 
                  onClick={handlePaste}
                  disabled={!text.trim()}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-background font-bold text-sm font-mono rounded transition"
                >
                  Parse Text →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

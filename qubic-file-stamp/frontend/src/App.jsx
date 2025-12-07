import { useState } from "react";
import Dashboard from "./Dashboard";

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const [currentPage, setCurrentPage] = useState("stamp"); // "stamp" or "dashboard"
  const [uploadedFile, setUploadedFile] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [owner, setOwner] = useState("");
  const [stampResult, setStampResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveVerify, setDragActiveVerify] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Drag and drop handlers for stamp
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Drag and drop handlers for verify
  const handleDragVerify = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveVerify(true);
    } else if (e.type === "dragleave") {
      setDragActiveVerify(false);
    }
  };

  const handleDropVerify = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveVerify(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setVerifyFile(e.dataTransfer.files[0]);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Stamp file function
  const handleStampFile = async () => {
    if (!uploadedFile) {
      alert("Please select a file to stamp");
      return;
    }

    setLoading(true);
    setError(null);
    setStampResult(null);
    setShowSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("owner", owner || "Anonymous");

      const response = await fetch(`${API_URL}/stamp`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStampResult(data.stamp);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to stamp file");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify file function
  const handleVerifyFile = async () => {
    if (!verifyFile) {
      alert("Please select a file to verify");
      return;
    }

    setLoading(true);
    setError(null);
    setVerifyResult(null);

    try {
      const formData = new FormData();
      formData.append("file", verifyFile);

      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setVerifyResult(data);
      } else {
        setError(data.error || "Failed to verify file");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show Dashboard if selected
  if (currentPage === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h2 className="text-white text-xl font-bold tracking-wide">
                QUBIC FILE STAMP
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage("stamp")}
                  className="px-6 py-2 rounded-full border-2 border-white/30 text-white font-medium transition-all hover:bg-white/20 hover:border-white"
                >
                  🏠 Home
                </button>
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className="px-6 py-2 rounded-full border-2 border-white bg-white/20 text-white font-medium"
                >
                  📊 Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>
        <Dashboard />
      </div>
    );
  }

  // Show Stamp/Verify Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-celebrate bg-green-500 text-white rounded-full p-8 shadow-2xl">
            <svg
              className="w-24 h-24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                className="animate-checkmark"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                }}
              />
            </svg>
          </div>
        </div>
      )}

      <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-white text-xl font-bold tracking-wide">
              QUBIC FILE STAMP
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPage("stamp")}
                className="px-6 py-2 rounded-full border-2 border-white bg-white/20 text-white font-medium"
              >
                🏠 Home
              </button>
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="px-6 py-2 rounded-full border-2 border-white/30 text-white font-medium transition-all hover:bg-white/20 hover:border-white"
              >
                📊 Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 animate-fadeIn">
          Blockchain File Authentication
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-slideIn">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* UPLOAD + STAMP SECTION */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slideIn">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <span className="bg-purple-100 text-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              📝
            </span>
            Stamp Your File
          </h2>

          <input
            type="text"
            placeholder="Your Name (optional)"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full px-4 py-3 mb-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
          />

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? "border-purple-500 bg-purple-50"
                : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-25"
            }`}
          >
            <input
              type="file"
              onChange={(e) => setUploadedFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="pointer-events-none">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {dragActive ? "Drop file here" : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          </div>

          {/* File Preview */}
          {uploadedFile && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 animate-slideIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-red-500 hover:text-red-700 font-bold text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleStampFile}
            disabled={loading || !uploadedFile}
            className={`w-full mt-6 py-4 rounded-lg font-semibold text-white text-lg transition-all ${
              loading || !uploadedFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Stamping to Blockchain...
              </span>
            ) : (
              "🔐 Stamp File to Blockchain"
            )}
          </button>
        </div>

        {/* STAMP RESULT SECTION */}
        {stampResult && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-200 animate-slideIn">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <span className="text-3xl mr-3">✅</span>
              Stamp Successful!
            </h2>

            <div className="space-y-3 text-gray-700">
              <div className="flex items-start">
                <span className="font-semibold min-w-32">File Hash:</span>
                <span className="text-sm font-mono break-all">
                  {stampResult.fileHash}
                </span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-32">Owner:</span>
                <span>{stampResult.owner}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-32">Timestamp:</span>
                <span>{new Date(stampResult.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-32">Transaction:</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${stampResult.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 underline break-all"
                >
                  View on PolygonScan
                </a>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-32">Stamp ID:</span>
                <span className="text-sm">{stampResult.id}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage("dashboard")}
              className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              📊 View in Dashboard
            </button>
          </div>
        )}

        {/* VERIFY SECTION */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideIn">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              🔍
            </span>
            Verify File Authenticity
          </h2>

          {/* Drag and Drop Zone for Verify */}
          <div
            onDragEnter={handleDragVerify}
            onDragLeave={handleDragVerify}
            onDragOver={handleDragVerify}
            onDrop={handleDropVerify}
            className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActiveVerify
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-25"
            }`}
          >
            <input
              type="file"
              onChange={(e) => setVerifyFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="pointer-events-none">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {dragActiveVerify
                  ? "Drop file here"
                  : "Drag & drop file to verify"}
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          </div>

          {/* File Preview for Verify */}
          {verifyFile && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 animate-slideIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {verifyFile.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(verifyFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVerifyFile(null)}
                  className="text-red-500 hover:text-red-700 font-bold text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleVerifyFile}
            disabled={loading || !verifyFile}
            className={`w-full mt-6 py-4 rounded-lg font-semibold text-white text-lg transition-all ${
              loading || !verifyFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              "🔍 Check Authenticity"
            )}
          </button>

          {/* Verification Result */}
          {verifyResult && (
            <div className="mt-6 animate-slideIn">
              {verifyResult.authentic ? (
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                  <div className="flex items-center mb-4">
                    <span className="text-5xl mr-3">✅</span>
                    <span className="text-2xl font-bold text-green-700">
                      Authentic File
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Owner:</strong> {verifyResult.stamp.owner}
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(verifyResult.stamp.timestamp).toLocaleString()}
                    </p>
                    <a
                      href={`https://amoy.polygonscan.com/tx/${verifyResult.stamp.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                    >
                      View on PolygonScan
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-300">
                  <div className="flex items-center">
                    <span className="text-5xl mr-3">❌</span>
                    <span className="text-2xl font-bold text-red-700">
                      File Not Found
                    </span>
                  </div>
                  <p className="mt-3 text-gray-600">
                    This file has not been stamped on the blockchain.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

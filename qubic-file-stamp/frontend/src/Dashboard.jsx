import jsPDF from "jspdf";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const [stamps, setStamps] = useState([]);
  const [filteredStamps, setFilteredStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [error, setError] = useState(null);

  // Fetch all stamps
  useEffect(() => {
    fetchStamps();
  }, []);

  // Filter stamps when search/filter changes
  useEffect(() => {
    filterStamps();
  }, [stamps, searchTerm, ownerFilter]);

  const fetchStamps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/stamps`);
      const data = await response.json();

      if (data.success) {
        setStamps(data.stamps);
        setFilteredStamps(data.stamps);
      } else {
        setError(data.error || "Failed to fetch stamps");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterStamps = () => {
    let filtered = [...stamps];

    // Filter by search term (filename)
    if (searchTerm) {
      filtered = filtered.filter((stamp) =>
        stamp.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by owner
    if (ownerFilter) {
      filtered = filtered.filter((stamp) =>
        stamp.owner.toLowerCase().includes(ownerFilter.toLowerCase())
      );
    }

    setFilteredStamps(filtered);
  };

  const downloadCertificate = async (stamp) => {
    try {
      // Create new PDF
      const doc = new jsPDF();

      // Set colors and fonts
      const primaryColor = [74, 144, 226];
      const textColor = [51, 51, 51];

      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.text("FILE STAMP CERTIFICATE", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text("Blockchain-Verified Document Authentication", 105, 30, {
        align: "center",
      });

      // Reset text color for body
      doc.setTextColor(...textColor);

      // Certificate body
      let yPos = 55;

      // File Information Section
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Document Information", 20, yPos);

      yPos += 10;
      doc.setFontSize(11);
      doc.setFont(undefined, "normal");

      doc.text("File Name:", 20, yPos);
      doc.setFont(undefined, "bold");
      doc.text(stamp.fileName, 60, yPos);
      doc.setFont(undefined, "normal");

      yPos += 8;
      doc.text("Owner:", 20, yPos);
      doc.setFont(undefined, "bold");
      doc.text(stamp.owner, 60, yPos);
      doc.setFont(undefined, "normal");

      yPos += 8;
      doc.text("Timestamp:", 20, yPos);
      doc.text(new Date(stamp.timestamp).toLocaleString(), 60, yPos);

      yPos += 15;

      // Blockchain Information Section
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Blockchain Verification", 20, yPos);

      yPos += 10;
      doc.setFontSize(11);
      doc.setFont(undefined, "normal");

      doc.text("Stamp ID:", 20, yPos);
      doc.setFontSize(9);
      doc.text(stamp.id, 60, yPos);
      doc.setFontSize(11);

      yPos += 8;
      doc.text("File Hash (SHA-256):", 20, yPos);
      doc.setFontSize(8);
      doc.text(stamp.fileHash, 20, yPos + 5);
      doc.setFontSize(11);

      yPos += 15;
      doc.text("Transaction ID:", 20, yPos);
      doc.setFontSize(8);
      doc.text(stamp.txId, 20, yPos + 5);
      doc.setFontSize(11);

      yPos += 15;
      doc.text("Blockchain Network:", 20, yPos);
      doc.setFont(undefined, "bold");
      doc.text("Polygon Amoy Testnet", 70, yPos);
      doc.setFont(undefined, "normal");

      yPos += 8;
      doc.text("Explorer URL:", 20, yPos);
      doc.setTextColor(...primaryColor);
      doc.textWithLink("View on PolygonScan", 60, yPos, {
        url: `https://amoy.polygonscan.com/tx/${stamp.txId}`,
      });
      doc.setTextColor(...textColor);

      // Generate QR Code
      const qrData = `https://amoy.polygonscan.com/tx/${stamp.txId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
      });

      // Add QR Code to PDF
      doc.addImage(qrCodeDataUrl, "PNG", 150, 100, 40, 40);
      doc.setFontSize(9);
      doc.text("Scan to verify", 155, 145, { align: "left" });

      // Certificate validity statement
      yPos = 180;
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPos - 5, 180, 30, "F");

      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.text(
        "This certificate proves that the above document was cryptographically",
        105,
        yPos,
        { align: "center" }
      );
      doc.text(
        "stamped on the Polygon blockchain at the specified timestamp.",
        105,
        yPos + 6,
        { align: "center" }
      );
      doc.text(
        "The file hash is permanently recorded and cannot be altered.",
        105,
        yPos + 12,
        { align: "center" }
      );

      // Footer
      yPos = 270;
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.setTextColor(150, 150, 150);
      doc.text("Generated by QUBIC FILE STAMP", 20, yPos);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos + 5);
      doc.text("Powered by Blockchain Technology", 170, yPos, {
        align: "right",
      });

      // Save PDF
      doc.save(`certificate-${stamp.fileName}-${stamp.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF certificate. Check console for details.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Dashboard
        </h1>
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="animate-spin h-16 w-16 text-purple-600 mb-4"
            viewBox="0 0 24 24"
          >
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
          <p className="text-lg text-gray-600">Loading stamps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Dashboard
        </h1>
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        📊 Stamp Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white animate-slideIn">
          <div className="text-5xl font-bold mb-2">{stamps.length}</div>
          <div className="text-purple-100 text-sm font-medium">
            Total Stamps
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white animate-slideIn">
          <div className="text-5xl font-bold mb-2">
            {new Set(stamps.map((s) => s.owner)).size}
          </div>
          <div className="text-blue-100 text-sm font-medium">Unique Owners</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white animate-slideIn">
          <div className="text-5xl font-bold mb-2">{filteredStamps.length}</div>
          <div className="text-green-100 text-sm font-medium">
            Filtered Results
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-slideIn">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="text-2xl mr-2">🔍</span>
          Search & Filter
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
          />
          <input
            type="text"
            placeholder="Filter by owner..."
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
          />
          <button
            onClick={() => {
              setSearchTerm("");
              setOwnerFilter("");
            }}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stamps List */}
      <div className="space-y-6">
        {filteredStamps.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-600">
              No stamps found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          filteredStamps.map((stamp, index) => (
            <div
              key={stamp.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all animate-slideIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b-2 border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-2 md:mb-0">
                  <span className="text-2xl mr-2">📄</span>
                  {stamp.fileName}
                </h3>
                <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {stamp.owner}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 mr-2">
                    Stamp ID:
                  </span>
                  <span className="text-sm font-mono text-gray-600">
                    {stamp.id.substring(0, 16)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(stamp.id)}
                    className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    📋
                  </button>
                </div>

                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 mr-2">
                    File Hash:
                  </span>
                  <span className="text-sm font-mono text-gray-600">
                    {stamp.fileHash.substring(0, 16)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(stamp.fileHash)}
                    className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    📋
                  </button>
                </div>

                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 mr-2">
                    Timestamp:
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(stamp.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 mr-2">
                    Transaction:
                  </span>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${stamp.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline text-sm transition-colors"
                  >
                    View on PolygonScan ↗
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => downloadCertificate(stamp)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  📥 Download Certificate
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

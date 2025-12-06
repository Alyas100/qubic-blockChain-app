import { useState } from "react";

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>QUBIC FILE STAMP</h1>

      {/* UPLOAD + STAMP SECTION */}
      <div style={styles.card}>
        <h2>Upload File</h2>

        <input
          type="file"
          onChange={(e) => setUploadedFile(e.target.files[0])}
        />

        <button style={styles.button}>Stamp File</button>
      </div>

      {/* STAMP RESULT SECTION */}
      <div style={styles.card}>
        <h2>Stamp Result</h2>

        <p>
          <strong>File Hash:</strong> 3f8a7e9b2c1d4...
        </p>
        <p>
          <strong>Owner:</strong> Alice
        </p>
        <p>
          <strong>Timestamp:</strong> 2025-12-05 17:30
        </p>
        <p>
          <strong>Tx ID:</strong> 0x9a3b7f...
        </p>
      </div>

      {/* VERIFY SECTION */}
      <div style={styles.card}>
        <h2>Verify File</h2>

        <input type="file" onChange={(e) => setVerifyFile(e.target.files[0])} />

        <button style={styles.button}>Check Authenticity</button>

        <p>
          <strong>Verification Result:</strong>
        </p>
        <p>✅ Authentic / ❌ Not Found</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  card: {
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    background: "#fafafa",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#4A90E2",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
};

import React, { useState } from 'react';
import { FaCloudUploadAlt, FaFileCsv, FaCheckCircle } from 'react-icons/fa';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccess(false);
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);

    // Simulate API Call
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setFile(null);
      // In real app: use FormData and axios.post('/api/products/upload', formData)
    }, 2000);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Bulk Product Import</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Upload a CSV or Excel file to update inventory or add new products in bulk.
        Ensure your columns match: Name, SKU, Price, Stock, Category.
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
        <FaCloudUploadAlt className="text-6xl text-gray-300 mb-4" />

        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />

        <label htmlFor="file-upload" className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:border-nyoranixRed transition-colors">
          Select File
        </label>

        {file && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-700 bg-white px-4 py-2 rounded border">
            <FaFileCsv className="text-green-600" /> {file.name}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
            !file ? 'bg-gray-300 cursor-not-allowed' : 'bg-nyoranixRed hover:bg-red-700 shadow-lg'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Inventory'}
        </button>
      </div>

      {success && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
          <FaCheckCircle /> Bulk upload completed successfully! 150 products updated.
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
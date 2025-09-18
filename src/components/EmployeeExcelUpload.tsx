import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { DatabaseService, supabase } from '../lib/supabase';

interface EmployeeExcelUploadProps {
  onUploadComplete?: () => void;
  currentUser: any;
}

const EmployeeExcelUpload: React.FC<EmployeeExcelUploadProps> = ({
  onUploadComplete,
  currentUser
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [importId, setImportId] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid Excel file (.xlsx, .xls) or CSV file.');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');
    setSuccessMessage('');
    setUploadProgress(0);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      setUploadProgress(25);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `employee_uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee_uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Failed to upload file: ' + uploadError.message);
      }

      setUploadProgress(50);
      setUploadStatus('processing');

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('employee_uploads')
        .getPublicUrl(filePath);

      setUploadProgress(75);

      // Call the Edge Function to process the Excel file (it will create its own import record)
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('employee_bulk_import', {
          body: {
            file_url: publicUrl,
            uploaded_by: currentUser.id
          }
        });

      if (processError) {
        throw new Error('Failed to process file: ' + processError.message);
      }

      setUploadProgress(100);
      setUploadStatus('completed');
      
      if (processResult.processed !== undefined) {
        setSuccessMessage(`Employee data imported successfully! ${processResult.processed} employees processed, ${processResult.upserted} records upserted.`);
      } else {
        throw new Error(processResult.error || 'Processing failed');
      }
      
      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'An error occurred during upload');
      
      // Update import record status to error if we have an import ID
      if (importId) {
        try {
          await DatabaseService.updateRecord('employee_imports', importId, {
            status: 'error'
          });
        } catch (updateError) {
          console.error('Failed to update import record status:', updateError);
        }
      }
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template matching the Edge Function expected fields
    const csvContent = `first_name,last_name,email,phone,hired_at
John,Doe,john.doe@company.com,1234567890,2024-01-15
Jane,Smith,jane.smith@company.com,0987654321,2024-02-01
Bob,Johnson,bob.johnson@company.com,1122334455,2024-03-10`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="text-green-600" />
            Employee Excel Upload
          </h1>
          <p className="text-gray-600">Bulk import employee data from Excel or CSV files</p>
        </div>
        
        <button
          onClick={downloadTemplate}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          Download Template
        </button>
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Upload Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Supported formats: Excel (.xlsx, .xls) and CSV (.csv)</li>
          <li>• Required columns: first_name, last_name, email</li>
          <li>• Optional columns: phone, hired_at (or start_date, hire_date)</li>
          <li>• Download the template above for the correct format</li>
          <li>• Duplicate emails will be updated, new ones will be created</li>
        </ul>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : uploadStatus === 'completed'
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadStatus === 'idle' && (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop your Excel file here, or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Supports .xlsx, .xls, and .csv files up to 10MB
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
            >
              Choose File
            </label>
          </>
        )}

        {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
          <div className="space-y-4">
            <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <h3 className="text-lg font-medium text-gray-900">
              {uploadStatus === 'uploading' ? 'Uploading file...' : 'Processing employee data...'}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-600">{uploadProgress}% complete</p>
          </div>
        )}

        {uploadStatus === 'completed' && (
          <div className="space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="text-lg font-medium text-green-900">Upload Completed!</h3>
            <p className="text-green-700">{successMessage}</p>
            <button
              onClick={() => {
                setUploadStatus('idle');
                setUploadProgress(0);
                setSuccessMessage('');
                setImportId(null);
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h3 className="text-lg font-medium text-red-900">Upload Failed</h3>
            <p className="text-red-700">{errorMessage}</p>
            <button
              onClick={() => {
                setUploadStatus('idle');
                setUploadProgress(0);
                setErrorMessage('');
                setImportId(null);
              }}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Upload History */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h2>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>Upload history will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeExcelUpload;

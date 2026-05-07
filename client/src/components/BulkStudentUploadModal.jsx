import { useState } from "react";
import * as XLSX from "xlsx";
import { useAddBulkStudentsMutation } from "../features/api/apiSlice";
import { X, UploadCloud, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const BulkStudentUploadModal = ({ isOpen, onClose }) => {
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addBulkStudents, { isLoading }] = useAddBulkStudentsMutation();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      
      const formattedData = json.map((row) => ({
        name: row["Name"] || "",
        email: row["Email"] || "",
        rollNumber: row["Roll Number"] || "",
        program: row["Program"] || "BTECH",
        branchCode: row["Branch Code"] || "",
        batch: row["Batch"] || "",
        semester: row["Semester"] || "",
        password: row["Password"] || "password123", 
      }));

      setPreviewData(formattedData);
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCellChange = (index, field, value) => {
    const newData = [...previewData];
    newData[index][field] = value;
    setPreviewData(newData);
  };

  const handleSubmit = async () => {
    if (previewData.length === 0) return toast.error("No data to upload.");

    try {
      await addBulkStudents({ students: previewData }).unwrap();
      toast.success(`${previewData.length} students uploaded successfully!`);
      setPreviewData([]);
      onClose();
    } catch (err) {
      toast.error(err.data?.error || "Failed to upload students. Check format.");
    }
  };

  const handleClose = () => {
    setPreviewData([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bulk Upload Students</h2>
            <p className="text-sm text-slate-500 mt-1">Upload an Excel file with columns: Name, Email, Roll Number, Program, Branch Code, Batch, Semester.</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {previewData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
              <UploadCloud size={48} className="text-blue-500 mb-4" />
              <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Select Excel File
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
              </label>
              {isProcessing && <p className="mt-4 text-slate-500 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</p>}
            </div>
          ) : (
            <div className="flex-1 overflow-auto border rounded-lg">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-semibold text-slate-600">Name</th>
                    <th className="p-3 font-semibold text-slate-600">Email</th>
                    <th className="p-3 font-semibold text-slate-600">Roll No</th>
                    <th className="p-3 font-semibold text-slate-600">Branch</th>
                    <th className="p-3 font-semibold text-slate-600">Batch</th>
                    <th className="p-3 font-semibold text-slate-600">Sem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="p-1"><input value={row.name} onChange={(e) => handleCellChange(index, "name", e.target.value)} className="w-full p-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" /></td>
                      <td className="p-1"><input value={row.email} onChange={(e) => handleCellChange(index, "email", e.target.value)} className="w-full p-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" /></td>
                      <td className="p-1"><input value={row.rollNumber} onChange={(e) => handleCellChange(index, "rollNumber", e.target.value)} className="w-full p-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" /></td>
                      <td className="p-1"><input value={row.branchCode} onChange={(e) => handleCellChange(index, "branchCode", e.target.value)} className="w-20 p-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none uppercase" /></td>
                      <td className="p-1"><input value={row.batch} onChange={(e) => handleCellChange(index, "batch", e.target.value)} className="w-24 p-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" /></td>
                      <td className="p-1"><input value={row.semester} onChange={(e) => handleCellChange(index, "semester", e.target.value)} className="w-16 p-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
        {previewData.length > 0 && (
          <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-xl">
            <span className="text-slate-600 font-medium">{previewData.length} records ready</span>
            <div className="flex gap-3">
              <button onClick={() => setPreviewData([])} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">Cancel</button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg transition-all disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isLoading ? "Saving to DB..." : "Confirm & Upload"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BulkStudentUploadModal;
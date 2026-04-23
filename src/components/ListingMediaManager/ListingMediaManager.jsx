// import React, { useState } from "react";
// import JSZip from "jszip";
// import ExcelJS from "exceljs";
// import { UploadCloud } from "lucide-react";

// const ListingMediaManager = ({ listingData }) => {
//   const [stockId, setStockId] = useState("");
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [zipBlob, setZipBlob] = useState(null);
//   const [isGenerating, setIsGenerating] = useState(false);

//   // -------------------------------
//   // Prevent duplicate file selection
//   // -------------------------------
//   const addUniqueFiles = (newFiles, prevFiles) => {
//     const existing = new Set(prevFiles.map(f => `${f.name}_${f.size}`));
//     return [
//       ...prevFiles,
//       ...newFiles.filter(f => !existing.has(`${f.name}_${f.size}`))
//     ];
//   };

//   const handleFileChange = (e, setFiles) => {
//     const selected = Array.from(e.target.files);
//     setFiles(prev => addUniqueFiles(selected, prev));
//     setZipBlob(null);
//   };

//   // -------------------------------
//   // Excel generation with Styling
//   // -------------------------------
//   const createExcelReport = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Listing_Report");

//     const header = [
//       "Metal Type","Gold %","Weight (g)","Diamond Type","Carat Weight",
//       "Gold Cost","Labor Cost","Main Diamond Cost","SIDE DIAMOND WT",
//       "Side Diamond Cost","SMALL DIAMOND WT","small diamond cost",
//       "Shipping Cost","commission","PROFIT","FINAL PRICE INR",
//       "LISTING INR","PRICE $","COST PRICE"
//     ];

//     // 1. Add Header Row
//     const headerRow = sheet.addRow(header);

//     // 2. Style Header (Yellow Background, Bold, Centered)
//     headerRow.eachCell((cell) => {
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FFFF00' } // Yellow
//       };
//       cell.font = { bold: true };
//       cell.alignment = { vertical: 'middle', horizontal: 'center' };
//       cell.border = {
//         top: { style: 'thin' },
//         left: { style: 'thin' },
//         bottom: { style: 'thin' },
//         right: { style: 'thin' }
//       };
//     });

//     // 3. Add Data Row
//     const dataRow = sheet.addRow([
//       listingData.type,
//       listingData.gPct ? listingData.gPct * 100 + "%" : "0%",
//       listingData.rowWeight,
//       listingData.dType,
//       listingData.mainCarat || 0,
//       listingData.goldCost,
//       listingData.laborCost,
//       listingData.mainCost,
//       listingData.sideCarat || 0,
//       listingData.sideCost,
//       listingData.smallCarat || 0,
//       listingData.smallCost,
//       listingData.shipping,
//       listingData.commission,
//       listingData.profit,
//       listingData.finalINR,
//       listingData.listingINR,
//       listingData.priceUSD,
//       listingData.costPrice
//     ]);

//     // 4. Style Data Row (Centered)
//     dataRow.eachCell((cell) => {
//       cell.alignment = { vertical: 'middle', horizontal: 'center' };
//       cell.border = {
//         top: { style: 'thin' },
//         left: { style: 'thin' },
//         bottom: { style: 'thin' },
//         right: { style: 'thin' }
//       };
//     });

//     // 5. Auto-adjust Column Width based on Header Text length
//     sheet.columns.forEach((column, i) => {
//       const headerText = header[i];
//       column.width = headerText.length < 12 ? 15 : headerText.length + 5;
//     });

//     return workbook.xlsx.writeBuffer();
//   };

//   // -------------------------------
//   // ZIP creation
//   // -------------------------------
//   const handlePrepareListing = async () => {
//     if (!stockId) return alert("Enter Stock ID");
//     setIsGenerating(true);

//     try {
//       const zip = new JSZip();
//       const root = zip.folder(stockId);

//       const excel = await createExcelReport();
//       root.file(`${stockId}_Report.xlsx`, excel);

//       if (images.length) {
//         const imgFolder = root.folder("images");
//         images.forEach(f => imgFolder.file(f.name, f));
//       }

//       if (videos.length) {
//         const vidFolder = root.folder("videos");
//         videos.forEach(f => vidFolder.file(f.name, f));
//       }

//       const blob = await zip.generateAsync({ type: "blob" });
//       setZipBlob(blob);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleDownload = () => {
//     if (!zipBlob) return;
//     const fileName = `${stockId}.zip`;
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(zipBlob);
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);

//     setTimeout(() => {
//       setStockId("");
//       setImages([]);
//       setVideos([]);
//       setZipBlob(null);
//     }, 100);
//   };

//   const UploadBox = ({ title, files, accept, onChange }) => (
//     <label className="border-slate-300 border cursor-pointer rounded-xl p-4 bg-white transition block">
//       <input hidden multiple type="file" accept={accept} onChange={onChange} />
//       <div className="flex items-center gap-2 mb-2">
//         <UploadCloud className="w-4 h-4 text-slate-600" />
//         <span className="text-xs font-black uppercase text-slate-500">{title}</span>
//         <span className="text-[10px] text-slate-400">({files.length})</span>
//       </div>
//       {files.length === 0 ? (
//         <p className="text-[11px] text-slate-400 italic">Click to choose files</p>
//       ) : (
//         <div className="max-h-24 overflow-y-auto space-y-1">
//           {files.map((f, i) => (
//             <p key={i} className="text-[10px] text-slate-600 truncate">• {f.name}</p>
//           ))}
//         </div>
//       )}
//     </label>
//   );

//   return (
//     <div className="bg-slate-100 rounded-2xl p-4 space-y-4 shadow-sm">
//       <div className="flex items-center gap-3">
//         <input
//           placeholder="STOCK ID"
//           value={stockId}
//           onChange={e => setStockId(e.target.value.toUpperCase())}
//           className="w-40 px-3 py-2 font-bold text-slate rounded-lg text-xs border border-slate-300 bg-white"
//         />
//         {!zipBlob ? (
//           <button
//             onClick={handlePrepareListing}
//             disabled={!stockId}
//             className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
//           >
//             {isGenerating ? "CREATING..." : "GENERATE"}
//           </button>
//         ) : (
//           <button
//             onClick={handleDownload}
//             className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold"
//           >
//             DOWNLOAD
//           </button>
//         )}
//       </div>
//       <div className="grid md:grid-cols-2 gap-4">
//         <UploadBox title="Images" files={images} accept="image/*" onChange={e => handleFileChange(e, setImages)} />
//         <UploadBox title="Videos" files={videos} accept="video/*" onChange={e => handleFileChange(e, setVideos)} />
//       </div>
//     </div>
//   );
// };

// export default ListingMediaManager;
import React, { useState } from "react";
import JSZip from "jszip";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ListingMediaManager = ({ 
  allListingData, 
  itemSpecs, 
  params, 
  setParams, 
  setItemSpecs, 
  setAllListingData 
}) => {
  const [stockId, setStockId] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zipBlob, setZipBlob] = useState(null);

  const resetUI = () => {
    setStockId("");
    setImages([]);
    setVideos([]);
    setZipBlob(null);
  };

  const handleFileChange = (e, setter) => {
    setter(Array.from(e.target.files));
  };

  const handleLoadJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.stockId) setStockId(data.stockId);
        if (data.params) setParams(data.params);
        if (data.itemSpecs) setItemSpecs(data.itemSpecs);
        if (data.allListingData) setAllListingData(data.allListingData);
        alert("Full project data loaded to screen!");
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

const generateExcelBuffer = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Product Analysis");

    sheet.columns = [
      { width: 32 }, { width: 18 }, { width: 15 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 18 }, { width: 18 }, { width: 15 }, { width: 18 }
    ];

    let currentRow = 2;

    // --- SECTION 1: MASTER RATES ---
    const rateHeader = sheet.getRow(currentRow++);
    const rateCell = rateHeader.getCell(1);
    rateCell.value = "SECTION 1: GLOBAL MASTER RATES";
    rateCell.font = { bold: true, size: 12, underline: true, color: { argb: 'FF006400' } };
    rateCell.alignment = { horizontal: 'left' }; // TITLE LEFT

    Object.entries(params).forEach(([key, value]) => {
      const row = sheet.getRow(currentRow++);
      row.getCell(1).value = key;
      row.getCell(2).value = value;
      row.getCell(1).font = { bold: true, color: { argb: 'FF008000' } };
      // DATA CENTERED
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    currentRow += 2;

    // --- SECTION 2: ITEM SPECIFICATIONS ---
    const weightHeader = sheet.getRow(currentRow++);
    const weightCell = weightHeader.getCell(1);
    weightCell.value = "SECTION 2: ITEM WEIGHTS & SPECIFICATIONS";
    weightCell.font = { bold: true, size: 12, underline: true, color: { argb: 'FF00008B' } };
    weightCell.alignment = { horizontal: 'left' }; // TITLE LEFT

    Object.entries(itemSpecs).forEach(([key, value]) => {
      const row = sheet.getRow(currentRow++);
      row.getCell(1).value = key;
      row.getCell(2).value = value || 0;
      row.getCell(1).font = { bold: true, color: { argb: 'FF0000FF' } };
      // DATA CENTERED
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    currentRow += 3;

    // --- SECTION 3: CALCULATION TABLE ---
    const tableTitle = sheet.getRow(currentRow++);
    const titleCell = tableTitle.getCell(1);
    titleCell.value = "SECTION 3: FULL COST & PRICING BREAKDOWN";
    titleCell.font = { bold: true, size: 12 };
    titleCell.alignment = { horizontal: 'left' }; // TITLE LEFT

    const headerLabels = [
      "Metal Type", "Diamond Type", "Weight (g)", "Gold Cost", "Labor Cost",
      "Main Stone", "Side Stone", "Small Stone", "Shipping", "Etsy Comm.",
      "Profit (₹)", "Final INR", "Listing INR(₹)", "Price ($)", "Cost Price"
    ];

    const headerRow = sheet.getRow(currentRow++);
    headerRow.values = headerLabels;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { horizontal: 'center', vertical: 'middle' }; // TABLE HEADER CENTERED
    });

  allListingData.forEach((data) => {
  const row = sheet.getRow(currentRow++);
  
  // Use Number() or parseFloat() to ensure Excel sees these as numbers, not text
  row.values = [
    data.type, 
    data.dType, 
    Number(data.rowWeight) || 0, 
    Number(data.goldCost) || 0, 
    Number(data.laborCost) || 0,
    Number(data.mainCost) || 0, 
    Number(data.sideCost) || 0, 
    Number(data.smallCost) || 0, 
    Number(data.shipping) || 0,
    Number(data.commission) || 0, 
    Number(data.profit) || 0, 
    Number(data.finalINR) || 0, 
    Number(data.listingINR) || 0,
    Number(data.priceUSD) || 0, 
    Number(data.costPrice) || 0
  ];

  row.eachCell((cell, colNumber) => {
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Apply Currency Formatting to columns starting from Gold Cost (Col 4) onwards
    if (colNumber >= 4 && colNumber !== 14) {
      cell.numFmt = '"₹"#,##0.00'; 
    }
    // Apply USD format for Price $ column (Col 14)
    if (colNumber === 14) {
      cell.numFmt = '"$"#,##0.00';
    }

    if (colNumber === 1 || colNumber === 14) cell.font = { bold: true };
  });
});
    return await workbook.xlsx.writeBuffer();
  };    
  const handlePrepareListing = async () => {
    if (!stockId) return;
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      const excelBuffer = await generateExcelBuffer();
      zip.file(`${stockId}_Report.xlsx`, excelBuffer);

      const fullProjectData = { stockId, params, itemSpecs, allListingData };
      zip.file(`${stockId}_backup_data.json`, JSON.stringify(fullProjectData, null, 2));

      images.forEach((f, i) => zip.file(`IMG_${i+1}_${f.name}`, f));
      videos.forEach((f, i) => zip.file(`VID_${i+1}_${f.name}`, f));

      const content = await zip.generateAsync({ type: "blob" });
      setZipBlob(content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const fileName = `${stockId}.zip`;

    // 1. Try modern showSaveFilePicker (Chrome/Edge)
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: "ZIP File", accept: { "application/zip": [".zip"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(zipBlob);
        await writable.close();
        
        // Only clear the UI if the file was actually saved
        resetUI();
      } catch (err) {
        // This triggers if user clicks "Cancel" or "X"
        alert("Save cancelled by user.");
        // We DO NOT call resetUI here so the user can click SAVE again
      }
      return;
    }

    // 2. Fallback for older browsers
    try {
      saveAs(zipBlob, fileName);
      resetUI();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="bg-slate-100 rounded-2xl p-4 space-y-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            placeholder="STOCK ID"
            value={stockId}
            onChange={(e) => setStockId(e.target.value.toUpperCase())}
            className="w-40 px-3 py-2 font-bold text-slate-700 rounded-lg text-xs border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-slate-400"
          />
          {!zipBlob ? (
            <button
              onClick={handlePrepareListing}
              disabled={!stockId || isGenerating}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 hover:bg-slate-800 transition-all"
            >
              {isGenerating ? "CREATING..." : "GENERATE"}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 shadow-md"
            >
              SAVE AS & CLEAR
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <UploadBox title="Images" count={images.length} accept="image/*" onChange={(e) => handleFileChange(e, setImages)} />
        <UploadBox title="Videos" count={videos.length} accept="video/*" onChange={(e) => handleFileChange(e, setVideos)} />
      </div>
    </div>
  );
};

const UploadBox = ({ title, count, accept, onChange }) => (
  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-all">
    <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">{title}</span>
    <span className={`text-xs font-black ${count > 0 ? 'text-green-600' : 'text-slate-800'}`}>
      {count > 0 ? `${count} Files Ready` : "Upload Files"}
    </span>
    <input type="file" hidden multiple accept={accept} onChange={onChange} />
  </label>
);

export default ListingMediaManager;
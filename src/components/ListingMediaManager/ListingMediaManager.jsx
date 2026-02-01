import React, { useState } from "react";
import JSZip from "jszip";
import ExcelJS from "exceljs";
import { UploadCloud, Download } from "lucide-react";

const ListingMediaManager = ({ listingData }) => {
  const [stockId, setStockId] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // -------------------------------
  // Prevent duplicate file selection
  // -------------------------------
  const addUniqueFiles = (newFiles, prevFiles) => {
    const existing = new Set(prevFiles.map((f) => `${f.name}_${f.size}`));
    return [
      ...prevFiles,
      ...newFiles.filter((f) => !existing.has(`${f.name}_${f.size}`)),
    ];
  };

  const handleFileChange = (e, setFiles) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => addUniqueFiles(selected, prev));
    setZipBlob(null);
  };

  // -------------------------------
  // Excel generation with Styling
  // -------------------------------
  const createExcelReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Listing_Report");

    const header = [
      "Metal Type",
      "Gold %",
      "Weight (g)",
      "Diamond Type",
      "Carat Weight",
      "Gold Cost",
      "Labor Cost",
      "Main Diamond Cost",
      "SIDE DIAMOND WT",
      "Side Diamond Cost",
      "SMALL DIAMOND WT",
      "small diamond cost",
      "Shipping Cost",
      "commission",
      "PROFIT",
      "FINAL PRICE INR",
      "LISTING INR",
      "PRICE $",
      "COST PRICE",
    ];

    // 1. Add Header Row
    const headerRow = sheet.addRow(header);

    // 2. Style Header (Yellow Background, Bold, Centered)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" }, // Yellow
      };
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 3. Add Data Row
    const dataRow = sheet.addRow([
      listingData.type,
      listingData.gPct ? listingData.gPct * 100 + "%" : "0%",
      listingData.rowWeight,
      listingData.dType,
      listingData.mainCarat || 0,
      listingData.goldCost,
      listingData.laborCost,
      listingData.mainCost,
      listingData.sideCarat || 0,
      listingData.sideCost,
      listingData.smallCarat || 0,
      listingData.smallCost,
      listingData.shipping,
      listingData.commission,
      listingData.profit,
      listingData.finalINR,
      listingData.listingINR,
      listingData.priceUSD,
      listingData.costPrice,
    ]);

    // 4. Style Data Row (Centered)
    dataRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 5. Auto-adjust Column Width based on Header Text length
    sheet.columns.forEach((column, i) => {
      const headerText = header[i];
      column.width = headerText.length < 12 ? 15 : headerText.length + 5;
    });

    return workbook.xlsx.writeBuffer();
  };

  // -------------------------------
  // ZIP creation
  // -------------------------------
  const handlePrepareListing = async () => {
    if (!stockId) return alert("Enter Stock ID");
    setIsGenerating(true);

    try {
      const zip = new JSZip();
      const root = zip.folder(stockId);

      const excel = await createExcelReport();
      root.file(`${stockId}_Report.xlsx`, excel);

      if (images.length) {
        const imgFolder = root.folder("images");
        images.forEach((f) => imgFolder.file(f.name, f));
      }

      if (videos.length) {
        const vidFolder = root.folder("videos");
        videos.forEach((f) => vidFolder.file(f.name, f));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      setZipBlob(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!zipBlob) return;
    const fileName = `${stockId}.zip`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    setTimeout(() => {
      setStockId("");
      setImages([]);
      setVideos([]);
      setZipBlob(null);
    }, 100);
  };

  const UploadBox = ({ title, files, accept, onChange }) => (
    <label className="border-slate-300 border cursor-pointer rounded-xl p-4 bg-white transition block">
      <input hidden multiple type="file" accept={accept} onChange={onChange} />
      <div className="flex items-center gap-2 mb-2">
        <UploadCloud className="w-4 h-4 text-slate-600" />
        <span className="text-xs font-black uppercase text-slate-500">
          {title}
        </span>
        <span className="text-[10px] text-slate-400">({files.length})</span>
      </div>
      {files.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">
          Click to choose files
        </p>
      ) : (
        <div className="max-h-24 overflow-y-auto space-y-1">
          {files.map((f, i) => (
            <p key={i} className="text-[10px] text-slate-600 truncate">
              • {f.name}
            </p>
          ))}
        </div>
      )}
    </label>
  );

  return (
    <div className="bg-slate-100 rounded-2xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          placeholder="STOCK ID"
          value={stockId}
          onChange={(e) => setStockId(e.target.value.toUpperCase())}
          className="w-40 px-3 py-2 font-bold text-slate rounded-lg text-xs border border-slate-300 bg-white"
        />
        {!zipBlob ? (
          <button
            onClick={handlePrepareListing}
            disabled={!stockId || (images.length === 0 && videos.length === 0)}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
          >
            {isGenerating ? "CREATING..." : "GENERATE"}
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className=" cursor-pointer px-3 py-2 gap-0.5 rounded-lg bg-green-600 text-white text-xs font-semibold flex text-center justify-center"
          >
            <Download className="w-4 h-4 " /> DOWNLOAD
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <UploadBox
          title="Images"
          files={images}
          accept="image/*"
          onChange={(e) => handleFileChange(e, setImages)}
        />
        <UploadBox
          title="Videos"
          files={videos}
          accept="video/*"
          onChange={(e) => handleFileChange(e, setVideos)}
        />
      </div>
    </div>
  );
};

export default ListingMediaManager;

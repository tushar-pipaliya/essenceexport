import React, { useState } from "react";
import Swal from "sweetalert2";
import "animate.css";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

const DataField = ({ label, value, bold = false, italic = false, highlight = false }) => (
    <div className={`flex flex-col border-b border-slate-50 pb-1 ${highlight ? 'bg-blue-50/50 p-1 rounded' : ''}`}>
        <span className="text-slate-400 font-semibold uppercase text-[8px] tracking-tighter">{label}</span>
        <span className={`text-slate-800 ${bold ? 'font-bold' : 'font-medium'} ${italic ? 'italic text-slate-500' : ''}`}>
            {value}
        </span>
    </div>
);

const EtsyCalc = () => {
    const defaultParams = {
        "Gold Rate (Per Gram)": 15000,
        "Platinum Rate (Per Gram)": 6000,
        "Gold Labor (Per Gram)": 1000,
        "Silver Labor (Per Gram)": 600,
        "Moissanite Main Stone (Per Ct)": 500,
        "Lab-Grown Main Stone (Per Ct)": 10000,
        "Moissanite Side Stone (Per Ct)": 500,
        "Lab-Grown Side Stone (Per Ct)": 8000,
        "Shipping & Handling": 2200,
        "Etsy Commission (%)": 25,
        "Listing Discount (%)": 35,
        "USD Exchange Rate": 88,
    };

    const [params, setParams] = useState(() => {
        const saved = localStorage.getItem("master_params_v2");
        return saved ? JSON.parse(saved) : defaultParams;
    });

    const [itemSpecs, setItemSpecs] = useState({
        "Metal Weight (g)": "",
        "Main Stone Carat": "",
        "Side Stone Carat": "",
        "Small Stone Carat": "",
    });

    const [rowProfits, setRowProfits] = useState({
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    });

    const [selectedRowId, setSelectedRowId] = useState(1);

    const rows = [
        { id: 1, type: "SILVER MOISSANITE", dType: "Moissanite", gPct: 0, isSilver: true },
        { id: 2, type: "10KT MOISSANITE", dType: "Moissanite", gPct: 0.427, isSilver: false },
        { id: 3, type: "14KT MOISSANITE", dType: "Moissanite", gPct: 0.595, isSilver: false },
        { id: 4, type: "18KT MOISSANITE", dType: "Moissanite", gPct: 0.76, isSilver: false },
        { id: 5, type: "SILVER LAB", dType: "Lab-Grown", gPct: 0, isSilver: true },
        { id: 6, type: "10KT LAB", dType: "Lab-Grown", gPct: 0.427, isSilver: false },
        { id: 7, type: "14KT LAB", dType: "Lab-Grown", gPct: 0.595, isSilver: false },
        { id: 8, type: "18KT LAB", dType: "Lab-Grown", gPct: 0.76, isSilver: false },
        { id: 9, type: "PLATINUM", dType: "Lab-Grown", gPct: 1, isSilver: false },
    ];

    const calculate = (row) => {
        const w = parseFloat(itemSpecs["Metal Weight (g)"]) || 0;
        const c = parseFloat(itemSpecs["Main Stone Carat"]) || 0;
        const sdwt = parseFloat(itemSpecs["Side Stone Carat"]) || 0;
        const smwt = parseFloat(itemSpecs["Small Stone Carat"]) || 0;
        const p = parseFloat(rowProfits[row.id]) || 0;

        const isL = row.dType === "Lab-Grown";
        const mainP = isL ? params["Lab-Grown Main Stone (Per Ct)"] : params["Moissanite Main Stone (Per Ct)"];
        const sideP = isL ? params["Lab-Grown Side Stone (Per Ct)"] : params["Moissanite Side Stone (Per Ct)"];

        const baseR = row.type === "PLATINUM" ? params["Platinum Rate (Per Gram)"] : params["Gold Rate (Per Gram)"];
        const goldCost = w * baseR * row.gPct;
        const currentLaborRate = row.isSilver ? params["Silver Labor (Per Gram)"] : params["Gold Labor (Per Gram)"];
        const laborCost = w * currentLaborRate;

        const mainCost = c * mainP;
        const sideCost = sdwt * sideP;
        const smallCost = smwt * 500;
        const shipping = w > 0 ? Number(params["Shipping & Handling"]) : 0;

        const subTotal = goldCost + laborCost + mainCost + sideCost + smallCost + shipping;
        const finalINR = (subTotal + p) / (1 - params["Etsy Commission (%)"] / 100);
        const commission = finalINR * (params["Etsy Commission (%)"] / 100);
        const listingINR = finalINR / (1 - params["Listing Discount (%)"] / 100);
        const priceUSD = listingINR / params["USD Exchange Rate"];
        const costPrice = finalINR - p;

        return {
            goldCost: goldCost.toFixed(2),
            laborCost: laborCost.toFixed(2),
            mainCost: mainCost.toFixed(2),
            sideCost: sideCost.toFixed(2),
            smallCost: smallCost.toFixed(2),
            shipping: shipping.toFixed(2),
            commission: commission.toFixed(2),
            finalINR: finalINR.toFixed(2),
            listingINR: listingINR.toFixed(2),
            priceUSD: priceUSD.toFixed(2),
            costPrice: costPrice.toFixed(2),
        };
    };

    const handleProfitChange = (id, val) => {
        setRowProfits(prev => ({ ...prev, [id]: val }));
    };

    const handleSaveParams = () => {
        localStorage.setItem("master_params_v2", JSON.stringify(params));
        Swal.fire({ icon: "success", title: "Global Rates Updated", timer: 1000, showConfirmButton: false });
    };


    const handleReset = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will revert all Global Rates to their original default values.",
            // icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, reset them!",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("master_params_v2");
                setParams(defaultParams);
                
                Swal.fire({
                    title: "Reset Successful",
                    text: "Rates have been restored to defaults.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <div className="w-full min-h-screen font-sans text-[10px] flex flex-col bg-slate-50">
            <Navbar onSave={handleSaveParams} onReset={handleReset} />

            <main className="flex-grow p-2 md:p-4">
                <div className="max-w-[2200px] mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-white space-y-6 p-4">

                        {/* Section 1: Inputs & Dropdown Selector */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">

                            {/* Item Specs - Grey Background with White Inputs */}
                            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.keys(itemSpecs).map((key) => (
                                    <div key={key} className="flex flex-col bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-sm">
                                        {/* Label: Grayish area */}
                                        <label className="px-1.5 text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1.5">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </label>

                                        {/* Input: Pure White Contrast */}
                                        <div className="bg-white rounded-lg border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all">
                                            <input
                                                type="number"
                                                value={itemSpecs[key]}
                                                onChange={(e) => setItemSpecs({ ...itemSpecs, [key]: e.target.value })}
                                                className="w-full h-9 px-3 bg-transparent font-bold text-sm text-slate-900 outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Profit Section - Blue Background with White Inputs */}
                            <div className="lg:col-span-4 grid grid-cols-2 gap-2 bg-blue-50/50 p-2 rounded-xl border border-blue-100 shadow-sm">
                                {/* Select Row Column */}
                                <div className="flex flex-col">
                                    <label className="px-1.5 text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1.5">
                                        Select Row</label>
                                    <div className="bg-white rounded-lg border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all">

                                        <select
                                            value={selectedRowId}
                                            onChange={(e) => setSelectedRowId(parseInt(e.target.value))}
                                            className="w-full  h-9 px-2 bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer"
                                        >
                                            {rows.map(r => <option key={r.id} value={r.id}>{r.type}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Profit Input Column */}
                                <div className="flex flex-col">
                                    <label className="px-1.5 text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1.5">
                                        Add Profit (₹)</label>
                                    <div className="bg-white rounded-lg border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all">
                                        <input
                                            type="number"
                                            value={rowProfits[selectedRowId] || ""}
                                            onChange={(e) => handleProfitChange(selectedRowId, e.target.value)}
                                            className="w-full h-9 px-3 bg-transparent text-sm font-bold  outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Section 2: Global Parameters */}
                        <div className="bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-4 border border-slate-300/70 shadow-sm">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Object.keys(params).map((key) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <label className="text-[10px] font-medium text-slate-600 truncate">{key}</label>
                                        <input
                                            type="number"
                                            value={params[key]}
                                            onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                                            className="h-9 px-3 rounded-xl bg-white border border-slate-300 text-[12px] font-semibold text-slate-800 outline-none focus:border-blue-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Result Table */}
                    <div className="overflow-hidden bg-white border-t border-slate-300">
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full min-w-[1800px] border-collapse text-[12px] text-center table-fixed">
                                <thead>
                                    <tr className="bg-slate-200 text-slate-700 font-bold uppercase border-b border-slate-300">
                                        <th className="p-3 w-[150px] text-left border-r border-slate-200">Metal Type</th>
                                        <th className="p-2 w-[80px] border-r border-slate-200">Gold %</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Diamond Type</th>
                                        <th className="p-2 w-[110px] border-r border-slate-200">Gold Cost</th>
                                        <th className="p-2 w-[110px] border-r border-slate-200">Labor Cost</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Main Stone</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Side Stone</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Small Stone</th>
                                        <th className="p-2 w-[100px] border-r border-slate-200">Shipping</th>
                                        <th className="p-2 w-[110px] border-r border-slate-200">Commission</th>
                                        <th className="p-2 w-[110px] border-r border-slate-200">Profit (₹)</th>
                                        <th className="p-2 w-[120px] border-r border-slate-200">Final INR</th>
                                        <th className="p-2 w-[120px] border-r border-slate-200 font-bold">Listing INR</th>
                                        <th className="p-2 w-[100px] border-r border-slate-200">Price $</th>
                                        <th className="p-2 w-[120px] border-r border-slate-200 italic">Cost Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {rows.map((row) => {
                                        const c = calculate(row);
                                        return (
                                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="p-3 text-left font-bold text-slate-900 border-r border-slate-200">{row.type}</td>
                                                <td className="p-2 border-r border-slate-200">{row.gPct > 0 ? (row.gPct * 100).toFixed(1) + '%' : "-"}</td>
                                                <td className="p-2 border-r border-slate-200 italic text-slate-500">{row.dType}</td>
                                                <td className="p-2 border-r border-slate-200 font-medium">₹{c.goldCost}</td>
                                                <td className="p-2 border-r border-slate-200 font-medium">₹{c.laborCost}</td>
                                                <td className="p-2 border-r border-slate-200">₹{c.mainCost}</td>
                                                <td className="p-2 border-r border-slate-200">₹{c.sideCost}</td>
                                                <td className="p-2 border-r border-slate-200">₹{c.smallCost}</td>
                                                <td className="p-2 border-r border-slate-200">₹{c.shipping}</td>
                                                <td className="p-2 border-r border-slate-200">₹{c.commission}</td>
                                                {/* Profit as Plain Text (Just like other columns) */}
                                                <td className="p-2 border-r border-slate-200  bg-blue-50/30">
                                                    ₹{rowProfits[row.id] || 0}
                                                </td>
                                                <td className="p-2 border-r border-slate-200">₹{c.finalINR}</td>
                                                <td className="p-2 border-r border-slate-200 font-bold">₹{c.listingINR}</td>
                                                <td className="p-2 border-r border-slate-200 font-bold text-slate-800">${c.priceUSD}</td>
                                                <td className="p-2 border-r border-slate-200 italic">₹{c.costPrice}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EtsyCalc;
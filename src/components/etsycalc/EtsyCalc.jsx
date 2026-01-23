import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "animate.css";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

// Helper component for mobile view fields
const DataField = ({ label, value, bold = false, italic = false, highlight = false }) => (
    <div className={`flex flex-col border-b border-slate-50 pb-1 ${highlight ? 'bg-blue-50/50 p-1 rounded' : ''}`}>
        <span className="text-slate-400 font-semibold uppercase text-[8px] tracking-tighter">{label}</span>
        <span className={`text-slate-800 ${bold ? 'font-bold' : 'font-medium'} ${italic ? 'italic text-slate-500' : ''}`}>
            {value}
        </span>
    </div>
);

const EtsyCalc = () => {
    // 1. Global Parameters (Market Rates)
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

    // 2. Specific Item Inputs
    const [itemSpecs, setItemSpecs] = useState({
        "Metal Weight (g)": "",
        "Main Stone Carat": "",
        "Side Stone Carat": "",
        "Small Stone Carat": "",
        "Desired Profit (INR)": "",
    });

    // 3. Row Configuration
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
        const p = parseFloat(itemSpecs["Desired Profit (INR)"]) || 0;

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

    const handleSaveParams = () => {
        localStorage.setItem("master_params_v2", JSON.stringify(params));
        Swal.fire({ icon: "success", title: "Global Rates Updated", timer: 1000, showConfirmButton: false });
    };

    const handleReset = () => {
        Swal.fire({
            title: 'Restore Defaults?',
            text: "This will reset all market rates to factory settings.",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, Reset",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("master_params_v2");
                setParams(defaultParams);
            }
        });
    };

    return (
        <div className="w-full min-h-screen font-sans text-[10px] flex flex-col bg-slate-50">
            <Navbar onSave={handleSaveParams} onReset={handleReset} />

            <main className="flex-grow p-2 md:p-4">
                <div className="max-w-[2200px] mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-white space-y-6 p-4">
                        {/* Section 1: Item Specifics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-2 gap-3 md:gap-4">
                            {Object.keys(itemSpecs).map((key) => (
                                <div key={key} className="relative overflow-hidden bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-1">{key}</label>
                                    <input
                                        type="number"
                                        value={itemSpecs[key]}
                                        onChange={(e) => setItemSpecs({ ...itemSpecs, [key]: e.target.value })}
                                        className="w-full bg-transparent font-semibold text-sm md:text-base text-slate-800 outline-none"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute left-0 top-0 h-full w-1 bg-gray-500" />
                                </div>
                            ))}
                        </div>

                        {/* Section 2: Global Parameters */}
                        <div className="bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-2 md:py-4 md:px-6 border border-slate-300/70 shadow-[0_10px_28px_-14px_rgba(0,0,0,0.25)]">
                            <div className="mb-4">
                                <h3 className="text-[11px] font-semibold text-slate-800 tracking-wide">Global Market Settings</h3>
                                <div className="h-[1px] w-10 bg-indigo-600/50 mt-1 rounded-full" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Object.keys(params).map((key) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <label className="text-[10px] font-medium text-slate-600 truncate">{key}</label>
                                        <input
                                            type="number"
                                            value={params[key]}
                                            onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                                            className="h-9 px-3 rounded-xl bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-300 text-[12px] font-semibold text-slate-800 shadow-[inset_0_1px_3_rgba(0,0,0,0.15)] outline-none transition-all hover:from-slate-100 hover:to-slate-200 focus:from-white focus:to-slate-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25 active:scale-[0.98]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Result View */}
                    <div className="overflow-hidden bg-white border-t border-slate-300">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full min-w-[1800px] border-collapse text-[12px] text-center table-fixed">
                                <thead>
                                    <tr className="bg-slate-200 text-slate-700 font-bold uppercase border-b border-slate-300">
                                        <th className="p-3 w-[150px] text-left border-r border-slate-200">Metal Type</th>
                                        <th className="p-2 w-[80px] border-r border-slate-200">Gold %</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Diamond Type</th>
                                        <th className="p-2 w-[110px] border-r border-slate-200">Gold Cost</th>
                                        <th className="p-2 w-[110px] border-r border-slate-200">Labor Cost</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Main Diamond</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Side Diamond</th>
                                        <th className="p-2 w-[130px] border-r border-slate-200">Small Diamond</th>
                                        <th className="p-2 w-[100px] border-r border-slate-200">Shipping</th>
                                        <th className="p-2 w-[110px] border-r border-slate-200">Commission</th>
                                        <th className="p-2 w-[120px] border-r border-slate-200">Final INR</th>
                                        <th className="p-2 w-[120px] border-r border-slate-200">Listing INR</th>
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
                                                <td className="p-2 border-r border-slate-200">₹{c.finalINR}</td>
                                                <td className="p-2 border-r border-slate-200 font-bold">₹{c.listingINR}</td>
                                                <td className="p-2 border-r border-slate-200">${c.priceUSD}</td>
                                                <td className="p-2 border-r border-slate-200">₹{c.costPrice}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD VIEW */}
                        <div className="lg:hidden p-3 grid grid-cols-1 gap-4 bg-slate-100">
                            {rows.map((row) => {
                                const c = calculate(row);
                                return (
                                    <div key={row.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                        {/* Header: Metal Type and Price in USD */}
                                        <div className="bg-slate-200 text-white p-3 flex justify-between items-center">
                                            <span className="bg-slate-200 text-slate-700 font-bold">{row.type}</span>
                                            <span className="bg-gray-500 text-white px-3 py-1 rounded-full   font-bold text-sm shadow-sm">
                                                LISTING ₹{c.listingINR}
                                            </span>
                                        </div>

                                        {/* Body: All details including Listing INR */}
                                        <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
                                            <DataField label="Diamond Type" value={row.dType} italic />
                                            <DataField label="Gold %" value={row.gPct > 0 ? (row.gPct * 100).toFixed(1) + '%' : "N/A"} />
                                            <DataField label="Gold Cost" value={`₹${c.goldCost}`} />
                                            <DataField label="Labor Cost" value={`₹${c.laborCost}`} />
                                            <DataField label="Main Stone" value={`₹${c.mainCost}`} />
                                            <DataField label="Side Stone" value={`₹${c.sideCost}`} />
                                            <DataField label="Small Stone" value={`₹${c.smallCost}`} />
                                            <DataField label="Shipping" value={`₹${c.shipping}`} />
                                            <DataField label="Commission" value={`₹${c.commission}`} />
                                            <DataField label="Final INR" value={`$${c.finalINR}`} highlight />
                                            <DataField label="Price$" value={`${c.priceUSD}`} bold />
                                            <DataField label="Cost Price" value={`₹${c.costPrice}`} italic />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EtsyCalc;
import React, { useState } from "react";
import Swal from "sweetalert2";
import "animate.css";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

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
        const saved = localStorage.getItem("master_params_v4");
        return saved ? JSON.parse(saved) : defaultParams;
    });

    const [itemSpecs, setItemSpecs] = useState({
        "18KT Weight (g)": "",
        "Moi Main Carat": "",
        "Moi Side Carat": "",
        "Moi Small Carat": "",
        "Lab Main Carat": "",
        "Lab Side Carat": "",
        "Lab Small Carat": "",
    });

    const [rowProfits, setRowProfits] = useState({
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    });

    const [selectedRowId, setSelectedRowId] = useState(1);

    const rows = [
        { id: 1, type: "SILVER MOISSANITE", dType: "Moissanite", gPct: 0, isSilver: true, factor: 0.7695 },
        { id: 2, type: "10KT MOISSANITE", dType: "Moissanite", gPct: 0.427, isSilver: false, factor: 0.81 },
        { id: 3, type: "14KT MOISSANITE", dType: "Moissanite", gPct: 0.595, isSilver: false, factor: 0.90 },
        { id: 4, type: "18KT MOISSANITE", dType: "Moissanite", gPct: 0.76, isSilver: false, factor: 1.0 },
        { id: 5, type: "SILVER LAB", dType: "Lab-Grown", gPct: 0, isSilver: true, factor: 0.7695 },
        { id: 6, type: "10KT LAB", dType: "Lab-Grown", gPct: 0.427, isSilver: false, factor: 0.81 },
        { id: 7, type: "14KT LAB", dType: "Lab-Grown", gPct: 0.595, isSilver: false, factor: 0.90 },
        { id: 8, type: "18KT LAB", dType: "Lab-Grown", gPct: 0.76, isSilver: false, factor: 1.00 },
        { id: 9, type: "PLATINUM", dType: "Lab-Grown", gPct: 1, isSilver: false, factor: 1.25 },
    ];

    const calculate = (row) => {
        const baseW = parseFloat(itemSpecs["18KT Weight (g)"]) || 0;
        const rawWeight = baseW * row.factor;
        const displayWeight = Math.round(rawWeight * 100) / 100;

        const prefix = row.dType === "Lab-Grown" ? "Lab" : "Moi";
        const c = parseFloat(itemSpecs[`${prefix} Main Carat`]) || 0;
        const sdwt = parseFloat(itemSpecs[`${prefix} Side Carat`]) || 0;
        const smwt = parseFloat(itemSpecs[`${prefix} Small Carat`]) || 0;
        const p = parseFloat(rowProfits[row.id]) || 0;

        const isL = row.dType === "Lab-Grown";
        const mainP = isL ? params["Lab-Grown Main Stone (Per Ct)"] : params["Moissanite Main Stone (Per Ct)"];
        const sideP = isL ? params["Lab-Grown Side Stone (Per Ct)"] : params["Moissanite Side Stone (Per Ct)"];

        const goldCost = Math.round(rawWeight * (row.type === "PLATINUM" ? params["Platinum Rate (Per Gram)"] : params["Gold Rate (Per Gram)"]) * row.gPct * 100) / 100;
        const currentLaborRate = row.isSilver ? params["Silver Labor (Per Gram)"] : params["Gold Labor (Per Gram)"];
        const laborCost = Math.round(rawWeight * currentLaborRate * 100) / 100;

        const mainCost = Math.round(c * mainP * 100) / 100;
        const sideCost = Math.round(sdwt * sideP * 100) / 100;
        const smallCost = Math.round(smwt * 500 * 100) / 100;
        const shipping = rawWeight > 0 ? Number(params["Shipping & Handling"]) : 0;

        const subTotal = goldCost + laborCost + mainCost + sideCost + smallCost + shipping;
        const finalINR = Math.round(((subTotal + p) / (1 - params["Etsy Commission (%)"] / 100)) * 100) / 100;
        const commission = Math.round((finalINR * (params["Etsy Commission (%)"] / 100)) * 100) / 100;
        const listingINR = Math.round((finalINR / (1 - params["Listing Discount (%)"] / 100)) * 100) / 100;
        const priceUSD = Math.round((listingINR / params["USD Exchange Rate"]) * 100) / 100;
        const costPrice = Math.round((finalINR - p) * 100) / 100;

        return {
            rowWeight: displayWeight.toFixed(2),
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
        localStorage.setItem("master_params_v4", JSON.stringify(params));
        Swal.fire({ icon: "success", title: "Rates Saved!", timer: 1000, showConfirmButton: false });
    };

const handleReset = () => {
    Swal.fire({
        title: "Reset All Rates?",
        text: "This will restore all values to default. This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, Reset",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ff4b4b",   // Indigo
        cancelButtonColor: "#94a3b8",    // Slate
        buttonsStyling: true,
        reverseButtons: false,           // ❗ Cancel first, Confirm second
        allowOutsideClick: false,        // optional: prevents accidental close
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("master_params_v4");
            setParams(defaultParams);

            Swal.fire({
                icon: "success",
                title: "Reset Successful",
                text: "All rates have been restored to default.",
                timer: 1200,
                showConfirmButton: false,
            });
        }
    });
};


    return (
        <div className="w-full min-h-screen font-sans text-[10px] flex flex-col bg-slate-50">
            <Navbar onSave={handleSaveParams} onReset={handleReset} />

            <main className="flex-grow p-2 md:p-4">
                <div className="max-w-[2200px] mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-4 space-y-6">

                        {/* FIRST SECTION: MODERN INPUT BOXES */}
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            {Object.keys(itemSpecs).map((key) => (
                                <div key={key} className={`flex flex-col p-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-blue-300 ${key.includes('Moi') ? 'bg-blue-50' : key.includes('Lab') ? 'bg-blue-50' : 'bg-blue-50'}`}>
                                    <label className="px-1 text-[9px] font-black text-slate-600 uppercase mb-1 truncate">{key}</label>
                                    <input
                                        type="number"
                                        value={itemSpecs[key]}
                                        onChange={(e) => setItemSpecs({ ...itemSpecs, [key]: e.target.value })}
                                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="0.00"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* SECOND SECTION: PROFIT & GLOBAL RATES BEST LAYOUT */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4"> {/* Increased total columns to 4 for finer control */}

                            {/* Global Rates Grid (Moved to first position, width increased) */}
                            <div className="order-2 xl:order-1 xl:col-span-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-slate-100 rounded-xl border border-slate-200">
                                {Object.keys(params).map((key) => (
                                    <div key={key} className="flex flex-col">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase truncate">{key}</label>
                                        <input type="number" value={params[key]} onChange={(e) => setParams({ ...params, [key]: e.target.value })} className="h-8 px-2 rounded-lg border border-slate-300 text-[11px] font-semibold bg-white" />
                                    </div>
                                ))}
                            </div>

                            {/* Profit Card (Moved to second position, width decreased) */}
                            <div className="order-1 xl:order-2 xl:col-span-1 grid grid-cols-1 gap-3 bg-slate-100 p-3 rounded-xl border border-indigo-100 shadow-inner">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Metal Type</label>
                                    <select  value={selectedRowId} onChange={(e) => setSelectedRowId(parseInt(e.target.value))} className="h-10 px-3 text-[11px] rounded-lg border border-slate-300 font-bold text-slate-700 bg-white w-full">
                                        {rows.map(r => <option key={r.id} value={r.id}>{r.type}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 text-[10px]">
                                    <label className=" font-bold text-slate-500 uppercase">Add Profit (₹)</label>
                                    <input type="number" value={rowProfits[selectedRowId] || ""} onChange={(e) => setRowProfits(prev => ({ ...prev, [selectedRowId]: e.target.value }))} className="h-10 px-3 text-[11px] rounded-lg border border-slate-300 font-bold outline-none bg-white focus:border-indigo-500 w-full" placeholder="0" />
                                </div>
                            </div>

                        </div>

                        {/* MOBILE CARD VIEW: SHOWING TOTAL DATA */}
                        <div className="md:hidden space-y-4">
                            {rows.map((row) => {
                                const c = calculate(row);
                                return (
                                    <div key={row.id} className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-md">
                                        <div className="bg-indigo-50 p-2 text-center font-bold uppercase text-[12px]">
                                            {row.type}
                                        </div>
                                        <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                                            <div className="flex justify-between border-b py-1"><span>Gold %:</span> <span className="font-bold">{row.gPct > 0 ? (row.gPct * 100).toFixed(1) + '%' : "-"}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Weight:</span> <span className="font-bold">{c.rowWeight}g</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Diamond:</span> <span className="font-bold">{row.dType}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Gold Cost:</span> <span className="font-bold">₹{c.goldCost}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Labor:</span> <span className="font-bold">₹{c.laborCost}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Main St:</span> <span className="font-bold">₹{c.mainCost}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Side St:</span> <span className="font-bold">₹{c.sideCost}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Small St:</span> <span className="font-bold">₹{c.smallCost}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Shipping:</span> <span className="font-bold">₹{c.shipping}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Commission:</span> <span className="font-bold">₹{c.commission}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Profit:</span> <span className="font-bold">₹{rowProfits[row.id] || 0}</span></div>
                                            <div className="flex justify-between border-b py-1 "><span>Final INR:</span> <span className="font-bold">₹{c.finalINR}</span></div>
                                            <div className="flex justify-between border-b py-1"><span>Listing:</span> <span className="font-bold">₹{c.listingINR}</span></div>
                                            <div className="flex justify-between border-b py-1 font-bold"><span>Price $:</span> <span className="bg-slate-200 px-2 py-0.5 rounded-full">${c.priceUSD}</span></div>
                                            <div className="col-span-2 flex justify-between pt-1 italic text-slate-600"><span>Cost Price:</span> <span>₹{c.costPrice}</span></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* DESKTOP TABLE: PRESERVING YOUR ORIGINAL LAYOUT EXACTLY */}
                    <div className="hidden md:block overflow-x-auto border-t border-slate-300">
                        <table className="w-full min-w-[2000px] border-collapse text-[12px] text-center table-fixed">
                            <thead>
                                <tr className="bg-slate-200 text-slate-700 font-bold uppercase">
                                    <th className="p-3 w-[160px] text-left border-r border-slate-300">Metal Type</th>
                                    <th className="p-2 w-[80px] border-r border-slate-300">Gold %</th>
                                    <th className="p-2 w-[90px] border-r border-slate-300">Weight (g)</th>
                                    <th className="p-2 w-[130px] border-r border-slate-300">Diamond Type</th>
                                    <th className="p-2 w-[110px] border-r border-slate-300">Gold Cost</th>
                                    <th className="p-2 w-[110px] border-r border-slate-300">Labor Cost</th>
                                    <th className="p-2 w-[110px] border-r border-slate-300">Main Stone</th>
                                    <th className="p-2 w-[110px] border-r border-slate-300">Side Stone</th>
                                    <th className="p-2 w-[110px] border-r border-slate-300">Small Stone</th>
                                    <th className="p-2 w-[100px] border-r border-slate-300">Shipping</th>
                                    <th className="p-2 w-[110px] border-r border-slate-300">Commission</th>
                                    <th className="p-2 w-[110px] border-r border-slate-300">Profit (₹)</th>
                                    <th className="p-2 w-[120px] border-r border-slate-300 font-bold">Final INR</th>
                                    <th className="p-2 w-[120px] border-r border-slate-300 font-bold">Listing INR</th>
                                    <th className="p-2 w-[100px] border-r border-slate-300 ">Price $</th>
                                    <th className="p-2 w-[120px] italic text-slate-500">Cost Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {rows.map((row) => {
                                    const c = calculate(row);
                                    return (
                                        <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 text-left font-bold border-r border-slate-200">{row.type}</td>
                                            <td className="p-2 border-r border-slate-200">{row.gPct > 0 ? (row.gPct * 100).toFixed(1) + '%' : "-"}</td>
                                            <td className="p-2 border-r border-slate-200 ">{c.rowWeight}</td>
                                            <td className="p-2 border-r border-slate-200 italic">{row.dType}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.goldCost}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.laborCost}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.mainCost}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.sideCost}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.smallCost}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.shipping}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.commission}</td>
                                            <td className="p-2 border-r border-slate-200">₹{rowProfits[row.id] || 0}</td>
                                            <td className="p-2 border-r border-slate-200">₹{c.finalINR}</td>
                                            <td className="p-2 border-r border-slate-200 font-bold">₹{c.listingINR}</td>
                                            <td className="p-2 border-r border-slate-200 font-bold">${c.priceUSD}</td>
                                            <td className="p-2 italic text-slate-400">₹{c.costPrice}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EtsyCalc;
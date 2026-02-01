import React, { useState } from "react";
import essence from "../../Image/essence.png";
import { Menu, X, RotateCcw, Save } from "lucide-react";

const Navbar = ({ onReset, onSave }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 py-2 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LEFT: LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="group">
              <img
                src={essence}
                alt="Essence"
                className="h-10 sm:h-16 w-auto"
              />
            </a>
          </div>

          {/* CENTER: TITLE – Beautiful & Professional */}
          <div className="hidden md:block text-center flex-1">
            <h1 className="text-2xl lg:text-1xl font-bold text-slate-700 ">
            Essence Jewelry Pricing System            </h1>

          </div>

          {/* RIGHT: DESKTOP BUTTONS – Premium Look */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onReset}
              className="flex items-center gap-2  px-3 py-2 rounded-lg text-xs font-bold border border-slate-300 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95"
            >
              <RotateCcw size={16} />
              Reset Rates
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 active:scale-95"
            >
              <Save size={16} />
              Save Rates
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN – Clean & Luxurious */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg p-6 space-y-5 animate-in slide-in-from-top duration-300">
          <div className="text-center pb-3">
            <h1 className="text-2xl lg:text-1xl font-bold text-slate-700 ">
            Essence Jewelry Pricing System            </h1>

          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { onReset(); setIsMenuOpen(false); }}
              className="flex items-center justify-center gap-2  px-3 py-2 rounded-lg text-xs font-bold border border-slate-300 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95"
            >
              <RotateCcw size={18} /> Reset Rates
            </button>
            <button
              onClick={() => { onSave(); setIsMenuOpen(false); }}
              className="flex justify-center  items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 active:scale-95"
            >
              <Save size={18} /> Save Rates
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
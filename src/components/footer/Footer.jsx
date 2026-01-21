import React from 'react';

function Footer() {
    return (
<footer className="py-6 border-t border-slate-200 bg-white">
        <div className="text-center text-black-400 text-sm font-medium">
          © {new Date().getFullYear()} Essence Export. All rights reserved.
        </div>
      </footer>
    );
}

export default Footer;
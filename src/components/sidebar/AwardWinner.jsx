import React from "react";
import images from "../../assets/images";

const AwardHero = () => {
  return (
    <div className="w-full bg-gradient-to-br from-[#232a3e] via-[#1e2336] to-[#161a29] text-white rounded-xl p-5 flex flex-col items-start shadow-xl relative overflow-hidden border border-white/5">
      
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#e6c08b]/5 blur-3xl -mr-10 -mt-10 rounded-full"></div>
      <h2 className="text-[20px] font-extrabold text-[#e6c08b] mb-4 leading-tight w-[55%] sm:w-3/5 pr-4 mt-4">
        Hume Silver Cab Services
      </h2>

      {/* View Award Details Link */}
      <a 
        href="https://qualitybusinessawards.com.au/2026/the-best-Taxi-Service-in-City-of-Hume-VIC/Hume-Silver-Cab-Services#winner-showcase" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex w-fit items-center gap-1.5 bg-gradient-to-r from-[#cf9d60] to-[#e6c08b] text-[#1e2336] px-3.5 py-2.5 rounded-lg text-[11px] font-bold shadow-[0_0_10px_rgba(207,157,96,0.3)] hover:opacity-90 transition no-underline"
      >
        <span className="font-bold text-[14px] leading-none mb-0.5">↓</span>
        <span>View Award Details</span>
      </a>

      {/* RIGHT IMAGE */}
      <div className="absolute top-8 right-2 sm:right-6 z-10 w-20 sm:w-24 flex justify-center items-start pointer-events-none">
        <img
          src={images.awardWinner}
          alt="Award Badge"
          className="w-full h-auto object-contain drop-shadow-xl"
        />
      </div>
      
    </div>
  );
};

export default AwardHero;
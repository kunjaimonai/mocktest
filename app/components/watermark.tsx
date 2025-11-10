"use client";
import React from "react";

interface WatermarkProps {
  schoolName: string;
}

const Watermark: React.FC<WatermarkProps> = ({ schoolName }) => {
  const [grid, setGrid] = React.useState({ rows: 6, cols: 6 });

  React.useEffect(() => {
    const updateGrid = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setGrid({ rows: 8, cols: 4 }); // phones
      } else if (width < 1024) {
        setGrid({ rows: 8, cols: 8 }); // tablets
      } else {
        setGrid({ rows: 8, cols: 8 }); // desktops
      }
    };
    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, []);

  const total = grid.rows * grid.cols;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute"
        style={{
          width: "150%", // extend beyond viewport
          height: "150%", // fill edges after rotation
          top: "-25%",
          left: "-60%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          transform: "rotate(-45deg)",
          transformOrigin: "center center",
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="font-bold text-slate-700 opacity-10 whitespace-nowrap select-none"
            style={{
              flex: `0 0 ${100 / grid.cols}%`,
              textAlign: "center",
              padding: "2rem",
              fontSize: "clamp(1rem, 4vw, 3rem)",
            }}
          >
            {schoolName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watermark;

"use client";

import { useEffect, useState, useCallback } from "react";
import { Edit2, X, ChevronLeft, ChevronRight, ImageIcon, RefreshCw } from "lucide-react";

const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxeKQLFP1woFPP_Z1yOYxTPWidvRdFSkrZUr_fzNtQlKZDZLUXIsOPZz_RRGDjtKKDLNQ/exec";
const SHEET_ID = "1z5nn_P5q51xLNpNWJnq_zz6R6oN6FFK4Z8pH2qvi_x0";
const SHEET_NAME = "Form Responses 1";
const DRIVE_FOLDER_ID = "1cZWpJOrevnOJWiVgeV5ip0LTEnODaePNzgtOY0RvKsdIwoOX4Tl9yb2b7GV3Zs8VxMmo1BRw";
// Logo folder provided by user
const LOGO_FOLDER_ID = "1-7FOgfA5L-XcASRxyITP8123A4nZoW4uNvTiDQjzgk7vXuMPux4JShiYARilbWnAKNAc6uo6";

const ROWS_PER_PAGE = 10;

export default function Home() {
  const [rows, setRows] = useState<any[][]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    fetch(WEBAPP_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRows(data.data);
          setError(null);
        } else {
          setError("Failed to load data");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const updateText = async (rowIndex: number, column: number, value: string) => {
    try {
      await fetch(WEBAPP_URL, {
        method: "POST",
        body: JSON.stringify({
          mode: "updateText",
          row: rowIndex + 1,
          column,
          value,
          sheetId: SHEET_ID,
          sheetName: SHEET_NAME,
        }),
      });
      const newRows = [...rows];
      newRows[rowIndex][column - 1] = value;
      setRows(newRows);
    } catch (err) {
      setError("Failed to update text");
    }
  };

  // folderId optional - if provided, upload to that Drive folder (used for logo uploads)
  const updateImage = async (rowIndex: number, column: number, file: File, folderId?: string) => {
    try {
      const base64 = await toBase64(file);

      const res = await fetch(WEBAPP_URL, {
        method: "POST",
        body: JSON.stringify({
          mode: "updateImage",
          row: rowIndex + 1,
          column,
          fileName: file.name,
          base64Image: base64.split(",")[1],
          folderId: folderId || DRIVE_FOLDER_ID,
          sheetId: SHEET_ID,
          sheetName: SHEET_NAME,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newRows = [...rows];
        newRows[rowIndex][column - 1] = data.link;
        setRows(newRows);
      } else {
        setError("Failed to upload image");
      }
    } catch (err) {
      setError("Failed to update image");
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const loadImageThroughProxy = useCallback(async (fileId: string): Promise<string> => {
    try {
      const response = await fetch(WEBAPP_URL, {
        method: "POST",
        body: JSON.stringify({
          mode: "getImage",
          fileId: fileId,
        }),
      });

      const data = await response.json();

      if (data.success && data.base64) {
        const dataUrl = `data:${data.mimeType || 'image/jpeg'};base64,${data.base64}`;
        setImageCache(prev => ({ ...prev, [fileId]: dataUrl }));
        return dataUrl;
      }
      return "";
    } catch (err) {
      return "";
    }
  }, []);

  // Treat the first row from Sheets as the header row (column names)
  const headerRow = rows.length > 0 ? rows[0] : [];
  // Remove column 6 (index 5)
  const removedColumnIndex = 5; // zero based
  const columnCount = headerRow.length || (rows[1]?.length ?? 0);
  const visibleIndices = Array.from({ length: columnCount }, (_, i) => i).filter(i => i !== removedColumnIndex);

  // Use data rows as rows after headerRow (if a header exists)
  const dataRows = rows.length > 1 ? rows.slice(1) : [];

  const totalPages = Math.max(1, Math.ceil(dataRows.length / ROWS_PER_PAGE));
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const endIdx = startIdx + ROWS_PER_PAGE;
  const currentRows = dataRows.slice(startIdx, endIdx);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Google Form Response Editor</h1>
          <p className="text-gray-600">View and edit your form responses</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  {visibleIndices.map((i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {headerRow[i] || `Column ${i + 1}`}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRows.map((row: any[], i: number) => {
                  const actualIndex = startIdx + i + 1; // +1 because dataRows starts after header
                  const originalRowIndex = actualIndex; // index in original `rows` for updates
                  return (
                    <tr key={actualIndex} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actualIndex}</td>
                      {visibleIndices.map((c) => (
                        <td key={c} className="px-6 py-4 text-sm text-gray-900">
                          {typeof row[c] === "string" && row[c].includes("google") ? (
                            <ImageCell url={row[c]} imageCache={imageCache} loadImage={loadImageThroughProxy} />
                          ) : (
                            <div className="max-w-xs truncate">{row[c]}</div>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setEditingRow(actualIndex)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">Showing {dataRows.length ? startIdx + 1 : 0} to {Math.min(endIdx, dataRows.length)} of {dataRows.length} entries</div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {editingRow !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Edit Row #{editingRow}</h2>
                <button onClick={() => setEditingRow(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* editingRow corresponds to the original rows index, so use rows[editingRow] */}
                {rows[editingRow] && visibleIndices.map((colIndex) => {
                  const value = rows[editingRow][colIndex];
                  const header = headerRow[colIndex] || `Column ${colIndex + 1}`;
                  const isLogo = /logo/i.test(String(header));

                  // If this column is logo, always show upload option and upload to LOGO_FOLDER_ID
                  if (isLogo) {
                    return (
                      <div key={colIndex} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{header}</label>
                        <div className="space-y-3">
                          {typeof value === "string" && value.includes("google") ? (
                            <ImageCell url={value} imageCache={imageCache} loadImage={loadImageThroughProxy} large />
                          ) : (
                            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files && updateImage(editingRow!, colIndex + 1, e.target.files[0], LOGO_FOLDER_ID)
                            }
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={colIndex} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{header}</label>
                      {typeof value === "string" && value.includes("google") ? (
                        <div className="space-y-3">
                          <ImageCell url={value} imageCache={imageCache} loadImage={loadImageThroughProxy} large />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files && updateImage(editingRow!, colIndex + 1, e.target.files[0])
                            }
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          defaultValue={value}
                          onBlur={(e) => updateText(editingRow!, colIndex + 1, e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                <button onClick={() => setEditingRow(null)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageCell({ url, imageCache, loadImage, large = false }: { 
  url: string; 
  imageCache: Record<string, string>; 
  loadImage: (id: string) => Promise<string>; 
  large?: boolean 
}) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const extractFileId = (url: string): string | null => {
      if (!url || !url.includes("google")) return null;
      const patterns = [
        /\/d\/(.*?)(\/|$)/,
        /id=(.*?)(&|$)/,
        /\/file\/d\/(.*?)(\/|$)/,
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
      }
      return null;
    };

    const fileId = extractFileId(url);
    if (!fileId) {
      setError(true);
      setLoading(false);
      return;
    }

    if (imageCache[fileId]) {
      setImageSrc(imageCache[fileId]);
      setLoading(false);
      return;
    }

    setLoading(true);
    loadImage(fileId)
      .then((src) => {
        if (src) {
          setImageSrc(src);
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [url, imageCache, loadImage]);

  const sizeClass = large ? "w-32 h-32" : "w-16 h-16";

  if (loading) {
    return (
      <div className={`${sizeClass} flex items-center justify-center bg-gray-100 rounded border border-gray-200`}>
        <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`${sizeClass} flex flex-col items-center justify-center bg-gray-100 rounded border border-gray-200`}>
        <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
        <span className="text-xs text-gray-400">No preview</span>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc}
      alt="Upload"
      className={`${sizeClass} object-cover rounded border border-gray-200`}
    />
  );
}

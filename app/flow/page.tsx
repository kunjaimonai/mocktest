"use client";
import { useState } from "react";
import MockTestPage from "../mocktest/page";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

function generateSixDigit() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function PreTestFlow() {
  const [step, setStep] = useState(1);

  const [appNumber, setAppNumber] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const [dob, setDob] = useState("");


  const [pin, setPin] = useState("");
  const [generatedPin] = useState(generateSixDigit());

  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  // -------------------------------
  // STEP 1 — APP + CAPTCHA
  // -------------------------------
  const handleStep1 = () => {
    if (captchaInput !== captcha) {
      alert("Incorrect captcha");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }
    setStep(2);
  };

  // -------------------------------
  // STEP 2 — DOB + OTP
  // -------------------------------

  const handleStep2 = () => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      alert("DOB must be DD-MM-YYYY");
      return;
    }
if (pin !== generatedPin) {
      alert("Incorrect PIN");
      return;
    }
    setStep(3);   
     if (!agree1 || !agree2) {
      alert("Please check both checkboxes");
      return;
    }
  };



  // -------------------------------
  // STEP 4 — SHOW MOCK TEST
  // -------------------------------
  if (step === 3) {
    return <MockTestPage />;
  }

  // ------------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Road Safety Mock Test – Verification
        </h1>

        {/* ------------------- STEP 1 ------------------- */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-slate-800">
              Step 1: Enter Application Number & Captcha
            </h2>

            <div className="mb-4 text-left">
              <label className="text-sm font-medium">Application Number</label>
              <input
                className="w-full p-3 border rounded-lg mt-1"
                placeholder="Enter 10-digit application number"
                value={appNumber}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setAppNumber(value);
                }}
              />
            </div>

            <div className="mb-4">
              <div className="font-mono text-xl mb-2 tracking-widest bg-slate-100 p-3 rounded-lg border">
                {captcha}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 p-3 border rounded-lg"
                  placeholder="Enter Captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />
                <button
                  onClick={() => setCaptcha(generateCaptcha())}
                  className="px-4 bg-slate-200 rounded-lg"
                >
                  ↻
                </button>
              </div>
            </div>

            <button
              onClick={handleStep1}
              className="w-full py-3 mt-4 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
            >
              Continue
            </button>
          </>
        )}

        {/* ------------------- STEP 2 ------------------- */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-slate-800">
              Step 2: Enter DOB & PIN
            </h2>

            <div className="mb-4 text-left">
              <label className="text-sm font-medium">Date of Birth</label>
              <input
                className="w-full p-3 border rounded-lg mt-1"
                placeholder="DD-MM-YYYY"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>



            <h2 className="text-lg font-semibold mb-4 text-slate-800">
              Step 3: PIN Verification & Agreement
            </h2>

            {/* PIN Display */}
            <div className="mb-4 text-left">
              <label className="text-sm font-medium mb-1 block">
                Enter PIN
              </label>

              <div className="flex justify-center mb-3">
                <div className="px-6 py-3 rounded-xl bg-green-100 border-2 border-green-500 text-green-700 font-bold text-2xl tracking-widest shadow">
                  {generatedPin}
                </div>
              </div>

              <input
                className="w-full p-3 border rounded-lg"
                placeholder="6-Digit PIN"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <label className="flex items-center gap-3 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agree1}
                onChange={(e) => setAgree1(e.target.checked)}
              />
              <span>I agree to terms & conditions</span>
            </label>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={agree2}
                onChange={(e) => setAgree2(e.target.checked)}
              />
              <span>I agree to code of misconduct</span>
            </label>

            <button
              onClick={handleStep2}
              className="w-full py-3 mt-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}

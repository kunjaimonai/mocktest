"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type School = {
  id: number;
  name: string;
  number: string;
  paymentStatus: "pending" | "completed";
  screenshot?: string;
  logo?: string;
};

const Register = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "paywall" | "success">("form");
  const [generatedId, setGeneratedId] = useState<number | null>(null);
  const router = useRouter();

  const fetchSchoolData = async () => {
      const { data, error } = await supabase.from("schools").select("*");
      if (error) {
        console.error("Error fetching school data:", error);
      } else {
        setSchools(data as School[]);
      }
    };
  
    useEffect(() => {
      fetchSchoolData();
    }, []);


  const generateUniqueId = (): number => {
    let id: number;
    const existingIds = new Set(schools.map((s) => s.id));
    do {
      id = Math.floor(1000 + Math.random() * 9000);
      id = Number(String(id).padStart(4, "0"));
    } while (existingIds.has(id));
    return id;
  };

  const handleSubmit = () => {
    if (!name.trim() || !mobile.trim() ) {
      toast.error("All fields are required");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setStep("paywall");
    toast("Proceed with payment to complete registration", { icon: "💳" });
  };

 const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  type: "screenshot" | "logo"
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append("id", name.replace(/\s+/g, "_") || "school");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.success) {
    if (type === "screenshot") setScreenshot(data.url);
    else setLogo(data.url);
  } else {
    toast.error("Failed to upload image");
  }
};


  const handlePaymentSubmit = async () => {
    if (!screenshot) {
      toast.error("Please upload your payment screenshot");
      return;
    }

    const newId = generateUniqueId();
    setGeneratedId(newId);

    const newSchool: School = {
      id: newId,
      name,
      number: mobile,
      paymentStatus: "pending",
      screenshot,
      logo: logo || "",
    };

    const updatedSchools = [...schools, newSchool];

    try {
      const res = await fetch("/api/updateSchools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSchools),
      });

      if (!res.ok) throw new Error("Failed to update database");

      toast.success("Registration submitted successfully!", { duration: 2000 });
      setStep("success");

      // Auto-copy the ID to clipboard
      await navigator.clipboard.writeText(String(newId));
      toast("Institution ID copied to clipboard!", { icon: "📋" });
    } catch (err) {
      console.error("Error adding new school:", err);
      toast.error("Server error while saving registration. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-100 flex items-center justify-center p-6">
      <Toaster position="top-center" />
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step === "form" && (
          <>
            <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
              Register Your Driving School
            </h1>
            <div className="space-y-5">
              {/* School Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800"
                  placeholder="Enter your school name"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:border file:rounded-md file:text-sm file:bg-slate-100 file:border-slate-300"
                />
                {logo && (
                  <div className="mt-3 flex justify-center">
                    <Image
                      src={logo}
                      alt="School Logo Preview"
                      width={120}
                      height={120}
                      className="rounded-lg border border-slate-300"
                    />
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800"
                  placeholder="10-digit mobile number"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg"
              >
                Continue to Payment
              </motion.button>
            </div>
          </>
        )}

        {step === "paywall" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Pay to Complete Registration
            </h2>
            <p className="text-slate-600 mb-4">
              Scan the QR code below and upload your payment screenshot.
            </p>
            <div className="flex justify-center mb-4">
              <Image
                src="/image.png"
                alt="Payment QR"
                width={200}
                height={200}
                className="rounded-lg border border-slate-300"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "screenshot")}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:border file:rounded-md file:text-sm file:bg-slate-100 file:border-slate-300 mb-4"
            />
            {screenshot && (
              <div className="mb-4">
                <Image
                  src={screenshot}
                  alt="Uploaded Screenshot"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg"
                />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePaymentSubmit}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg"
            >
              Payment Completed
            </motion.button>
            <button
              onClick={() => setStep("form")}
              className="mt-4 w-full py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              ← Go Back
            </button>
          </motion.div>
        )}

        {step === "success" && generatedId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-10"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-800">
              Registration Submitted!
            </h2>
            <p className="text-slate-600 mb-6">
              Your unique Institution Code is:
              <br />
              <span className="font-mono text-3xl font-bold text-sky-600 mt-2 block">
                {generatedId}
              </span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                toast.success("Redirecting to login...");
                setTimeout(() => {
                  router.push("/auth/login");
                }, 1500);
              }}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg"
            >
              I have noted my ID — Continue to Login
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Register;

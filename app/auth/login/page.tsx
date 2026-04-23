"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const revalidate = 3600;

export default function LoginPage() {
  const router = useRouter();
  const [institutionCode, setInstitutionCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!institutionCode.trim()) {
      setError("Please enter your institution code");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institutionCode: institutionCode.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      // Save login state
      localStorage.setItem("loggedInSchoolId", String(result.id));

      // Redirect
      if (result.id === 7927) {
        router.push("/mocktest");
      } else {
        router.push("/flow");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="flex flex-row items-center mb-8 gap-4">
        <Image src="/learners_logo.png" width={80} height={100} alt="" />
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-center">
          LEARNERS MOCK TEST KERALA
        </h1>
      </div>

      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
          Login
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Institution Code
            </label>

            <input
              type="text"
              value={institutionCode}
              onChange={(e) => {
                setInstitutionCode(e.target.value);
                setError("");
              }}
              placeholder="Enter 4-digit code"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800 text-center font-semibold text-lg tracking-widest"
              maxLength={4}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Checking..." : "Login"}
          </motion.button>

          <motion.div
            className="text-center text-sm text-slate-600 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/auth/register")}
              className="text-sky-600 font-medium hover:underline cursor-pointer"
            >
              Register now
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type School = {
  id: number;
  name: string;
  paymentstatus?: "pending" | "completed";
};

export default function LoginPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [institutionCode, setInstitutionCode] = useState("");
  const [error, setError] = useState("");

const handleLogin = async () => {
  setError("");

  if (!institutionCode.trim()) {
    setError("Please enter your institution code");
    return;
  }

  const { data: school, error: fetchError } = await supabase
    .from("schools")
    .select("*")
    .eq("id", institutionCode.trim())
    .single();

  if (fetchError || !school) {
    setError("Invalid institution code");
    return;
  }

  if (school.paymentstatus !== "completed") {
    setError("Payment not approved yet. Please contact admin.");
    return;
  }

  localStorage.setItem("loggedInSchoolId", String(school.id));
  if(school.id === 7927)
  router.push("/mocktest");
  else
  router.push("/flow");
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="flex flex-row items-center mb-8 gap-4">
        <Image src="/learners_logo.png" width={80} height={100} alt=""></Image>
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-center">
          <span id="text">LEARNERS MOCK TEST KERALA</span>
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
          {/* Institution Code Input */}
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
              placeholder="Enter 4-digit code (e.g. 1234)"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-800 text-center font-semibold text-lg tracking-widest"
              maxLength={4}
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Login button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg"
          >
            Login
          </motion.button>

          {/* Register link */}
          <motion.div
            className="text-center text-sm text-slate-600 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/auth/register")}
              className="text-sky-600 font-medium hover:underline"
            >
              Register now
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

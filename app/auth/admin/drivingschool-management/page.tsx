"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  CheckCircle2,
  XCircle,
  Clock,
  School,
  Phone,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type SchoolType = {
  id: number;
  name: string;
  number: string;
  paymentstatus: "pending" | "completed";
  logo: string | null;
  screenshot: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) {
      router.replace("/auth/admin/login");
      return;
    }

    const fetchSchools = async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(error);
        alert("Failed to fetch schools from database");
      } else if (data) {
        setSchools(data);
      }

      setLoading(false);
    };

    fetchSchools();
  }, [router]);

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.replace("/auth/admin/login");
  };

  // ✅ Approve Payment
  const approvePayment = async (id: number) => {
    const { error } = await supabase
      .from("schools")
      .update({ paymentstatus: "completed" })
      .eq("id", id);

    if (error) {
      alert("Failed to approve payment: " + error.message);
      return;
    }

    // Update UI locally
    setSchools((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, paymentstatus: "completed" } : s
      )
    );
  };

  // ✅ Reject (Delete School)
  const rejectPayment = async (id: number) => {
    const confirmDelete = confirm(
      "Rejecting will permanently delete this school. Continue?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("schools")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete school: " + error.message);
      return;
    }

    // Update UI locally
    setSchools((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-700 font-medium">
            Loading schools...
          </p>
        </div>
      </div>
    );

  const pending = schools.filter((s) => s.paymentstatus === "pending");
  const approved = schools.filter((s) => s.paymentstatus === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Payment Verification & School Management
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-2xl">
                <Clock className="w-6 h-6" />
                {pending.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">Pending</p>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-2 text-green-600 font-semibold text-2xl">
                <CheckCircle2 className="w-6 h-6" />
                {approved.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">Approved</p>
            </div>

            <Button
              onClick={logout}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pending Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Pending Verifications
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              {pending.length}
            </span>
          </div>

          {pending.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-lg">
                  No pending verification requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pending.map((school) => (
                <Card
                  key={school.id}
                  className="shadow-lg border-2 border-slate-200 hover:shadow-xl transition-shadow duration-200"
                >
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <School className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-black">
                          {school.id}
                          {school.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {school.number}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {school.screenshot ? (
                      <Image
                        src={school.screenshot}
                        alt="Payment Screenshot"
                        width={300}
                        height={300}
                        className="rounded-lg border w-full object-cover mb-4"
                      />
                    ) : (
                      <div className="mb-4 p-4 bg-slate-100 border rounded-lg text-center">
                        <p className="text-sm text-slate-500">No screenshot uploaded</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => approvePayment(school.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => rejectPayment(school.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Approved Schools */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Approved Schools</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {approved.length}
            </span>
          </div>

          {approved.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
              <CardContent className="py-8 text-center">
                <p className="text-slate-600">No approved schools yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approved.map((s) => (
                <Card
                  key={s.id}
                  className="border-l-4 border-l-green-500 shadow-sm"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <School className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{s.name}</p>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {s.number}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-green-100 rounded-full">
                        <span className="text-green-700 font-semibold text-sm flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Approved
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

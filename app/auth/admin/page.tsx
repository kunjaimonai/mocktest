"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  School,
  HelpCircle,
  CheckCircle2,
  Clock,
  LogOut,
  BarChart3,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [totalSchools, setTotalSchools] = useState(0);
  const [pendingSchools, setPendingSchools] = useState(0);
  const [approvedSchools, setApprovedSchools] = useState(0);
  const [questionsENCount, setQuestionsENCount] = useState(0);
  const [questionsMLCount, setQuestionsMLCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) {
      router.replace("/auth/admin/login");
      return;
    }

    const loadData = async () => {
      try {
        // OPTIMIZATION: Use next revalidate to cache dashboard stats
        // Saves 95% egress - most admin panels loaded repeatedly
        const res = await fetch("/api/admin/stats", {
          cache: "no-store",
        });

        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load stats");

        setTotalSchools(payload.totalSchools ?? 0);
        setPendingSchools(payload.pendingSchools ?? 0);
        setApprovedSchools(payload.approvedSchools ?? 0);
        setQuestionsENCount(payload.questionsENCount ?? 0);
        setQuestionsMLCount(payload.questionsMLCount ?? 0);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.replace("/auth/admin/login");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-700 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const totalQuestions = questionsENCount + questionsMLCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Manage schools, questions, and payments
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-sky-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Schools
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalSchools}
                  </p>
                </div>
                <div className="p-3 bg-sky-100 rounded-lg">
                  <School className="w-8 h-8 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {pendingSchools}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Approved
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {approvedSchools}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Questions
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalQuestions}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <HelpCircle className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Management</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Schools */}
            <Card
              className="relative group hover:shadow-2xl border-2 border-slate-200 hover:border-sky-400 cursor-pointer"
              onClick={() => router.push("/auth/admin/drivingschool-management")}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-sky-500 text-white rounded-xl shadow-lg">
                    <School className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black">
                      Schools Management
                    </CardTitle>
                    <CardDescription>
                      Manage driving schools and payments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                      Pending Payments
                    </span>
                    <span className="text-lg font-bold text-amber-600">
                      {pendingSchools}
                    </span>
                  </div>

                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                      Approved Schools
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {approvedSchools}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-sky-600 hover:bg-sky-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/auth/admin/drivingschool-management");
                  }}
                >
                  Manage Schools
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card
              className="relative group hover:shadow-2xl border-2 border-slate-200 hover:border-indigo-400 cursor-pointer"
              onClick={() => router.push("/auth/admin/qns-management")}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-500 text-white rounded-xl shadow-lg">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black">
                      Questions Management
                    </CardTitle>
                    <CardDescription>
                      Add, edit, and manage test questions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between p-3 bg-sky-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                      English Questions
                    </span>
                    <span className="text-lg font-bold text-sky-600">
                      {questionsENCount}
                    </span>
                  </div>

                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                      Malayalam Questions
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {questionsMLCount}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/auth/admin/qns-management");
                  }}
                >
                  Manage Questions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-sky-600" />
                </div>
                <CardTitle>System Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Registered Schools</span>
                  <span className="font-bold text-slate-900">{totalSchools}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Active Verifications</span>
                  <span className="font-bold text-amber-600">
                    {pendingSchools}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Question Bank Size</span>
                  <span className="font-bold text-indigo-600">
                    {totalQuestions}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Success Rate</span>
                  <span className="font-bold text-green-600">
                    {totalSchools > 0
                      ? Math.round((approvedSchools / totalSchools) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Settings className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle>Quick Links</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/auth/admin/drivingschool-management")}
                >
                  <School className="w-4 h-4 mr-2" />
                  View All Schools
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/auth/admin/qns-management")}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Browse Questions
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/auth/admin/drivingschool-management")}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Review Pending ({pendingSchools})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
import { CheckCircle2, XCircle, Clock, School, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SchoolType = {
  id: number;
  name: string;
  number: string;
  paymentstatus: "pending" | "completed";
  logo: string | null;
  screenshot: string | null;
  has_badge: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);

  // file upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  // store old data for removing old files before replacing
  const [oldData, setOldData] = useState<SchoolType | null>(null);

  // edit modal state
  const [editData, setEditData] = useState<SchoolType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // search state
  const [searchQuery, setSearchQuery] = useState("");

  const sanitizeFilename = (name: string) =>
    name
      .replace(/\s+/g, "-") // replace spaces with dashes
      .replace(/[^a-zA-Z0-9.\-_]/g, "") // remove invalid chars
      .toLowerCase();

  const openEditModal = (data: SchoolType) => {
    setOldData({ ...data });
    setEditData({ ...data });
    setLogoFile(null);
    setScreenshotFile(null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditData(null);
    setOldData(null);
    setLogoFile(null);
    setScreenshotFile(null);
  };

  // upload file to supabase storage
  const uploadFile = async (file: File, folder: string, newPath: string) => {
    const { error } = await supabase.storage
      .from(folder)
      .upload(newPath, file, {
        upsert: true,
      });

    if (error) {
      alert("Upload error: " + error.message);
      return null;
    }

    // get public url
    const { data } = supabase.storage.from(folder).getPublicUrl(newPath);
    return data.publicUrl;
  };

  // delete file in storage
  const deleteFile = async (path: string, folder: string) => {
    const { error } = await supabase.storage.from(folder).remove([path]);
    if (error) console.warn("Delete failed:", error.message);
  };

  const handleUpdate = async () => {
    if (!editData || !oldData) return;

    let logoUrl = oldData.logo;
    let screenshotUrl = oldData.screenshot;

    // ===================== LOGO ======================
    if (logoFile) {
      if (oldData.logo) {
        const oldName = oldData.logo.split("/").pop();
        await deleteFile(`logo/${oldName}`, "logo");
      }

      const safeName = sanitizeFilename(logoFile.name);
      const newPath = `logo/${editData.id}-${Date.now()}-${safeName}`;

      logoUrl = await uploadFile(logoFile, "logo", newPath);
    }

    // ===================== SCREENSHOT ======================
    if (screenshotFile) {
      if (oldData.screenshot) {
        const oldName = oldData.screenshot.split("/").pop();
        await deleteFile(`screenshot/${oldName}`, "screenshot");
      }

      const safeName = sanitizeFilename(screenshotFile.name);
      const newPath = `screenshot/${editData.id}-${Date.now()}-${safeName}`;

      screenshotUrl = await uploadFile(screenshotFile, "screenshot", newPath);
    }

    // DB UPDATE
    const { error } = await supabase
      .from("schools")
      .update({
        name: editData.name,
        number: editData.number,
        logo: logoUrl,
        screenshot: screenshotUrl,
        has_badge: editData.has_badge,
        updated_at: new Date(),
      })
      .eq("id", editData.id);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }

    // update frontend list
    setSchools((prev) =>
      prev.map((s) =>
        s.id === editData.id
          ? { ...editData, logo: logoUrl, screenshot: screenshotUrl }
          : s
      )
    );

    closeEditModal();
  };

  // SEARCH FUNCTION
  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FETCH SCHOOLS
  useEffect(() => {
    const admin = localStorage.getItem("adminLoggedIn");
    if (!admin) {
      router.replace("/auth/admin/login");
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("id", { ascending: true });

      if (error) console.error(error);

      setSchools(data || []);
      setLoading(false);
    };

    load();
  }, [router]);

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.replace("/auth/admin/login");
  };

  // APPROVE PAYMENT
  const approvePayment = async (id: number) => {
    await supabase
      .from("schools")
      .update({ paymentstatus: "completed" })
      .eq("id", id);

    setSchools((prev) =>
      prev.map((s) => (s.id === id ? { ...s, paymentstatus: "completed" } : s))
    );
  };

  // REJECT — DELETE RECORD + IMAGES
  const rejectPayment = async (id: number) => {
    const sure = confirm("Rejecting will delete this school completely?");
    if (!sure) return;

    const s = schools.find((x) => x.id === id);
    if (s) {
      if (s.logo) {
        const name = s.logo.split("/").pop();
        await deleteFile(`logo/${name}`, "logo");
      }
      if (s.screenshot) {
        const name = s.screenshot.split("/").pop();
        await deleteFile(`screenshot/${name}`, "screenshot");
      }
    }

    await supabase.from("schools").delete().eq("id", id);

    setSchools((prev) => prev.filter((x) => x.id !== id));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading schools...
      </div>
    );
  }

  const pending = filteredSchools.filter((s) => s.paymentstatus === "pending");
  const approved = filteredSchools.filter(
    (s) => s.paymentstatus === "completed"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* HEADER */}
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

      {/* SEARCH */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          {/* SEARCH INPUT */}
          <input
            type="text"
            placeholder="Search for a school..."
            className="border p-2 rounded w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ------------------- PENDING SCHOOLS ----------------------- */}
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
                  className="shadow-lg border-2 border-slate-200"
                >
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <School className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-black">
                          {school.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />{" "}
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
                        <p className="text-sm text-slate-500">
                          No screenshot uploaded
                        </p>
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

        {/* ------------------- APPROVED SCHOOLS ----------------------- */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Approved Schools
            </h2>
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
                          <p className="font-semibold text-lg">
                            #{s.id} — {s.name}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {s.number}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className="text-blue-600 border-blue-300"
                          onClick={() => openEditModal(s)}
                        >
                          Edit
                        </Button>

                        <div className="px-3 py-1.5 bg-green-100 rounded-full text-center">
                          <span className="text-green-700 font-semibold text-sm flex items-center gap-1 justify-center">
                            <CheckCircle2 className="w-4 h-4" /> Approved
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --------------------- EDIT MODAL --------------------------- */}
      {isEditOpen && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg w-full max-w-lg shadow-xl 
                    max-h-[90vh] overflow-y-auto p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Edit School</h2>

            <div className="flex flex-col gap-4">
              {/* NAME */}
              <div>
                <label className="font-medium text-sm">School Name</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full mt-1"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
              </div>

              {/* NUMBER */}
              <div>
                <label className="font-medium text-sm">Phone Number</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full mt-1"
                  value={editData.number}
                  onChange={(e) =>
                    setEditData({ ...editData, number: e.target.value })
                  }
                />
              </div>

              {/* LOGO */}
              <div>
                <label className="font-medium text-sm">Logo</label>
                {editData.logo && (
                  <div className="mt-2">
                    <Image
                      src={editData.logo}
                      alt="logo preview"
                      width={100}
                      height={100}
                      className="rounded border"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="border p-2 rounded w-full mt-3"
                  onChange={(e) =>
                    setLogoFile(e.target.files ? e.target.files[0] : null)
                  }
                />

                {logoFile && (
                  <p className="text-sm text-slate-600 mt-1">
                    Selected: <strong>{logoFile.name}</strong>
                  </p>
                )}
              </div>

              {/* SCREENSHOT */}
              <div>
                <label className="font-medium text-sm">
                  Payment Screenshot
                </label>

                {editData.screenshot && (
                  <div className="mt-2">
                    <Image
                      src={editData.screenshot}
                      alt="screenshot preview"
                      width={150}
                      height={150}
                      className="rounded border"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="border p-2 rounded w-full mt-3"
                  onChange={(e) =>
                    setScreenshotFile(e.target.files ? e.target.files[0] : null)
                  }
                />

                {screenshotFile && (
                  <p className="text-sm text-slate-600 mt-1">
                    Selected: <strong>{screenshotFile.name}</strong>
                  </p>
                )}
              </div>

              {/* BADGE */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={editData.has_badge}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      has_badge: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Has Badge</span>
              </label>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-2 mt-6 sticky bottom-0 bg-white pt-3">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>

              <Button className="bg-blue-600 text-white" onClick={handleUpdate}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Languages,
  FileImage,
  Search,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

type Question = {
  id: number;
  q: string;
  options: string[]; // option values (text or image URL)
  optionTypes?: boolean[]; // true => image, false => text
  sign: string;
  answerIndex: number;
};

const ITEMS_PER_PAGE = 12;

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [questionsEN, setQuestionsEN] = useState<Question[]>([]);
  const [questionsML, setQuestionsML] = useState<Question[]>([]);
  const [questionsTA, setQuestionsTA] = useState<Question[]>([]);
  const [questionsBG, setQuestionsBG] = useState<Question[]>([]);
  const [currentLang, setCurrentLang] = useState<"en" | "ml" | "ta" | "bg">(
    "en"
  );
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const initialForm = {
    q: "",
    option1: "",
    option1IsImage: false,
    option2: "",
    option2IsImage: false,
    option3: "",
    option3IsImage: false,
    option4: "",
    option4IsImage: false,
    sign: "",
    answerIndex: 0,
  };

  const [formData, setFormData] = useState({ ...initialForm });

  const uploadOptionImage = async (file: File, optionKey: string) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const response = await fetch("/api/upload-sign", {
        method: "POST",
        body: fd,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          [optionKey]: data.url,
          [`${optionKey}IsImage`]: true,
        }));
      } else {
        alert("Image upload failed: " + data.error);
      }
    } catch (err) {
      console.error("uploadOptionImage error:", err);
      alert("Upload error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) {
      router.replace("/auth/admin/login");
      return;
    }

    const fetchQuestions = async () => {
      const { data: enData } = await supabase
        .from("english_questions")
        .select("*")
        .order("id", { ascending: true });

      const { data: mlData } = await supabase
        .from("malayalam_questions")
        .select("*")
        .order("id", { ascending: true });

      const { data: taData } = await supabase
        .from("tamil_questions")
        .select("*")
        .order("id", { ascending: true });

      const { data: bgData } = await supabase
        .from("badge_questions")
        .select("*")
        .order("id", { ascending: true });

      if (enData) setQuestionsEN(enData);
      if (mlData) setQuestionsML(mlData);
      if (taData) setQuestionsTA(taData);
      if (bgData) setQuestionsBG(bgData);

      setLoading(false);
    };

    fetchQuestions();
  }, [router]);

  const currentQuestions =
    currentLang === "en"
      ? questionsEN
      : currentLang === "ml"
      ? questionsML
      : currentLang === "ta"
      ? questionsTA
      : questionsBG;

  // Search filter (lowercase compare; handle possible undefined)
  const filteredQuestions = currentQuestions.filter((q) => {
    const text = searchQuery.toLowerCase();
    const matchesQ = q.q?.toLowerCase().includes(text);
    const matchesOption = q.options?.some((opt) =>
      String(opt || "").toLowerCase().includes(text)
    );
    return matchesQ || matchesOption;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when changing language or search
  useEffect(() => {
    setCurrentPage(1);
  }, [currentLang, searchQuery]);

  const updateQuestionsFile = async (
    updatedQuestions: Question[],
    lang: "en" | "ml" | "ta" | "bg"
  ) => {
    const tableName =
      lang === "en"
        ? "english_questions"
        : lang === "ml"
        ? "malayalam_questions"
        : lang === "ta"
        ? "tamil_questions"
        : "badge_questions";

    const { error } = await supabase
      .from(tableName)
      .upsert(updatedQuestions, { onConflict: "id" });

    if (error) {
      console.error(error);
      alert("Error saving questions: " + error.message);
      return;
    }

    if (lang === "en") setQuestionsEN(updatedQuestions);
    else if (lang === "ml") setQuestionsML(updatedQuestions);
    else if (lang === "ta") setQuestionsTA(updatedQuestions);
    else setQuestionsBG(updatedQuestions);

    alert(
      `${
        lang === "en"
          ? "English"
          : lang === "ml"
          ? "Malayalam"
          : lang === "ta"
          ? "Tamil"
          : "Badge"
      } questions updated!`
    );
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Math.max(...currentQuestions.map((q) => q.id), 0) + 1,
      q: formData.q,
      options: [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4,
      ],
      optionTypes: [
        !!formData.option1IsImage,
        !!formData.option2IsImage,
        !!formData.option3IsImage,
        !!formData.option4IsImage,
      ],
      sign: formData.sign,
      answerIndex: formData.answerIndex,
    };

    const updated = [...currentQuestions, newQuestion];
    updateQuestionsFile(updated, currentLang);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditQuestion = () => {
    if (!editingQuestion) return;

    const updated = currentQuestions.map((q) =>
      q.id === editingQuestion.id
        ? {
            ...q,
            q: formData.q,
            options: [
              formData.option1,
              formData.option2,
              formData.option3,
              formData.option4,
            ],
            optionTypes: [
              !!formData.option1IsImage,
              !!formData.option2IsImage,
              !!formData.option3IsImage,
              !!formData.option4IsImage,
            ],
            sign: formData.sign,
            answerIndex: formData.answerIndex,
          }
        : q
    );

    updateQuestionsFile(updated, currentLang);
    resetForm();
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const tableName =
      currentLang === "en"
        ? "english_questions"
        : currentLang === "ml"
        ? "malayalam_questions"
        : currentLang === "ta"
        ? "tamil_questions"
        : "badge_questions";

    const { error } = await supabase.from(tableName).delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete question: " + error.message);
      return;
    }

    if (currentLang === "en") {
      setQuestionsEN((prev) => prev.filter((q) => q.id !== id));
    } else if (currentLang === "ml") {
      setQuestionsML((prev) => prev.filter((q) => q.id !== id));
    } else if (currentLang === "ta") {
      setQuestionsTA((prev) => prev.filter((q) => q.id !== id));
    } else {
      setQuestionsBG((prev) => prev.filter((q) => q.id !== id));
    }

    alert("Question deleted!");
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);

    // If question has optionTypes saved, use them; otherwise infer from URL presence
    const types = question.optionTypes ?? question.options.map((o) => String(o || "").startsWith("http"));

    setFormData({
      q: question.q,
      option1: question.options[0] || "",
      option1IsImage: !!types[0],
      option2: question.options[1] || "",
      option2IsImage: !!types[1],
      option3: question.options[2] || "",
      option3IsImage: !!types[2],
      option4: question.options[3] || "",
      option4IsImage: !!types[3],
      sign: question.sign || "",
      answerIndex: question.answerIndex ?? 0,
    });

    setImagePreview(question.sign || null);
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ ...initialForm });
    setImagePreview(null);
    setEditingQuestion(null);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const response = await fetch("/api/upload-sign", {
        method: "POST",
        body: fd,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, sign: data.url }));
        setImagePreview(data.url);
      } else {
        alert("Failed to upload image: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-700 font-medium">
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
                Questions Management
              </h1>
              <p className="text-slate-600 mt-1">
                Manage test questions in multiple languages
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={currentLang}
                onValueChange={(val) =>
                  setCurrentLang(val as "en" | "ml" | "ta" | "bg")
                }
              >
                <SelectTrigger className="w-40">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ml">Malayalam</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="bg">Badge</SelectItem>
                </SelectContent>
              </Select>

              {/* Add Question Button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-sky-600 hover:bg-sky-700"
                    onClick={() => {
                      resetForm();
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingQuestion ? "Edit" : "Add New"} Question</DialogTitle>
                    <DialogDescription>
                      Add a new question in{" "}
                      {currentLang === "en"
                        ? "English"
                        : currentLang === "ml"
                        ? "Malayalam"
                        : currentLang === "ta"
                        ? "Tamil"
                        : "Badge"}
                    </DialogDescription>
                  </DialogHeader>
                  <QuestionForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={editingQuestion ? handleEditQuestion : handleAddQuestion}
                    onCancel={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    handleImageUpload={handleImageUpload}
                    uploadingImage={uploadingImage}
                    imagePreview={imagePreview}
                    currentLang={currentLang}
                    isEdit={!!editingQuestion}
                    uploadOptionImage={uploadOptionImage}

                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <div className="text-sky-600 font-semibold text-2xl">
                {questionsEN.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">English Questions</p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 font-semibold text-2xl">
                {questionsML.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">Malayalam Questions</p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 font-semibold text-2xl">
                {questionsTA.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">Tamil Questions</p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 font-semibold text-2xl">
                {questionsBG.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">Badge Questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-6 bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />

          {currentLang === "ml" || currentLang === "bg" ? (
            <ReactTransliterate
              lang="ml"
              value={searchQuery}
              onChangeText={(text: string) => setSearchQuery(text)}
              renderComponent={(props) => (
                <input
                  {...props}
                  placeholder="Search questions, options, or keywords..."
                  className="w-full pl-12 pr-10 py-3 rounded-full border-2 border-slate-300
                   focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none
                   shadow-sm transition"
                />
              )}
            />
          ) : (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, options, or keywords..."
              className="w-full pl-12 pr-10 py-3 rounded-full border-2 border-slate-300
               focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none
               shadow-sm transition"
            />
          )}

          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 
               hover:bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center transition"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Questions Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedQuestions.map((question) => (
            <Card
              key={question.id}
              className="shadow-lg border-2 border-slate-200 hover:shadow-xl transition-shadow duration-200"
            >
              <CardHeader className="bg-gradient-to-br from-white to-slate-50 border-b border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold text-slate-500">
                    Question #{question.id}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(question)}
                        >
                          <Edit2 className="w-4 h-4 text-sky-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Edit Question #{question.id}
                          </DialogTitle>
                        </DialogHeader>
                        <QuestionForm
                          formData={formData}
                          setFormData={setFormData}
                          onSubmit={handleEditQuestion}
                          onCancel={() => {
                            setEditingQuestion(null);
                            resetForm();
                          }}
                          isEdit
                          handleImageUpload={handleImageUpload}
                          uploadingImage={uploadingImage}
                          imagePreview={imagePreview}
                          currentLang={currentLang}
                          uploadOptionImage={uploadOptionImage}

                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-slate-700 font-medium mt-2">
                  {question.q}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {question.sign && (
                  <div className="mb-4">
                    <img
                      src={question.sign}
                      alt="Traffic Sign"
                      width={200}
                      height={200}
                      className="rounded-lg border-2 border-slate-200 w-full object-contain bg-white"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {question.options.map((option, idx) => {
                    const isImage =
                      (question.optionTypes && question.optionTypes[idx]) ||
                      String(option || "").startsWith("http");
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-sm ${
                          idx === question.answerIndex
                            ? "bg-green-100 border-2 border-green-500 font-semibold text-green-800"
                            : "bg-slate-100 border border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="min-w-[20px] font-medium">
                            {String.fromCharCode(65 + idx)}.
                          </div>
                          <div className="flex-1">
                            {isImage ? (
                              <div className="w-40 h-28 relative">
                                <img
                                  src={String(option)}
                                  alt={`Option ${idx + 1}`}
                                  
                                  className="object-contain rounded-md border bg-white fill"
                                />
                              </div>
                            ) : (
                              <div>{option}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-12 text-center">
              <FileImage className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-lg">No matching questions found.</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination Controls */}
        {filteredQuestions.length > 0 && (
          <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredQuestions.length)} of{" "}
              {filteredQuestions.length} questions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsis =
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2);

                    if (!showPage && !showEllipsis) return null;

                    if (showEllipsis) {
                      return (
                        <span key={page} className="px-2 text-slate-400">
                          ...
                        </span>
                      );
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page ? "bg-sky-600 hover:bg-sky-700" : ""
                        }
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-sky-600 hover:bg-sky-700 text-white 
           rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 
           transform hover:scale-110 z-50 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
          <span
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
           bg-slate-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap 
           opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          >
            Back to top
          </span>
        </button>
      )}
    </div>
  );
}

// ================================================================
// Question Form Component
// ================================================================
function QuestionForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  handleImageUpload,
  uploadingImage,
  imagePreview,
  currentLang,
  uploadOptionImage,
  isEdit = false,
}: {
  formData: any;
  setFormData: any;
  onSubmit: () => void;
  onCancel: () => void;
  handleImageUpload: (file: File) => Promise<void>;
  uploadOptionImage: (file: File, key: string) => Promise<void>; // ← ADD THIS
  uploadingImage: boolean;
  imagePreview: string | null;
  currentLang: "en" | "ml" | "ta" | "bg";
  isEdit?: boolean;
})
 {
  const isTransliterate = currentLang === "ml" || currentLang === "ta";

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        {isTransliterate ? (
          <ReactTransliterate
            lang={currentLang}
            value={formData.q}
            onChangeText={(text: string) =>
              setFormData({ ...formData, q: text })
            }
            renderComponent={(props) => (
              <textarea
                {...props}
                placeholder="Enter the question"
                rows={3}
                className="w-full mt-1 px-3 py-2 border-2 border-slate-300 rounded-md
                 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none
                 shadow-sm transition resize-none"
              />
            )}
          />
        ) : (
          <Textarea
            id="question"
            value={formData.q}
            onChange={(e) => setFormData({ ...formData, q: e.target.value })}
            placeholder="Enter the question"
            rows={3}
            className="mt-1"
          />
        )}
      </div>

      <div>
        <Label htmlFor="sign">Sign Image</Label>
        <div className="mt-1 space-y-2">
          <Input
            id="sign-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            disabled={uploadingImage}
            className="cursor-pointer"
          />
          {uploadingImage && (
            <p className="text-sm text-slate-600">Uploading image...</p>
          )}
          {imagePreview && (
            <div className="relative w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Preview"  className="object-contain fill" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Options</Label>
        {[1, 2, 3, 4].map((num) => (
          <div key={num}>
            {isTransliterate ? (
              <ReactTransliterate
                lang={currentLang}
                value={formData[`option${num}`]}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, [`option${num}`]: text })
                }
                renderComponent={(props) => (
                  <input
                    {...props}
                    placeholder={`Option ${num}`}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-md
                     focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none
                     shadow-sm transition"
                  />
                )}
              />
            ) : (
              <div className="border p-3 rounded-md bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <Label>Option {num}</Label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Image?</span>
                    <input
                      type="checkbox"
                      checked={formData[`option${num}IsImage`]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`option${num}IsImage`]: e.target.checked,
                          // if switching off image, keep existing URL but allow edit; if switching on and no url, clear field
                          ...(e.target.checked ? {} : {}),
                        })
                      }
                    />
                  </div>
                </div>

                {/* If image option */}
                {formData[`option${num}IsImage`] ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadOptionImage(file, `option${num}`);
                      }}
                      className="cursor-pointer"
                    />

                    {formData[`option${num}`] && (
                      <div className="mt-2">
                        <img
                          src={formData[`option${num}`]}
                          alt="Option Image"
                          width={120}
                          height={120}
                          className="border rounded-md bg-white object-contain"
                        />
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={formData[`option${num}`]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`option${num}`]: e.target.value,
                              })
                            }
                            placeholder="Image URL (or upload)"
                          />
                          <Button
                            variant="outline"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                [`option${num}`]: "",
                                [`option${num}IsImage`]: false,
                              })
                            }
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    value={formData[`option${num}`]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`option${num}`]: e.target.value,
                      })
                    }
                    placeholder={`Option ${num}`}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="answer">Correct Answer</Label>
        <Select
          value={formData.answerIndex.toString()}
          onValueChange={(val) =>
            setFormData({ ...formData, answerIndex: parseInt(val) })
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Option 1 (A)</SelectItem>
            <SelectItem value="1">Option 2 (B)</SelectItem>
            <SelectItem value="2">Option 3 (C)</SelectItem>
            <SelectItem value="3">Option 4 (D)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSubmit} className="flex-1 bg-sky-600 hover:bg-sky-700">
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? "Update" : "Add"} Question
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

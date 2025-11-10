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
  ImageIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";


type Question = {
  id: number;
  q: string;
  options: string[];
  sign: string;
  answerIndex: number;
};


export default function AdminQuestionsPage() {
  const router = useRouter();
  const [questionsEN, setQuestionsEN] = useState<Question[]>([]);
  const [questionsML, setQuestionsML] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<"en" | "ml">("en");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    q: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    sign: "",
    answerIndex: 0,
  });

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

    if (enData) setQuestionsEN(enData);
    if (mlData) setQuestionsML(mlData);

    setLoading(false);
  };

  fetchQuestions();
}, [router]);

  const currentQuestions = currentLang === "en" ? questionsEN : questionsML;

 const updateQuestionsFile = async (
  updatedQuestions: Question[],
  lang: "en" | "ml"
) => {
  const tableName = lang === "en" ? "english_questions" : "malayalam_questions";

  const { error } = await supabase
    .from(tableName)
    .upsert(updatedQuestions, { onConflict: "id" });

  if (error) {
    console.error(error);
    alert("Error saving questions: " + error.message);
    return;
  }

  if (lang === "en") setQuestionsEN(updatedQuestions);
  else setQuestionsML(updatedQuestions);

  alert(`${lang === "en" ? "English" : "Malayalam"} questions updated!`);
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
            sign: formData.sign,
            answerIndex: formData.answerIndex,
          }
        : q
    );

    updateQuestionsFile(updated, currentLang);
    resetForm();
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const updated = currentQuestions.filter((q) => q.id !== id);
    updateQuestionsFile(updated, currentLang);
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      q: question.q,
      option1: question.options[0] || "",
      option2: question.options[1] || "",
      option3: question.options[2] || "",
      option4: question.options[3] || "",
      sign: question.sign,
      answerIndex: question.answerIndex,
    });
    setImagePreview(question.sign || null);
  };

  const resetForm = () => {
    setFormData({
      q: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      sign: "",
      answerIndex: 0,
    });
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
}
 else {
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
                onValueChange={(val) => setCurrentLang(val as "en" | "ml")}
              >
                <SelectTrigger className="w-40">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ml">Malayalam</SelectItem>
                </SelectContent>
              </Select>

              {/* Add Question Button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-sky-600 hover:bg-sky-700"
                    onClick={resetForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Add a new question in{" "}
                      {currentLang === "en" ? "English" : "Malayalam"}
                    </DialogDescription>
                  </DialogHeader>
                  <QuestionForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAddQuestion}
                    onCancel={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    handleImageUpload={handleImageUpload}
                    uploadingImage={uploadingImage}
                    imagePreview={imagePreview}
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentQuestions.map((question) => (
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
                    <Image
                      src={question.sign}
                      alt="Traffic Sign"
                      width={200}
                      height={200}
                      className="rounded-lg border-2 border-slate-200 w-full object-contain bg-white"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-sm ${
                        idx === question.answerIndex
                          ? "bg-green-100 border-2 border-green-500 font-semibold text-green-800"
                          : "bg-slate-100 border border-slate-300 text-slate-700"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {currentQuestions.length === 0 && (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-lg">
                No questions yet. Add your first question!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
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
  isEdit = false,
}: {
  formData: any;
  setFormData: any;
  onSubmit: () => void;
  onCancel: () => void;
  handleImageUpload: (file: File) => Promise<void>;
  uploadingImage: boolean;
  imagePreview: string | null;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={formData.q}
          onChange={(e) => setFormData({ ...formData, q: e.target.value })}
          placeholder="Enter the question"
          rows={3}
          className="mt-1"
        />
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
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Options</Label>
        {[1, 2, 3, 4].map((num) => (
          <Input
            key={num}
            value={formData[`option${num}`]}
            onChange={(e) =>
              setFormData({ ...formData, [`option${num}`]: e.target.value })
            }
            placeholder={`Option ${num}`}
          />
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
        <Button
          onClick={onSubmit}
          className="flex-1 bg-sky-600 hover:bg-sky-700"
        >
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

"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Watermark from "../components/watermark";
import Image from "next/image";

function handleLogout() {
  localStorage.removeItem("loggedInSchoolId");
  localStorage.removeItem("loggedInSchoolName");
  localStorage.removeItem("loggedInSchoolNum");
  window.location.href = "/";
}

type Question = {
  id: number;
  q: string;
  sign?: string;
  options: string[];
  answerIndex: number;
};

type School = {
  id: number;
  name: string;
  number: string;
  paymentStatus: string;
  logo: string;
  screenshot: string;
  has_badge: boolean;
};

interface MockTestPageProps {
  school?: School;
}

type StartQuestionsResponse = {
  total: number;
  questions: Question[];
  orderIds: number[];
  nextOffset: number;
  done: boolean;
};

type NextChunkResponse = {
  questions: Question[];
  nextOffset: number;
  done: boolean;
};

function shuffleArray<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const MockTestPage: React.FC<MockTestPageProps> = ({ school }) => {
  const [testStarted, setTestStarted] = useState(false);
  const [testMode, setTestMode] = useState<"exam" | "practice">("exam");

  const [schoolData, setSchoolData] = useState<School | null>(school || null);
  const [language, setLanguage] = useState<"en" | "ml" | "ta" | "bg">("en");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [nextOffset, setNextOffset] = useState<number>(0);
  const [allChunksLoaded, setAllChunksLoaded] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [attendedCount, setAttendedCount] = useState<number>(0);
  const [timeoutCount, setTimeoutCount] = useState<number>(0);
  const [trueCount, setTrueCount] = useState<number>(0);
  const [falseCount, setFalseCount] = useState<number>(0);
  const [practiceChecked, setPracticeChecked] = useState<boolean>(false);
  const [practiceIsCorrect, setPracticeIsCorrect] = useState<boolean | null>(null);
  const [examChecked, setExamChecked] = useState<boolean>(false);
  const [examIsCorrect, setExamIsCorrect] = useState<boolean | null>(null);
  const [examTimedOut, setExamTimedOut] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(30);

  const [finished, setFinished] = useState<boolean>(false);
  const [testPassed, setTestPassed] = useState<boolean>(false);

  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceRef = useRef<NodeJS.Timeout | null>(null);
  const examCheckedRef = useRef<boolean>(false);
  const examAdvancePendingRef = useRef<boolean>(false);

  const isBadgeExam = testMode === "exam" && language === "bg";
  const EXAM_QUESTION_LIMIT = isBadgeExam ? 20 : 30;
  const EXAM_PASS_MARK = isBadgeExam ? 12 : 18;
  const PRACTICE_QUESTION_LIMIT = 60;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "exam" || mode === "practice") {
      setTestMode(mode);
    }
  }, []);

  function resolveImageSrc(url?: string | null) {
    if (!url) return undefined;
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "cprcrmwwpcixfhfyjmuk.supabase.co") {
        return url;
      }
    } catch {
      return `/api/mocktest?url=${encodeURIComponent(url)}`;
    }
    return `/api/mocktest?url=${encodeURIComponent(url)}`;
  }

  function renderAnswerContent(value?: string) {
    if (!value) return null;
    const isImage = value.startsWith("http://") || value.startsWith("https://");

    return isImage ? (
      <div className="relative mt-2 w-40 h-28">
        <Image
          src={resolveImageSrc(value) ?? ""}
          alt="Correct answer"
          fill
          unoptimized
          className="object-contain rounded-lg border bg-white"
        />
      </div>
    ) : (
      <span className="font-semibold">{value}</span>
    );
  }

  async function fetchFromAPI(body: object) {
    const res = await fetch("/api/mocktest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  }

  useEffect(() => {
    if (!schoolData && typeof window !== "undefined") {
      const storedId = localStorage.getItem("loggedInSchoolId");
      if (storedId) {
        fetchFromAPI({ type: "school", schoolId: parseInt(storedId) })
          .then((data) => setSchoolData(data))
          .catch(console.error);
      }
    }
  }, [schoolData]);

  useEffect(() => {
    if (!testStarted) return;

    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const startData = (await fetchFromAPI({
          type: "start",
          language,
          mode: testMode,
          questionLimit:
            testMode === "exam" ? EXAM_QUESTION_LIMIT : PRACTICE_QUESTION_LIMIT,
        })) as StartQuestionsResponse;

        const activeOrderIds =
          testMode === "exam"
            ? (startData?.orderIds ?? []).slice(0, EXAM_QUESTION_LIMIT)
            : startData?.orderIds ?? [];

        const activeQuestions =
          testMode === "exam"
            ? (startData?.questions ?? []).slice(0, EXAM_QUESTION_LIMIT)
            : shuffleArray(startData?.questions ?? []);

        setTotalQuestions(
          testMode === "exam"
            ? Math.min(EXAM_QUESTION_LIMIT, startData?.total ?? 0)
            : startData?.total ?? 0
        );
        setQuestions(activeQuestions);
        setQuestionOrder(activeOrderIds);
        setNextOffset(activeQuestions.length);
        setAllChunksLoaded(
          testMode === "exam"
            ? activeOrderIds.length <= activeQuestions.length
            : !!startData?.done
        );

        setCurrentIdx(0);
        setScore(0);
        setSelected(null);
        setPracticeChecked(false);
        setPracticeIsCorrect(null);
        setExamChecked(false);
        setExamIsCorrect(null);
        setExamTimedOut(false);
        examCheckedRef.current = false;
        examAdvancePendingRef.current = false;
        setFinished(false);
        setTestPassed(false);
        setTimeLeft(30);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [language, testStarted, testMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewport = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (questions.length > 0 && testMode === "exam") {
      setTimeLeft(30);
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIdx, questions, startTimer, testMode]);

  const handleSelect = (i: number) => {
    setSelected(i);
  };

  const clearAdvanceTimer = useCallback(() => {
    if (advanceRef.current) {
      clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
    examAdvancePendingRef.current = false;
  }, []);

  const goToNextQuestion = useCallback(async (resolvedScore?: number) => {
    clearAdvanceTimer();

    setSelected(null);
    setPracticeChecked(false);
    setPracticeIsCorrect(null);
    setExamChecked(false);
    setExamIsCorrect(null);
    setExamTimedOut(false);
    examCheckedRef.current = false;
    examAdvancePendingRef.current = false;

    const nextIdx = currentIdx + 1;
    if (nextIdx >= totalQuestions) {
      if (testMode === "practice") {
        setTestPassed(true);
      } else if (testMode === "exam") {
        setTestPassed((resolvedScore ?? score) >= EXAM_PASS_MARK);
      }
      setFinished(true);
      return;
    }

    let loadedQuestions = questions;
    if (!loadedQuestions[nextIdx] && !allChunksLoaded) {
      try {
        const chunk = (await fetchFromAPI({
          type: "nextChunk",
          language,
          offset: nextOffset,
          orderIds: questionOrder,
        })) as NextChunkResponse;

        const fetched = chunk?.questions ?? [];
        loadedQuestions = [...loadedQuestions, ...fetched];

        setQuestions(loadedQuestions);
        setNextOffset(chunk?.nextOffset ?? nextOffset + fetched.length);
        setAllChunksLoaded(!!chunk?.done || fetched.length === 0);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    if (!loadedQuestions[nextIdx]) {
      setFinished(true);
      return;
    }

    setCurrentIdx(nextIdx);
    if (testMode === "exam") {
      setTimeLeft(30);
    }
  }, [
    allChunksLoaded,
    clearAdvanceTimer,
    currentIdx,
    language,
    nextOffset,
    questions,
    questionOrder,
    score,
    totalQuestions,
    testMode,
  ]);

  const handleNext = useCallback(async () => {
    clearAdvanceTimer();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentQuestion = questions[currentIdx];
    if (!currentQuestion) return;

    if (testMode === "practice" && !practiceChecked) {
      const isCorrect = selected === currentQuestion.answerIndex;
      setAttendedCount((v) => v + 1);
      if (isCorrect) {
        setScore((prev) => prev + 1);
        setTrueCount((v) => v + 1);
      } else {
        setFalseCount((v) => v + 1);
      }
      setPracticeIsCorrect(isCorrect);
      setPracticeChecked(true);
      return;
    }

    if (testMode === "exam" && !examChecked) {
      if (examAdvancePendingRef.current) return;

      const isCorrect = selected === currentQuestion.answerIndex;
      // count attendance if the user selected an answer
      if (selected !== null) {
        setAttendedCount((v) => v + 1);
      } else {
        // timed out on this question
        setTimeoutCount((v) => v + 1);
        setExamTimedOut(true);
      }

      if (isCorrect) {
        const newScore = score + 1;
        setScore(newScore);
        setTrueCount((v) => v + 1);
      } else {
        if (selected !== null) setFalseCount((v) => v + 1);
      }

      setExamIsCorrect(isCorrect);
      setExamChecked(true);
      examCheckedRef.current = true;
      examAdvancePendingRef.current = true;
      advanceRef.current = setTimeout(() => {
        void goToNextQuestion(isCorrect ? score + 1 : score);
      }, 2000);
      return;
    }

    const isCorrect = selected === currentQuestion.answerIndex;
    // For exam mode we already handled scoring when showing feedback, so only
    // increment here for non-exam flows (or defensive fallback).
    if (isCorrect && testMode !== "exam") {
      const newScore = score + 1;
      setScore(newScore);
    }

    await goToNextQuestion();
  }, [
    clearAdvanceTimer,
    currentIdx,
    goToNextQuestion,
    questions,
    selected,
    score,
    practiceChecked,
    examChecked,
    language,
    testMode,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentIdx <= 0) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSelected(null);
    setCurrentIdx((idx) => Math.max(0, idx - 1));
  }, [currentIdx]);

  useEffect(() => {
    if (testMode === "exam" && timeLeft <= 0 && !finished && !examCheckedRef.current && !examAdvancePendingRef.current) {
      if (timerRef.current) clearInterval(timerRef.current);
      void handleNext();
    }
  }, [timeLeft, finished, handleNext, testMode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-slate-700">
        Loading questions & caching images...
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Select Your Language
            </h1>
            <p className="text-slate-600">
              Choose your preferred language to begin
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100 space-y-4">
            <h2 className="text-2xl font-bold text-sky-700 text-center mb-4">
              LEARNERS MOCKTEST
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => setLanguage("en")}
                className={`w-full px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                  language === "en"
                    ? "bg-sky-600 text-white shadow-md scale-105"
                    : "bg-slate-50 border-2 border-sky-200 text-slate-700 hover:border-sky-400 hover:bg-sky-50"
                }`}
              >
                English
              </button>

              <button
                onClick={() => setLanguage("ml")}
                className={`w-full px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                  language === "ml"
                    ? "bg-sky-600 text-white shadow-md scale-105"
                    : "bg-slate-50 border-2 border-sky-200 text-slate-700 hover:border-sky-400 hover:bg-sky-50"
                }`}
              >
                മലയാളം
              </button>

              <button
                onClick={() => setLanguage("ta")}
                className={`w-full px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                  language === "ta"
                    ? "bg-sky-600 text-white shadow-md scale-105"
                    : "bg-slate-50 border-2 border-sky-200 text-slate-700 hover:border-sky-400 hover:bg-sky-50"
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {schoolData?.has_badge && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 shadow-lg border border-amber-200 space-y-4">
              <h2 className="text-2xl font-bold text-amber-700 text-center mb-4">
                BADGE MOCKTEST
              </h2>

              <button
                onClick={() => setLanguage("bg")}
                className={`w-full px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                  language === "bg"
                    ? "bg-amber-600 text-white shadow-md scale-105"
                    : "bg-white border-2 border-amber-300 text-slate-700 hover:border-amber-500 hover:bg-amber-50"
                }`}
              >
                Badge
              </button>
            </div>
          )}

          <button
            onClick={() => setTestStarted(true)}
            disabled={!language}
            className={`w-full px-8 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-200 ${
              language
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {language
              ? testMode === "practice"
                ? "Start Practice →"
                : "Start Test →"
              : "Select Language First"}
          </button>
        </div>
      </div>
    );
  }

  if (!schoolData)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600 font-semibold">
          Error: School information not found.
        </div>
      </div>
    );

  const q = questions[currentIdx] || null;
  const schoolLogoSrc = resolveImageSrc(schoolData.logo);
  if (!q) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-slate-700">
        Loading questions...
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-screen w-full flex flex-col items-center justify-center p-6"
      >
        <div
          className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            testPassed
              ? "bg-gradient-to-br from-green-400 to-green-600"
              : "bg-gradient-to-br from-red-400 to-red-600"
          }`}
        >
          {testPassed ? "✅" : "❌"}
        </div>

        <h2
          className={`text-2xl font-semibold mb-2 ${
            testPassed ? "text-green-700" : "text-red-700"
          }`}
        >
          {testMode === "practice"
            ? "Practice Completed!"
            : testPassed
            ? "Test Passed!"
            : "Test Failed!"}
        </h2>

        {testMode === "exam" || testMode === "practice" ? (
          <p className="mb-6 text-slate-600">
            Your score:{" "}
            <span className="font-mono text-2xl text-sky-600 font-bold">
              {score} / {totalQuestions || questions.length}
            </span>
          </p>
        ) : (
          <p className="mb-6 text-slate-600">
            You have reached the end of practice questions.
          </p>
        )}

        <div className="mb-4 text-sm text-slate-700 space-y-1 text-center">
          <div>
            <strong>Total attend:</strong> {attendedCount}
          </div>
          <div>
            <strong>Time out:</strong> {timeoutCount}
          </div>
          <div>
            <strong>True :</strong> {trueCount}
          </div>
          <div>
            <strong>Falls :</strong> {falseCount}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Restart
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Watermark schoolName={schoolData.name} />

      <motion.div
        className="w-full max-w-9xl sm:w-3xl lg:w-5xl md:w-8xl bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 pb-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {schoolLogoSrc && (
              <Image
                src={schoolLogoSrc}
                alt={`${schoolData.name} Logo`}
                width={56}
                height={56}
                unoptimized
                className="w-14 h-14 rounded-lg border border-slate-200 object-contain shadow-sm"
              />
            )}
            <div>
              <h1
                className={`text-xl md:text-3xl font-bold bg-clip-text text-transparent ${
                  schoolData.id === 9741
                    ? "bg-gradient-to-r from-red-500 to-red-700"
                    : "bg-gradient-to-r from-sky-600 to-indigo-600"
                }`}
              >
                {schoolData.name}
              </h1>

              <p className="text-sm text-slate-600 mt-1">
                ph:{schoolData.number}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Road Safety Mock Test
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
          >
            Logout
          </button>
        </div>

        <div className="text-sm text-slate-600 mb-3">
          Q {currentIdx + 1} / {totalQuestions || questions.length}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            {testMode === "exam" ? (
              <div className="flex items-center justify-between mb-4 text-sm text-slate-600">
                <div>
                  Time left:{" "}
                  <span className="font-mono font-semibold text-slate-800">
                    {timeLeft}s
                  </span>
                </div>
                <div>
                  Score:{" "}
                  <span className="font-semibold text-sky-600">{score}</span>
                </div>
              </div>
            ) : (
              <div className="mb-4 text-sm text-slate-600 font-medium">
                Practice mode: No timer, no score.
              </div>
            )}

            <div className="p-4 border rounded-xl mb-4 bg-gradient-to-r from-white to-slate-50">
              <div className="text-sm md:text-xl font-medium mb-3 text-slate-900 flex items-center gap-4">
                <span>{q.q}</span>
                {q.sign ? (
                  <Image
                    src={resolveImageSrc(q.sign) ?? ""}
                    alt="Sign"
                    width={48}
                    height={48}
                    unoptimized
                    className="w-32 h-32 object-contain"
                  />
                ) : null}
              </div>

              <div className="grid gap-3 text-slate-800">
                {(() => {
                  const visible = q.options
                    .map((opt, idx) => ({ opt, idx }))
                    .filter(({ opt }) => opt && opt.trim() !== "");

                  return visible.map(({ opt, idx }, displayIdx) => {
                    const isSelected = selected === idx;
                    const isImage =
                      opt.startsWith("http://") || opt.startsWith("https://");

                    let cls =
                      "cursor-pointer p-3 border rounded-lg transition-all duration-200 flex items-center justify-between ";

                    if ((testMode === "practice" && practiceChecked) || (testMode === "exam" && examChecked)) {
                      if (idx === q.answerIndex) {
                        cls += "border-green-500 bg-green-50 ring-2 ring-green-200 ";
                      } else if (isSelected) {
                        cls += "border-red-500 bg-red-50 ring-2 ring-red-200 ";
                      } else {
                        cls += "border-slate-200";
                      }
                    } else if (isSelected) {
                      cls += "border-sky-500 bg-sky-50 ring-2 ring-sky-200 ";
                    } else {
                      cls += "hover:border-sky-300 hover:bg-sky-50 border-slate-200";
                    }

                    return (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        key={idx}
                        className={cls}
                        onClick={
                          !isDesktop && !(testMode === "practice" && practiceChecked) && !(testMode === "exam" && examChecked)
                            ? () => handleSelect(idx)
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {/* Circle Index (Mobile/Always) */}
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm md:text-lg transition-colors ${
                              isSelected
                                ? "border-sky-600 bg-sky-600 text-white"
                                : "border-slate-400 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + displayIdx)}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            {isImage ? (
                              <div className="relative w-40 h-28">
                                <Image
                                  src={resolveImageSrc(opt) ?? ""}
                                  alt={`Option ${displayIdx + 1}`}
                                  fill
                                  unoptimized
                                  className="object-contain rounded-lg border bg-white"
                                />
                              </div>
                            ) : (
                              <span className="text-sm md:text-lg font-medium">{opt}</span>
                            )}
                          </div>
                        </div>

                        {/* Radio Button Style (Visible/End only on desktop-ish widths) */}
                        <button
                          type="button"
                          aria-label={`Select option ${displayIdx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!(testMode === "practice" && practiceChecked) && !(testMode === "exam" && examChecked)) {
                              handleSelect(idx);
                            }
                          }}
                          className="hidden md:flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-300"
                        >
                          {isSelected && (
                            <div className="w-3 h-3 bg-sky-600 rounded-full" />
                          )}
                        </button>
                      </motion.div>
                    );
                  });
                })()}
              </div>

            
            </div>

            {testMode === "practice" ? (
              <div className="flex justify-between items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  onClick={() => void handleNext()}
                  disabled={selected === null}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-sky-700 disabled:opacity-50"
                >
                  {practiceChecked ? "Next" : "Submit"}
                </button>
              </div>
            ) : (
              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={() => void handleNext()}
                  disabled={selected === null || examChecked}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-sky-700 disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="mt-6 text-xs text-slate-500 text-center">
          {testMode === "exam"
            ? "30s per question • Submit to reveal the answer for 2 seconds, then it advances automatically"
            : "Practice Mode • Select an option and click Submit to continue"}
        </footer>
      </motion.div>
    </div>
  );
};

export default MockTestPage;
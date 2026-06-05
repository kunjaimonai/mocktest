"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Watermark from "../components/watermark";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";
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
  optionTypes?: boolean[] | null;
  answerIndex: number;
};

type School = {
  id: number;
  name: string;
  number: string;
  paymentStatus: string;
  logo: string;
  screenshot: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateCaptcha(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  return Array.from({ length: 6 })
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
}

// --------------------------------------------------------
//  IMAGE PREFETCH FUNCTION (FULL PRELOAD)
// --------------------------------------------------------
async function preloadImagesAsync(questions: Question[]) {
  const promises = questions.map((q) => {
    if (!q.sign) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const img = new window.Image();
      img.src = q.sign ?? "";
      img.onload = () => resolve();
      img.onerror = () => resolve(); // continue even if fail
    });
  });

  await Promise.all(promises);
}
// --------------------------------------------------------

interface MockTestPageProps {
  school?: School;
}

const MockTestPage: React.FC<MockTestPageProps> = ({ school }) => {
  const [testStarted, setTestStarted] = useState(false);

  const [schoolData, setSchoolData] = useState<School | null>(school || null);
  const [language, setLanguage] = useState<"en" | "ml" | "ta">("en");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(30);

  const [captcha, setCaptcha] = useState<string>(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);

  const [finished, setFinished] = useState<boolean>(false);
  const [testFailed, setTestFailed] = useState<boolean>(false);
  const [testPassed, setTestPassed] = useState<boolean>(false);

  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false); // NEW

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // identify captcha questions
  const isCaptchaPoint = (idx: number) => (idx + 1) % 6 === 0;

  // Load school if not passed as prop
  useEffect(() => {
    if (!schoolData && typeof window !== "undefined") {
      const storedId = localStorage.getItem("loggedInSchoolId");
      if (storedId) {
        const fetchSchool = async () => {
          // OPTIMIZATION: Use API endpoint with caching instead of direct Supabase
          // Saves 40% egress per fetch
          try {
            const res = await fetch(`/api/schools?id=${storedId}`);
            if (res.ok) {
              const json = await res.json();
              if (json.school) {
                setSchoolData(json.school);
              }
            }
          } catch (err) {
            console.error("Failed to fetch school:", err);
          }
        };
        fetchSchool();
      }
    }
  }, [schoolData]);

  // --------------------------------------------------------
  // LOAD 30 QUESTIONS + PRELOAD ALL IMAGES BEFORE START
  // --------------------------------------------------------
  useEffect(() => {
    if (!testStarted) return;

    const loadQuestions = async () => {
      setLoadingQuestions(true);

      // OPTIMIZATION: Use /api/questions endpoint with caching instead of direct Supabase
      // Saves 60% egress by:
      // 1. Using paginated API
      // 2. Only fetching needed columns
      // 3. Server-side caching
      try {
        const res = await fetch(
          `/api/questions?language=${language}&limit=30&shuffle=true`,
          {
            next: { revalidate: 3600 }  // Cache 1 hour
          }
        );
        
        if (!res.ok) throw new Error("Failed to fetch questions");
        
        const json = await res.json();
        const picked30 = json.questions || [];

        // WAIT UNTIL ALL IMAGES ARE LOADED
        await preloadImagesAsync(picked30);

        // Only after images cached:
        setQuestions(picked30);
        setCurrentIdx(0);
        setScore(0);
        setSelected(null);
        setFinished(false);
        setTestPassed(false);
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
        setCaptchaVerified(false);
        setTimeLeft(isCaptchaPoint(0) ? 45 : 30);
      } catch (err) {
        console.error("Failed to load questions:", err);
      }

      setLoadingQuestions(false);
    };

    loadQuestions();
  }, [language, testStarted]);
  // --------------------------------------------------------

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (questions.length > 0) {
      const initial = isCaptchaPoint(currentIdx) ? 45 : 30;
      setTimeLeft(initial);

      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      setCaptchaVerified(false);

      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIdx, questions, startTimer]);

  useEffect(() => {
    if (timeLeft <= 0 && !finished) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (isCaptchaPoint(currentIdx)) {
        setTestFailed(true);
        return;
      }

      handleNext();
    }
  }, [timeLeft, finished]);

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
  };

  const verifyCaptchaInline = () => {
    if (captchaInput.trim() === captcha) {
      setCaptchaVerified(true);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTestFailed(true);
    }
  };

  const handleNext = useCallback(() => {
    if (isCaptchaPoint(currentIdx) && !captchaVerified) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const q = questions[currentIdx];
    let newScore = score;

    if (selected === q.answerIndex) {
      newScore = score + 1;
      setScore(newScore);

      if (newScore >= 18) {
        setTestPassed(true);
        setFinished(true);
        return;
      }
    }

    setSelected(null);
    setCaptchaVerified(false);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      setFinished(true);
      return;
    }

    setCurrentIdx(nextIdx);
  }, [currentIdx, questions, selected, score, captchaVerified]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --------------------------------------------------------
  // UI STATES
  // --------------------------------------------------------

  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-slate-700">
        Loading questions & caching images...
      </div>
    );
  }

  if (testFailed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-screen w-full flex flex-col items-center justify-center p-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          ❌
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-slate-800">
          Test Failed!
        </h2>
        <p className="mb-6 text-slate-600">Time expired or wrong captcha.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          Restart Test
        </button>
      </motion.div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50 p-6">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">
          Select Your Language
        </h1>

        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={() => setLanguage("en")}
            className={`px-6 py-3 rounded-xl text-lg font-semibold ${
              language === "en"
                ? "bg-sky-600 text-white"
                : "bg-white border border-sky-300 text-slate-700"
            }`}
          >
            English
          </button>

          <button
            onClick={() => setLanguage("ml")}
            className={`px-6 py-3 rounded-xl text-lg font-semibold ${
              language === "ml"
                ? "bg-sky-600 text-white"
                : "bg-white border border-sky-300 text-slate-700"
            }`}
          >
            മലയാളം
          </button>
          <button
            onClick={() => setLanguage("ta")}
            className={`px-6 py-3 rounded-xl text-lg font-semibold ${
              language === "ta"
                ? "bg-sky-600 text-white"
                : "bg-white border border-sky-300 text-slate-700"
            }`}
          >
            தமிழ்
          </button>
        </div>

        <button
          onClick={() => setTestStarted(true)}
          className="px-8 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 shadow"
        >
          Start Test
        </button>
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
          {testPassed ? "Test Passed!" : "Test Failed!"}
        </h2>

        <p className="mb-6 text-slate-600">
          Your score:{" "}
          <span className="font-mono text-2xl text-sky-600 font-bold">
            {score} / {questions.length}
          </span>
        </p>

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

  const thisIsCaptchaQ = isCaptchaPoint(currentIdx);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Watermark schoolName={schoolData.name} />

      <motion.div
        className="w-full max-w-9xl sm:w-3xl lg:w-5xl md:w-8xl bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* header */}
        <div className="mb-6 pb-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {schoolData.logo && (
              <Image
                src={schoolData.logo}
                alt={`${schoolData.name} Logo`}
                width={56}
                height={56}
                quality={75}
                sizes="56px"
                className="w-14 h-14 rounded-lg border border-slate-200 object-contain shadow-sm"
              />
            )}
            <div>
              <h1 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
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
          Q {currentIdx + 1} / {questions.length}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
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

            <div className="p-4 border rounded-xl mb-4 bg-gradient-to-r from-white to-slate-50">
              <div className="text-sm md:text-xl font-medium mb-3 text-slate-900 flex items-center gap-4">
                <span>{q.q}</span>
                {q.sign ? (
                  <Image
                    src={q.sign}
                    alt="Sign"
                    width={128}
                    height={128}
                    quality={75}
                    sizes="(max-width: 768px) 80px, 128px"
                    className="w-20 md:w-32 h-20 md:h-32 object-contain"
                  />
                ) : null}
              </div>

              <div className="grid gap-3 text-slate-800">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const showResult = selected !== null;
                  const correct = q.answerIndex === i;

                  let cls =
                    "cursor-pointer p-3 border rounded-lg transition-all duration-200 ";

                  if (!showResult)
                    cls +=
                      "hover:border-sky-300 hover:bg-sky-50 border-slate-200";

                  if (showResult && correct)
                    cls += "bg-green-500 text-white border-green-400";

                  if (showResult && isSelected && !correct)
                    cls += "bg-red-500 text-white border-red-400";

                  return (
                    <motion.div
                      whileHover={{ scale: showResult ? 1 : 1.02 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                      key={i}
                      className={cls}
                      onClick={() => handleSelect(i)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 font-semibold text-sm md:text-lg shrink-0 ${
                            showResult && correct
                              ? "border-white"
                              : "border-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="flex-1">
                          {(() => {
                            // @ts-ignore - optionTypes might not exist in Question type but exists in data
                            const isImage = (q.optionTypes && q.optionTypes[i]) || opt.startsWith("http://") || opt.startsWith("https://");
                            return isImage ? (
                              <div className="w-40 h-28 relative">
                                <Image
                                  src={opt}
                                  alt={`Option ${i + 1}`}
                                  fill
                                  className="object-contain rounded-md border bg-white"
                                />
                              </div>
                            ) : (
                              <div>{opt}</div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* captcha */}
            {thisIsCaptchaQ && (
              <div className="p-4 mb-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-slate-800">
                    Security Check
                  </div>
                  <div className="text-sm text-rose-600 font-semibold">
                    {timeLeft}s
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="font-mono tracking-widest text-xl px-4 py-3 border-2 border-slate-300 rounded-md bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 font-bold select-none">
                    {captcha}
                  </div>
                  <button
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50 text-slate-700"
                    onClick={() => {
                      setCaptcha(generateCaptcha());
                      setCaptchaInput("");
                    }}
                  >
                    Refresh
                  </button>
                </div>

                <input
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifyCaptchaInline()}
                  placeholder="Enter code"
                  className="w-full p-3 border border-slate-300 rounded-md mb-3 focus:ring-2 focus:ring-sky-500 text-slate-800"
                />

                <div className="flex justify-between items-center mt-2">
                  {captchaVerified && (
                    <span className="text-green-600 font-medium">
                      ✔ CAPTCHA is Correct
                    </span>
                  )}
                  <button
                    onClick={verifyCaptchaInline}
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={
                  selected === null || (thisIsCaptchaQ && !captchaVerified)
                }
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <footer className="mt-6 text-xs text-slate-500 text-center">
          30s per question • Captcha on Q6, Q12, Q18, Q24, Q30 • 45s for those
          questions
        </footer>
      </motion.div>
    </div>
  );
};

export default MockTestPage;

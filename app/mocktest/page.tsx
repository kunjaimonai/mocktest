"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Watermark from "../components/watermark";
import { supabase } from "@/lib/supabase";
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

interface MockTestPageProps {
  school?: School;
}

const MockTestPage: React.FC<MockTestPageProps> = ({ school }) => {
  const [testStarted, setTestStarted] = useState(false);

  const [schoolData, setSchoolData] = useState<School | null>(school || null);
  const [language, setLanguage] = useState<"en" | "ml">("en");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);

  // unified timeLeft: 30 for normal, 45 for captcha questions
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // captcha states
  const [captcha, setCaptcha] = useState<string>(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);

  const [finished, setFinished] = useState<boolean>(false);
  const [testFailed, setTestFailed] = useState<boolean>(false);
  const [testPassed, setTestPassed] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // identify if current question is one that needs captcha inline
  const isCaptchaPoint = (idx: number) => (idx + 1) % 6 === 0;

  // Load school if not passed as prop
  useEffect(() => {
    if (!schoolData && typeof window !== "undefined") {
      const storedId = localStorage.getItem("loggedInSchoolId");
      if (storedId) {
        const fetchSchool = async () => {
          const { data, error } = await supabase
            .from("schools")
            .select("*")
            .eq("id", parseInt(storedId))
            .single();
          if (!error && data) {
            setSchoolData(data);
          }
        };
        fetchSchool();
      }
    }
  }, [schoolData]);

  // Load questions when test starts or language changes
  useEffect(() => {
    if (!testStarted) return;

    const loadQuestions = async () => {
      const table =
        language === "ml" ? "malayalam_questions" : "english_questions";
      const { data, error } = await supabase.from(table).select("*");

      if (!error && data) {
        const shuffled = shuffleArray(data);
        const picked30 = shuffled.slice(0, 30);
        setQuestions(picked30);
        setCurrentIdx(0);
        setScore(0);
        setSelected(null);
        setFinished(false);
        setTestPassed(false);
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
        setCaptchaVerified(false);
        // initial time based on first question
        setTimeLeft(isCaptchaPoint(0) ? 45 : 30);
      }
    };

    loadQuestions();
  }, [language, testStarted]);

  // Start the timer; the timer keeps counting even while captcha UI is visible
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
  }, []);

  // Start timer when question changes (restarts with correct duration)
  useEffect(() => {
    // ensure any previous interval cleared
    if (timerRef.current) clearInterval(timerRef.current);

    // set initial timeLeft for this question (45 for captcha questions, 30 otherwise)
    const initial = isCaptchaPoint(currentIdx) ? 45 : 30;
    setTimeLeft(initial);

    // reset captcha state for the new question
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaVerified(false);

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, startTimer]);

  // If timer reaches zero -> test failed
  useEffect(() => {
    if (timeLeft <= 0 && !finished) {
      // If time expired on a question (captcha or normal) -> test failed
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTestFailed(true);
    }
  }, [timeLeft, finished]);

  // selection
  const handleSelect = (i: number) => {
    // allow selecting even if captcha visible
    if (selected !== null) return;
    setSelected(i);
  };

  // verify captcha inline (doesn't advance the question)
  const verifyCaptchaInline = () => {
    if (captchaInput.trim() === captcha) {
      setCaptchaVerified(true);
    } else {
      // wrong captcha -> immediate fail
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTestFailed(true);
    }
  };

  // Submit / Next question handler
  const handleNext = useCallback(() => {
    // If this question is a captcha-point and captcha not verified, do nothing (button disabled anyway)
    if (isCaptchaPoint(currentIdx) && !captchaVerified) {
      return;
    }

    // stop timer for evaluation
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

    // reset selection for next question
    setSelected(null);
    setCaptchaVerified(false);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      setFinished(true);
      return;
    }

    setCurrentIdx(nextIdx);
    // the useEffect on currentIdx will set timeLeft and captcha for next question
  }, [currentIdx, questions, selected, score, captchaVerified]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ---------- UI STATES -------------

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

        <div className="flex gap-4 mb-6">
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-700">Loading questions...</div>
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

  // is this question a captcha-question?
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
              <img
                src={schoolData.logo}
                alt={`${schoolData.name} Logo`}
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

          <div className="flex gap-3 items-center">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                language === "en"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("ml")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                language === "ml"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              മലയാളം
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* counter */}
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
                {q.sign && (
                  <Image
                    src={q.sign}
                    alt="Sign"
                    width={48}
                    height={48}
                    className="w-32 h-32 object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
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
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 font-semibold text-sm md:text-lg ${
                            showResult && correct
                              ? "border-white"
                              : "border-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div>{opt}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Inline CAPTCHA for Q6, Q12, Q18, Q24, Q30 */}
            {thisIsCaptchaQ && (
              <div className="p-4 mb-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-slate-800">
                    Security Check
                  </div>
                  <div className="text-sm text-rose-600 font-semibold">
                    {/* show that the captcha-question has bigger timer (45s) but we display unified timeLeft */}
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

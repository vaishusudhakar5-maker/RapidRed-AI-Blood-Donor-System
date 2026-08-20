import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fffafa]">

      {/* =========================================
          BACKGROUND DESIGN
      ========================================= */}

      {/* Large red corner shape */}
      <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-red-600 opacity-[0.08]" />

      {/* Soft pink circle */}
      <div className="absolute top-24 -left-32 w-[360px] h-[360px] rounded-full bg-pink-200 opacity-40 blur-3xl" />

      {/* Bottom red glow */}
      <div className="absolute -bottom-48 right-[-100px] w-[500px] h-[500px] rounded-full bg-red-500 opacity-[0.07] blur-3xl" />

      {/* Decorative small circles */}
      <div className="absolute top-[18%] right-[18%] w-3 h-3 rounded-full bg-red-300 opacity-70" />

      <div className="absolute bottom-[22%] left-[15%] w-4 h-4 rounded-full bg-pink-300 opacity-70" />

      <div className="absolute top-[35%] left-[10%] w-2 h-2 rounded-full bg-red-400" />


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">

        <div className="w-full max-w-xl text-center">


          {/* =====================================
              LOGO
          ===================================== */}

          <div className="relative mx-auto w-32 h-32 flex items-center justify-center">

            {/* Outer pulse */}
            <div className="absolute inset-0 rounded-[38%] bg-red-100 animate-pulse" />

            {/* Logo card */}
            <div className="relative w-28 h-28 rounded-[34%] bg-white border border-red-100 shadow-xl shadow-red-100/60 flex items-center justify-center">

              {/* Blood Drop */}
              <svg
                width="58"
                height="70"
                viewBox="0 0 52 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >

                <path
                  d="M26 2C26 2 5 25 5 39C5 51.15 14.4 61 26 61C37.6 61 47 51.15 47 39C47 25 26 2 26 2Z"
                  fill="#DC2626"
                />

                {/* Highlight */}
                <path
                  d="M16 36C16.8 29.5 21.5 23 24.5 19"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.75"
                />

              </svg>

            </div>

          </div>


          {/* =====================================
              BRAND
          ===================================== */}

          <div className="mt-8">

            <h1 className="text-6xl md:text-7xl font-black tracking-[-0.04em] text-gray-900">

              Rapid<span className="text-red-600">Red</span>

            </h1>

            <div className="flex justify-center items-center gap-3 mt-4">

              <div className="w-12 h-[2px] bg-red-200 rounded-full" />

              <div className="w-2 h-2 rounded-full bg-red-600" />

              <div className="w-12 h-[2px] bg-red-200 rounded-full" />

            </div>

          </div>


          {/* =====================================
              DESCRIPTION
          ===================================== */}

          <div className="mt-7">

            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              AI-Driven Emergency Blood Finder
            </h2>

            <p className="mt-3 text-gray-500 text-sm md:text-base leading-7 max-w-md mx-auto">
              Connecting patients with compatible blood donors
              quickly, intelligently, and safely.
            </p>

          </div>


          {/* =====================================
              STATUS
          ===================================== */}

          <div className="mt-10 flex flex-col items-center">

            {/* Loading bar */}
            <div className="w-40 h-1.5 bg-red-100 rounded-full overflow-hidden">

              <div className="h-full w-1/2 bg-red-600 rounded-full animate-[loading_2.8s_ease-in-out_infinite]" />

            </div>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">
              Preparing Emergency Network
            </p>

          </div>


          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="mt-16 flex items-center justify-center gap-2 text-xs text-gray-400">

            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />

            <span>
              RapidRed Emergency Response Network
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />

          </div>

        </div>

      </div>


      {/* =========================================
          CUSTOM ANIMATION
      ========================================= */}

      <style>
        {`
          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }

            50% {
              transform: translateX(100%);
            }

            100% {
              transform: translateX(300%);
            }
          }
        `}
      </style>

    </div>
  );
}
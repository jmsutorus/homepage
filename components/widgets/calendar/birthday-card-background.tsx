"use client";

export function BirthdayCardBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-yellow-500/5 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Confetti - Falling from top */}
        <div className="confetti">🎊</div>
        <div className="confetti" style={{ left: '30%', animationDelay: '0.5s', animationDuration: '5s' }}>🎉</div>
        <div className="confetti" style={{ left: '60%', animationDelay: '1s', animationDuration: '4.5s' }}>✨</div>
        <div className="confetti" style={{ left: '80%', animationDelay: '1.5s', animationDuration: '5.5s' }}>🎈</div>
        <div className="confetti" style={{ left: '50%', animationDelay: '2s', animationDuration: '6s' }}>🎊</div>

        {/* Balloons - Rising from bottom */}
        <div className="balloon">🎈</div>
        <div className="balloon" style={{ left: '40%', animationDelay: '1s', animationDuration: '9s' }}>🎂</div>
        <div className="balloon" style={{ left: '70%', animationDelay: '2s', animationDuration: '10s' }}>🧁</div>
        <div className="balloon" style={{ left: '20%', animationDelay: '3s', animationDuration: '8.5s' }}>🎈</div>

        {/* Sparkles - Twinkling in place */}
        <div className="sparkle" style={{ top: '20%', left: '15%' }}>✨</div>
        <div className="sparkle" style={{ top: '40%', left: '80%', animationDelay: '0.5s', animationDuration: '2.5s' }}>💫</div>
        <div className="sparkle" style={{ top: '70%', left: '30%', animationDelay: '1s', animationDuration: '3s' }}>⭐</div>
        <div className="sparkle" style={{ top: '60%', left: '90%', animationDelay: '1.5s', animationDuration: '2.2s' }}>✨</div>
        <div className="sparkle" style={{ top: '30%', left: '50%', animationDelay: '0.8s', animationDuration: '2.8s' }}>💫</div>
      </div>

      <style jsx>{`
        .confetti {
          position: absolute;
          top: -10%;
          left: 15%;
          font-size: 1.2rem;
          opacity: 0.7;
          animation: fall 4s linear infinite;
        }

        @keyframes fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(50vh) translateX(10px) rotate(180deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(110vh) translateX(-10px) rotate(360deg);
            opacity: 0.3;
          }
        }

        .balloon {
          position: absolute;
          bottom: -10%;
          left: 25%;
          font-size: 1.2rem;
          opacity: 0.7;
          animation: rise 8s ease-in-out infinite;
        }

        @keyframes rise {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-50vh) translateX(15px) rotate(10deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-110vh) translateX(-5px) rotate(-5deg);
            opacity: 0.3;
          }
        }

        .sparkle {
          position: absolute;
          font-size: 0.9rem;
          animation: twinkle 2s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% {
            transform: scale(0.5) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

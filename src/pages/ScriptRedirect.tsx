const ScriptRedirect = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] overflow-hidden relative">
      {/* Background glows */}
      <div className="fixed w-[300px] h-[300px] rounded-full blur-[120px] opacity-15 bg-blue-500 -top-[100px] -left-[100px] pointer-events-none" />
      <div className="fixed w-[300px] h-[300px] rounded-full blur-[120px] opacity-15 bg-purple-500 -bottom-[100px] -right-[100px] pointer-events-none" />

      <div className="text-center px-8 max-w-[480px]">
        <div className="text-6xl mb-6 animate-bounce">🛡️</div>
        <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Hold up! Seems like you got confused.
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          This link is meant to be used inside a Roblox script executor, not a web browser. If you're looking for DefendLua, click below.
        </p>
        <a
          href="https://defendlua.lol"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]"
        >
          Go to DefendLua
        </a>
      </div>
    </div>
  );
};

export default ScriptRedirect;

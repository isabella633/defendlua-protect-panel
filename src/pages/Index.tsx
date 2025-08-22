import { useState } from "react";
import AuthForm from "@/components/AuthForm";
import ScriptProtector from "@/components/ScriptProtector";
import OwnerPanel from "@/components/OwnerPanel";

type AppState = 'auth' | 'protector' | 'owner';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('auth');
  const [currentScriptId, setCurrentScriptId] = useState<string>('');

  const handleLogin = () => {
    setAppState('protector');
  };

  const handleOwnerPanel = (scriptId: string) => {
    setCurrentScriptId(scriptId);
    setAppState('owner');
  };

  const handleBack = () => {
    setAppState('protector');
  };

  const handleLogout = () => {
    setAppState('auth');
    setCurrentScriptId('');
  };

  switch (appState) {
    case 'auth':
      return <AuthForm onLogin={handleLogin} />;
    case 'protector':
      return <ScriptProtector onOwnerPanel={handleOwnerPanel} onLogout={handleLogout} />;
    case 'owner':
      return <OwnerPanel scriptId={currentScriptId} onBack={handleBack} onLogout={handleLogout} />;
    default:
      return <AuthForm onLogin={handleLogin} />;
  }
};

export default Index;

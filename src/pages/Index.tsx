import { useState } from "react";
import AuthForm from "@/components/AuthForm";
import ScriptDashboard from "@/components/ScriptDashboard";
import ScriptProtector from "@/components/ScriptProtector";
import OwnerPanel from "@/components/OwnerPanel";

type AppState = 'auth' | 'dashboard' | 'protector' | 'owner';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('auth');
  const [currentScriptId, setCurrentScriptId] = useState<string>('');

  const handleLogin = () => {
    setAppState('dashboard');
  };

  const handleNewScript = () => {
    setAppState('protector');
  };

  const handleOwnerPanel = (scriptId: string) => {
    setCurrentScriptId(scriptId);
    setAppState('owner');
  };

  const handleViewScript = (scriptId: string) => {
    setCurrentScriptId(scriptId);
    setAppState('owner');
  };

  const handleBackToDashboard = () => {
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setAppState('auth');
    setCurrentScriptId('');
  };

  switch (appState) {
    case 'auth':
      return <AuthForm onLogin={handleLogin} />;
    case 'dashboard':
      return (
        <ScriptDashboard 
          onNewScript={handleNewScript}
          onViewScript={handleViewScript}
          onLogout={handleLogout}
        />
      );
    case 'protector':
      return (
        <ScriptProtector 
          onOwnerPanel={handleOwnerPanel} 
          onLogout={handleLogout}
          onBack={handleBackToDashboard}
        />
      );
    case 'owner':
      return (
        <OwnerPanel 
          scriptId={currentScriptId} 
          onBack={handleBackToDashboard} 
          onLogout={handleLogout}
        />
      );
    default:
      return <AuthForm onLogin={handleLogin} />;
  }
};

export default Index;

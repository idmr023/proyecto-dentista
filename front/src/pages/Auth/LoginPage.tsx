import React from 'react';
import LoginPage from '../../pages/LoginPage.tsx';

export default function AuthPage({ onBack }: { onBack?: () => void }) {
  return <LoginPage onBack={onBack} />;
}

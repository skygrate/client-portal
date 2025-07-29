'use client';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import amplifyOutputs from '../../amplify_outputs.json'; // Gen2 outputs file
import '../i18n';
import { I18nextProvider } from 'react-i18next';
import useIdleLogout from '../hooks/useIdleLogout';
import i18n from '../i18n';
import { Toaster } from 'sonner';

Amplify.configure(amplifyOutputs);

function IdleLogoutHandler() {
  useIdleLogout();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator.Provider>
      <Authenticator>
        {() => (
          <I18nextProvider i18n={i18n}>
            <IdleLogoutHandler />
            <Toaster position="top-right" />
            {children}
          </I18nextProvider>
        )}
      </Authenticator>
    </Authenticator.Provider>
  );
}
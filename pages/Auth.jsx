// components/AuthButtons.js

import React from 'react';
import { useUser, signIn, signOut } from '@clerk/clerk-react';

const Auth = () => {
  const { user } = useUser();

  return (
    <div>
      {user ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => signIn()}>Sign In</button>
      )}
    </div>
  );
};

export default Auth;
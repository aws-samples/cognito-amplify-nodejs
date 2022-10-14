import React, { useEffect, useState } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import awsconfig from '../src/aws-exports';

Amplify.configure(awsconfig);

export default function App() {
  const [user, setUser] = useState(null);
  const [cpf, setCpf] = useState("")

  function updateAttribute() {
    let params = {};
    params['custom:cpf'] = cpf;
    console.log(JSON.stringify(user))
    let result = Auth.updateUserAttributes(user, params)
      .then(data => {console.log(data); alert('Atributo salvo')})
      .catch(err => {console.log(err);alert('Erro')})
    console.log(result)
  }

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          setUser(data);
          break;
        case "signOut":
          setUser(null);
          break;
        case "customOAuthState":
          setCustomState(data);
      }
    });

    Auth.currentAuthenticatedUser()
      .then(currentUser => { setUser(currentUser); console.log("Signed In") })
      .catch(() => console.log("Not signed in"));

    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div className="App">
        <button onClick={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}>Open Google</button>
        <button onClick={() => Auth.federatedSignIn()}>Open Hosted UI</button>
      </div>
    );
  }
  return (
    <div>
      <input onChange={e => setCpf(e.target.value)} value={cpf} />
      <button onClick={updateAttribute}>Update CPF</button><br />
      <button onClick={() => Auth.signOut()}>Sign Out {user.signInUserSession.idToken.payload.email}</button>
    </div>
  )
}
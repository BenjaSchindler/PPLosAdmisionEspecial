import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import './index.css';
import App from './App';

const messages = {
  en: {
    // English translations
    'home.title1': 'Benja grabs the shovel',
    'home.title2': 'We boost your business thanks to generative AI',
    'home.title3': 'Accelerate your growth',
    'login.title': 'Sign In',
    'login.emailLabel': 'Email or Username',
    'login.passwordLabel': 'Password',
    'login.submitButton': 'Sign In',
    'login.signupText': "Don't have an account?",
    'login.signupLink': 'Sign up',
    'login.or': 'or',
    'signup.title': 'Sign Up',
    'signup.usernameLabel': 'Username',
    'signup.emailLabel': 'Email',
    'signup.passwordLabel': 'Password',
    'signup.confirmPasswordLabel': 'Confirm Password',
    'signup.submitButton': 'Sign Up',
    'signup.loginText': 'Already have an account?',
    'signup.loginLink': 'Log in',
    // Add more translations as needed
  },
  es: {
    // Spanish translations
    'home.title1': 'Benja agarra la pala',
    'home.title2': 'Impulsamos tu negocio gracias a la IA generativa',
    'home.title3': 'Acelera tu crecimiento',
    'login.title': 'Iniciar sesión',
    'login.emailLabel': 'Correo electrónico o nombre de usuario',
    'login.passwordLabel': 'Contraseña',
    'login.submitButton': 'Iniciar sesión',
    'login.signupText': '¿No tienes una cuenta?',
    'login.signupLink': 'Regístrate',
    'login.or': 'o',
    'signup.title': 'Registrarse',
    'signup.usernameLabel': 'Nombre de usuario',
    'signup.emailLabel': 'Correo electrónico',
    'signup.passwordLabel': 'Contraseña',
    'signup.confirmPasswordLabel': 'Confirmar contraseña',
    'signup.submitButton': 'Registrarse',
    'signup.loginText': '¿Ya tienes una cuenta?',
    'signup.loginLink': 'Iniciar sesión',
    // Add more translations as needed
  },
};

const LanguageWrapper: React.FC = () => {
  const language = 'en'; // Get the current language from Redux store or local storage

  return (
    <IntlProvider messages={messages[language]} locale={language}>
      <App />
    </IntlProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <LanguageWrapper />
  </React.StrictMode>,
  document.getElementById('root')
);
import React, { useState } from 'react';
import ContactInput from '../components/ContactInput';
import InputPassword from '../components/InputPassword';
import Button from '../components/Button';

const LoginPage = () => {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    setTimeout(() => {
      if (contact === 'test@example.com' && password === '123456') {
        alert('Login successful!');
      } else {
        setLoginError('Invalid email/phone or password.');
      }
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-6 text-center">Login to your Account</h1>
      <form onSubmit={handleSubmit}>
        <ContactInput value={contact} onChange={setContact} />
        <InputPassword value={password} onChange={setPassword} />
        {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}

        <Button type="submit" loading={isSubmitting} fullWidth className="mt-4">
          Login
        </Button>

        {/* ลิงก์ลืมรหัสผ่านที่ถูกต้อง */}
        <div className="text-center mt-4">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot your password?
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';

// จำลอง email ที่ถูกใช้ไปแล้ว
const usedEmails = ['test@example.com', 'hello@domain.com'];

const ContactInput = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isEmailTaken, setIsEmailTaken] = useState(false);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validatePhone = (val) => /^[0-9]{7,15}$/.test(val);

  const handleChange = (e) => {
    const val = e.target.value.trim();
    setValue(val);

    if (validateEmail(val)) {
      if (usedEmails.includes(val)) {
        setError('This email is already in use. You can use a phone number instead.');
        setIsEmailTaken(true);
      } else {
        setError('');
        setIsEmailTaken(false);
      }
    } else if (validatePhone(val)) {
      if (isEmailTaken) {
        setError('');
      } else {
        setError('Please enter a valid email address first.');
      }
    } else {
      setError('Invalid email or phone number format.');
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="contact" style={{ display: 'block', marginBottom: '0.5rem' }}>
      
      </label>
      <input
        id="contact"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter email or phone number"
        style={{
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {error && <p style={{ color: 'red', marginTop: '4px' }}>{error}</p>}
    </div>
  );
};

export default ContactInput;

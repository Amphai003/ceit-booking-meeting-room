import React, { useState } from "react";

const TextInputPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-2 top-2 text-sm text-blue-600"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};

export default TextInputPassword;

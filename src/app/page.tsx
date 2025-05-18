"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Mail, Lock, User, ChevronRight, X, Eye, EyeOff } from "lucide-react";

interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  profileImage: string | null;
}

interface ThreadsAuthSystemProps {
  onLogin: (user: User) => void;
}

const ThreadsAuthSystem: React.FC<ThreadsAuthSystemProps> = ({ onLogin }) => {
  const [activeScreen, setActiveScreen] = useState<
    "login" | "register" | "forgotPassword"
  >("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showEmptyPage, setShowEmptyPage] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const backgroundControls = useAnimation();

  useEffect(() => {
    const animateBackground = async () => {
      await backgroundControls.start({
        background: [
          "linear-gradient(to bottom right, #800084cf, #0091ffc8, #ffee00)",
          "linear-gradient(to bottom right, #ff0000, #ffff00 , #ff00fb)",
          "linear-gradient(to bottom right, #6fff00, #ff00d9d2 , #ff0000)",
        ],
        transition: { duration: 5, repeat: Infinity, repeatType: "reverse" },
      });
    };
    animateBackground();
  }, [backgroundControls]);

  useEffect(() => {
    if (activeScreen === "forgotPassword" && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [activeScreen]);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setShowEmptyPage(true);
      setIsAuthenticated(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (
      activeScreen === "register" &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (activeScreen === "register" && !formData.username) {
      newErrors.username = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const user = users.find((u) => u.email === formData.email);

      if (!user) {
        setErrors({ email: "No user found with this email" });
        return;
      }

      if (user.password !== formData.password) {
        setErrors({ password: "Incorrect password" });
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
      onLogin(user);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const newUser: User = {
        id: Date.now(),
        email: formData.email,
        password: formData.password,
        username: formData.username,
        profileImage: null,
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      setCurrentUser(newUser);
      setShowEmptyPage(true);
      setIsAuthenticated(true);
      onLogin(newUser);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      setErrors({ resetEmail: "Email is required" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ resetEmail: "Invalid email format" });
      return;
    }

    setPasswordResetSent(true);
    setTimeout(() => {
      setPasswordResetSent(false);
      setActiveScreen("login");
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setShowEmptyPage(false);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveScreen("login");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    });
  };

  const renderLoginInput = (
    name: string,
    type: string,
    placeholder: string,
    icon: React.ReactNode,
    passwordToggle?: boolean
  ) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.02 }}
        className="relative group"
      >
        {icon && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-3 top-4 transform -translate-y-1/2 text-black group-focus-within:text-black transition-colors"
          >
            {icon}
          </motion.div>
        )}
        <motion.input
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          type={type === "password" && showPassword ? "text" : type}
          name={name}
          placeholder={placeholder}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          className={`w-full p-3.5 ${icon ? "pl-10" : ""} border ${
            errors[name]
              ? "border-red-500 bg-red-50 text-red-900"
              : "border-gray-300 focus:border-black"
          } rounded-xl bg-gray-100 focus:outline-none transition-all shadow-sm  hover:shadow-md`}
        />
        {passwordToggle && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-5 transform -translate-y-0 text-gray-500 hover:text-black"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </motion.button>
        )}
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs pl-2 mt-1 animate-pulse"
          >
            {errors[name]}
          </motion.p>
        )}
      </motion.div>
    );
  };

  const renderLoginScreen = () => {
    return (
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
          rotateY: -30,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateY: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.8,
          rotateY: 30,
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 15,
        }}
        className="w-full max-w-md space-y-6 relative p-8 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        <div className="text-center relative z-10">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] mb-2"
          >
            Log in
          </motion.h1>
          <p className="text-gray-500">Welcome back</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          {renderLoginInput(
            "email",
            "email",
            "Username or email",
            <Mail size={20} className="text-gray-400" />
          )}
          {renderLoginInput(
            "password",
            "password",
            "Password",
            <Lock size={20} className="text-gray-400" />,
            true
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white rounded-xl hover:opacity-90 transition-colors font-semibold"
          >
            Log in
          </motion.button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setActiveScreen("forgotPassword")}
              className="text-blue-500 hover:underline"
            >
              Forgotten password?
            </button>
          </div>
        </form>

        <div className="text-center mt-4 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setActiveScreen("register")}
            className="text-blue-500 hover:underline flex items-center justify-center gap-1 mx-auto w-fit"
          >
            Don&apos;t have an account?
            <ChevronRight size={16} className="text-blue-400" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const renderRegisterScreen = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateY: -20 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.95, rotateY: 20 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className="w-full max-w-md space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.1, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-purple-100/20 to-blue-100/20 z-0"
        />

        <div className="text-center relative z-10">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] mb-2"
          >
            Sign up
          </motion.h1>
          <p className="text-gray-500">Sign up to continue</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div className="space-y-3">
            {[
              {
                name: "username",
                placeholder: "Full Name",
                icon: <User size={20} className="text-gray-500" />,
              },
              {
                name: "email",
                placeholder: "Email",
                icon: <Mail size={20} className="text-gray-500" />,
              },
              {
                name: "password",
                placeholder: "Create password",
                icon: <Lock size={20} className="text-gray-500" />,
                isPassword: true,
              },
              {
                name: "confirmPassword",
                placeholder: "Confirm Password",
                icon: <Lock size={20} className="text-gray-500" />,
                isPassword: true,
              },
            ].map((field) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                className="relative"
              >
                {field.icon && (
                  <div className="absolute left-3 top-7 transform -translate-y-1/2">
                    {field.icon}
                  </div>
                )}
                <input
                  type={
                    field.isPassword
                      ? showPassword
                        ? "text"
                        : "password"
                      : field.name === "email"
                      ? "email"
                      : "text"
                  }
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  className={`w-full p-3.5 ${
                    field.icon ? "pl-10" : ""
                  } border ${
                    errors[field.name]
                      ? "border-red-500 bg-red-50 text-red-900"
                      : "border-gray-300 focus:border-black"
                  } rounded-xl bg-gray-100 focus:outline-none transition-all shadow-sm hover:shadow-md`}
                />
                {field.name === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-5 transform -translate-y-1/2s text-black hover:text-black"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
                {errors[field.name] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs pl-2 mt-1s animate-pulse"
                  >
                    {errors[field.name]}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white rounded-xl hover:opacity-90 transition-colors font-semibold"
          >
            Sign up
          </motion.button>

          <div className="text-center mt-4 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setActiveScreen("login")}
              className="text-blue-500 hover:underline flex items-center justify-center gap-1 mx-auto w-fit"
            >
              Already have an account? Log in
              <ChevronRight size={16} className="text-blue-400" />
            </motion.button>
          </div>
        </form>
      </motion.div>
    );
  };

  const renderForgotPasswordScreen = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 p-6 relative"
      >
        <button
          onClick={() => setActiveScreen("login")}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff49fc] via-[#DD2A7B] to-[#009dff] mb-2">
            Reset Password
          </h1>
          <p className="text-gray-500">
            Enter your email to reset your password
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="relative">
            <Mail
              className="absolute left-3 top-7 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              ref={emailInputRef}
              type="email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setErrors({});
              }}
              placeholder="Email"
              className={`w-full p-3.5 pl-10 border ${
                errors.resetEmail ? "border-red-500" : "border-gray-300"
              } rounded-xl bg-gray-100 focus:outline-none focus:border-black transition-all`}
            />
            {errors.resetEmail && (
              <p className="text-red-500 text-xs pl-2 mt-1">
                {errors.resetEmail}
              </p>
            )}
          </div>

          {passwordResetSent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-center">
              Password reset link sent to your email
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white rounded-xl hover:opacity-90 transition-colors font-semibold flex items-center justify-center"
            >
              Send Reset Link
              <ChevronRight size={20} className="ml-2" />
            </motion.button>
          )}
        </form>
      </motion.div>
    );
  };

  return (
    <motion.div
      animate={backgroundControls}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="absolute inset-0 -z-10"
      />

      <AnimatePresence mode="wait">
        {activeScreen === "login"
          ? renderLoginScreen()
          : activeScreen === "register"
          ? renderRegisterScreen()
          : renderForgotPasswordScreen()}
      </AnimatePresence>

      <div className="absolute bottom-4 left-0 right-0 text-center text-s text-white">
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>{" "}
        •{" "}
        <a href="#" className="hover:underline">
          Cookies Policy
        </a>{" "}
        •{" "}
        <a href="#" className="hover:underline">
          Report a problem
        </a>
      </div>
    </motion.div>
  );
};

export default ThreadsAuthSystem;

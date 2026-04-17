import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import { getTranslation } from "@/i18n";
import logo from "@/assets/images/logo.png";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { locale, direction } = useAppStore();
  const fontClass = locale === "ar" ? "font-ar" : "font-en";
  const btnFontClass = locale === "ar" ? "font-ar-bold" : "font-en";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError(getTranslation(locale, "auth.invalidCredentials"));
    }
  };

  return (
    <div className={"min-h-screen flex " + fontClass} dir={direction}>
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#2E4565] via-brand-800 to-[#289ED5] items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto my-8">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full content-evenly"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {getTranslation(locale, "auth.appName")}
          </h1>
          <p className="text-lg text-brand-100 max-w-md">
            {getTranslation(locale, "auth.appDescription")}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-brand-900">
              {getTranslation(locale, "auth.appName")}
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-brand-800 mb-2">
            {getTranslation(locale, "auth.loginTitle")}
          </h2>
          <p className="text-brand-800/60 mb-8">
            {getTranslation(locale, "auth.enterCredentials")}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-800 mb-2">
                {getTranslation(locale, "auth.email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-brand-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 ps-10 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                  placeholder={getTranslation(locale, "auth.enterEmail")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-800 mb-2">
                {getTranslation(locale, "auth.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-brand-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 ps-10 pe-10 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                  placeholder={getTranslation(locale, "auth.enterPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-brand-400 hover:text-brand-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-6.243a1 1 0 011.415 0M19.07 4.93a1 1 0 010 1.414l-14.14 14.14a1 1 0 01-1.415-1.414l14.14-14.14a1 1 0 011.415 0zM17.657 6.343a8 8 0 000 11.314M5.343 17.657a8 8 0 000-11.314"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-brand-400 hover:text-brand-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-500 border-brand-200 rounded focus:ring-brand-500"
                />
                <span className="ms-2 text-sm text-brand-800">
                  {getTranslation(locale, "auth.rememberMe")}
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-brand-500 hover:text-brand-700"
              >
                {getTranslation(locale, "auth.forgotPassword")}
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={
                "w-full py-3 px-4 bg-brand-700 hover:bg-brand-600 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed " +
                btnFontClass
              }
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ms-1 me-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {getTranslation(locale, "common.loading")}
                </span>
              ) : (
                getTranslation(locale, "auth.login")
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-800">
            {getTranslation(locale, "auth.version")}
          </p>
        </div>
      </div>
    </div>
  );
}

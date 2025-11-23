"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { submitForm, type FormData } from "../actions/submit-form";
import toast, { Toaster } from "react-hot-toast";

const countryCodes = [
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
];

export default function AuditForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    countryCode: "+61",
    website: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountryCodeSelect = (code: string) => {
    setFormData((prev) => ({ ...prev, countryCode: code }));
    setIsDropdownOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result = await submitForm(formData);

      if (result.success) {
        toast.success(result.message, {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#10b981",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
          },
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "+61",
          website: "",
          message: "",
        });
      } else {
        if (result.errors) {
          const errorObj: Record<string, string> = {};
          result.errors.forEach((err) => {
            errorObj[err.field] = err.message;
          });
          setErrors(errorObj);
        }
        toast.error(result.message, {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      }
    });
  };

  return (
    <>
      <Toaster />
      <div className="h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 flex items-center overflow-hidden">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
            SEO Audit Form
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email Fields - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-2.5 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors`}
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2.5 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors`}
                  disabled={isPending}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone and Website Fields - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() =>
                        !isPending && setIsDropdownOpen(!isDropdownOpen)
                      }
                      disabled={isPending}
                      className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[100px]"
                    >
                      <span className="text-lg">
                        {
                          countryCodes.find(
                            (c) => c.code === formData.countryCode
                          )?.flag
                        }
                      </span>
                      <span className="font-medium text-gray-700">
                        {formData.countryCode}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() =>
                              handleCountryCodeSelect(country.code)
                            }
                            className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 transition-colors ${
                              formData.countryCode === country.code
                                ? "bg-orange-100"
                                : ""
                            }`}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="font-medium text-gray-700">
                              {country.code}
                            </span>
                            <span className="text-sm text-gray-500 ml-auto">
                              {country.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={`flex-1 px-4 py-2.5 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors`}
                    disabled={isPending}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Website URL
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Enter your website URL"
                  className={`w-full px-4 py-2.5 border ${
                    errors.website ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors`}
                  disabled={isPending}
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                )}
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message"
                rows={4}
                className={`w-full px-4 py-2.5 border ${
                  errors.message ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors resize-none`}
                disabled={isPending}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {isPending ? "Submitting..." : "Submit"}
            </button>
          </form>

          {/* Note Section */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <h2 className="text-base font-bold text-gray-800 mb-2">Note:</h2>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
              <li>
                You will receive the Audit Report on the given email address
                within 1-7 days.
              </li>
              <li>
                If you have any questions or would like to discuss your results
                further, feel free to reach out to me directly via WhatsApp at{" "}
                <a
                  href="https://wa.me/92316431971"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  +92 316 4319711
                </a>
                , or connect with me on{" "}
                <a
                  href="https://www.linkedin.com/in/mohidali/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  LinkedIn
                </a>
                .
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}

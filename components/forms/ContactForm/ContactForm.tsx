"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { RadioGroup, type RadioOption } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";

const intentOptions: RadioOption[] = [
  {
    value: "demo",
    label: "Schedule a platform demo",
    description: "See deal management, workflows, and term sheet tools in action",
  },
  {
    value: "bond-generator-feedback",
    label: "Give feedback on Bond Generator",
    description: "I've used the tool and have thoughts to share",
  },
  {
    value: "try-bond-generator",
    label: "Help me try Bond Generator",
    description: "I want to use the tool but need assistance getting started",
  },
  {
    value: "waitlist",
    label: "Join waitlist for new tools",
    description: "Notify me when new tools launch",
  },
  {
    value: "pain-points",
    label: "Discuss workflow challenges",
    description: "Let's talk about pain points in my current process",
  },
];

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  intent: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  intent?: string;
}

export const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    role: "",
    intent: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.intent) {
      newErrors.intent = "Please select what brings you here";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setIsSuccess(true);
    } catch {
      setErrors({
        name: "Something went wrong. Please try again or email us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card variant="highlight" size="large" className="max-w-2xl mx-auto text-center">
        <div className="space-y-6">
          <div className="text-6xl">✅</div>
          <h2 className="text-3xl font-semibold text-white">
            Thanks for reaching out!
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            We&apos;ll get back to you soon.
            {formData.intent === "demo" && (
              <span className="block mt-2">
                We&apos;ll send you demo scheduling options within 24 hours.
              </span>
            )}
            {formData.intent === "try-bond-generator" && (
              <span className="block mt-2">
                We&apos;ll help you get started with Bond Generator and answer any questions.
              </span>
            )}
          </p>
          <p className="text-sm text-gray-400">— The MuniFlow team</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="highlight" size="large" className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <FormField
          id="name"
          label="Your name"
          type="text"
          value={formData.name}
          onChange={updateField("name")}
          placeholder="Jane Smith"
          required
          error={errors.name}
        />

        {/* Email */}
        <FormField
          id="email"
          label="Email address"
          type="email"
          value={formData.email}
          onChange={updateField("email")}
          placeholder="jane@example.com"
          required
          error={errors.email}
        />

        {/* Company (optional) */}
        <FormField
          id="company"
          label="Company or organization (optional)"
          type="text"
          value={formData.company}
          onChange={updateField("company")}
          placeholder="City of Austin, ABC Law Firm, etc."
        />

        {/* Role (optional) */}
        <FormField
          id="role"
          label="What you do (optional)"
          type="text"
          value={formData.role}
          onChange={updateField("role")}
          placeholder="Bond attorney, City treasurer, Developer, etc."
        />

        {/* Intent */}
        <RadioGroup
          label="I want to..."
          name="intent"
          options={intentOptions}
          value={formData.intent}
          onChange={updateField("intent")}
          required
          error={errors.intent}
        />

        {/* Message (optional) */}
        <FormField
          id="message"
          label="Anything else? (optional)"
          type="textarea"
          value={formData.message}
          onChange={updateField("message")}
          placeholder="Tell us more about what you're working on..."
          rows={4}
        />

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Sending..." : "Get in Touch"}
          </Button>
        </div>
      </form>
    </Card>
  );
};


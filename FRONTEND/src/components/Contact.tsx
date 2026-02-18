import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Mail,
  Github,
  Linkedin,
  MapPin,
  Phone,
  Send,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ContactProps {
  translations: any;
}

export default function Contact({ translations }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(translations.contact.form.successMessage);

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", message: "" });
      }, 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: translations.contact.info.email,
      value: "hello@developer.com",
      link: "mailto:hello@developer.com",
    },
    {
      icon: Phone,
      label: translations.contact.info.phone,
      value: "+34 123 456 789",
      link: "tel:+34123456789",
    },
    {
      icon: MapPin,
      label: translations.contact.info.location,
      value: "Madrid, España",
      link: null,
    },
  ];

  const socialLinks = [
    {
      icon: Github,
      label: "GitHub",
      link: "https://github.com",
      color: "hover:text-gray-900 dark:hover:text-white",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      link: "https://linkedin.com",
      color: "hover:text-blue-600",
    },
    {
      icon: Mail,
      label: "Email",
      link: "mailto:hello@developer.com",
      color: "hover:text-red-500",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-900 dark:text-gray-100">
            {translations.contact.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {translations.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                {translations.contact.form.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">
                      {translations.contact.form.name}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">
                      {translations.contact.form.email}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">
                      {translations.contact.form.message}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      rows={5}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {translations.contact.form.sending}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {translations.contact.form.send}
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground dark:text-gray-100">
                    {translations.contact.form.thankYou}
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-400">
                    {translations.contact.form.responseTime}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-border dark:border-gray-700 bg-card dark:bg-gray-900/50 shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="font-display text-foreground dark:text-gray-100 font-semibold">
                  {translations.contact.info.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center ring-1 ring-border dark:ring-gray-600">
                        <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground dark:text-gray-400">
                          {item.label}
                        </div>
                        <div className="text-foreground dark:text-gray-100">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  );

                  return item.link ? (
                    <a
                      key={index}
                      href={item.link}
                      className="block hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index}>{content}</div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">
                  {translations.contact.social.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors ${social.color}`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm">{social.label}</span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

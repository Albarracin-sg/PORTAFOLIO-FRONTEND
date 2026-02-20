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
import { sendContactMessage } from "@/shared/api/public";
import { EditableText } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";

interface ContactProps {
  translations: any;
  section?: { id: string; type: string; content: Record<string, unknown> };
}

export default function Contact({ translations, section }: ContactProps) {
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

    try {
      await sendContactMessage(formData);
      setIsSubmitted(true);
      toast.success(translations?.contact?.form?.successMessage ?? '');
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", message: "" });
      }, 3000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo enviar el mensaje",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackContactInfo: Array<Record<string, string>> = [];
  const fallbackSocialLinks: Array<Record<string, string>> = [];

  const contactContent = section?.content ?? {};
  const { draft, updateField } = useSectionEditor(section as any);
  const infoItems =
    (draft.info as Array<Record<string, string>>) ??
    (contactContent.info as Array<Record<string, string>>) ??
    fallbackContactInfo;
  const socialItems =
    (draft.social as Array<Record<string, string>>) ??
    (contactContent.social as Array<Record<string, string>>) ??
    fallbackSocialLinks;
  const infoTitle = (contactContent.infoTitle as string) ?? translations?.contact?.info?.title ?? '';
  const socialTitle = (contactContent.socialTitle as string) ?? translations?.contact?.social?.title ?? '';

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-900 dark:text-gray-100">
            <EditableText
              value={String(draft.title ?? contactContent.title ?? '')}
              onSave={(value) => updateField('title', value)}
            />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            <EditableText
              value={String(draft.subtitle ?? contactContent.subtitle ?? '')}
              onSave={(value) => updateField('subtitle', value)}
              multiline
            />
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                <EditableText
                  value={String(draft.form?.title ?? contactContent.form?.title ?? '')}
                  onSave={(value) => updateField('form.title', value)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">
                      <EditableText
                        value={String(draft.form?.name ?? contactContent.form?.name ?? '')}
                        onSave={(value) => updateField('form.name', value)}
                      />
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
                      <EditableText
                        value={String(draft.form?.email ?? contactContent.form?.email ?? '')}
                        onSave={(value) => updateField('form.email', value)}
                      />
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
                      <EditableText
                        value={String(draft.form?.message ?? contactContent.form?.message ?? '')}
                        onSave={(value) => updateField('form.message', value)}
                      />
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
                        {String(draft.form?.sending ?? contactContent.form?.sending ?? '')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {String(draft.form?.send ?? contactContent.form?.send ?? '')}
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground dark:text-gray-100">
                    {String(draft.form?.thankYou ?? contactContent.form?.thankYou ?? '')}
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-400">
                    {String(draft.form?.responseTime ?? contactContent.form?.responseTime ?? '')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-border dark:border-gray-700 bg-card dark:bg-gray-900/50 shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="font-display text-foreground dark:text-gray-100 font-semibold">
                  {String(infoTitle)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {infoItems.map((item, index) => {
                  const Icon = (item.icon as typeof Mail) ?? Mail;
                  const content = (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center ring-1 ring-border dark:ring-gray-600">
                        <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground dark:text-gray-400">
                        <EditableText
                          value={String(item.label)}
                          onSave={(value) => updateField(`info.${index}.label`, value)}
                        />
                        </div>
                        <div className="text-foreground dark:text-gray-100">
                          <EditableText
                            value={String(item.value)}
                            onSave={(value) => updateField(`info.${index}.value`, value)}
                          />
                        </div>
                      </div>
                    </div>
                  );

                  return item.link ? (
                    <a
                      key={index}
                      href={String(item.link)}
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
                  {String(socialTitle)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {socialItems.map((social, index) => {
                    const Icon = (social.icon as typeof Github) ?? Github;
                    return (
                      <a
                        key={index}
                        href={String(social.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors ${String(social.color ?? '')}`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm">
                          <EditableText
                            value={String(social.label)}
                            onSave={(value) => updateField(`social.${index}.label`, value)}
                          />
                        </span>
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

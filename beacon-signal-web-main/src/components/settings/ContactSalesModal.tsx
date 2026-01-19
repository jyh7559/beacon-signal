import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, Building2, User, Calendar, CreditCard, Phone, Users, Briefcase, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Subscription } from "@/services/api/plans.api";

// Available datasets for selection
const AVAILABLE_DATASETS = [
  { value: "mna", label: "M&A Deals" },
  { value: "fundraising", label: "Fundraising" },
  { value: "layoff", label: "Layoffs" },
  { value: "security_breach", label: "Security Breaches" },
  { value: "cxo_changes", label: "CXO Changes" },
  { value: "business_expansion", label: "Business Expansion" },
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const USE_CASES = [
  { value: "research", label: "Market Research" },
  { value: "sales", label: "Sales Intelligence" },
  { value: "due_diligence", label: "Due Diligence" },
  { value: "competitive", label: "Competitive Analysis" },
  { value: "investment", label: "Investment Research" },
  { value: "other", label: "Other" },
];

const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "video", label: "Video Call" },
];

interface ContactSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Pre-filled user data
  userName?: string;
  userEmail?: string;
  userCompany?: string;
  userRole?: string;
  // Current subscription info
  currentPlan?: string;
  subscriptions?: Subscription[];
}

export function ContactSalesModal({
  open,
  onOpenChange,
  userName = "",
  userEmail = "",
  userCompany = "",
  userRole = "",
  currentPlan = "Trial",
  subscriptions = [],
}: ContactSalesModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [company, setCompany] = useState(userCompany);
  const [phone, setPhone] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [contactMethod, setContactMethod] = useState("email");
  const [datasetsInterested, setDatasetsInterested] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when props change
  useEffect(() => {
    setName(userName);
    setEmail(userEmail);
    setCompany(userCompany);
  }, [userName, userEmail, userCompany]);

  // Calculate subscription expiry
  const getExpiryDate = () => {
    if (subscriptions.length === 0) return "N/A";
    const expiresOn = subscriptions[0]?.expiresOn;
    if (!expiresOn) return "N/A";
    return new Date(expiresOn).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get subscribed resources
  const getSubscribedResources = () => {
    if (subscriptions.length === 0) return "None";
    return subscriptions
      .map((s) => s.resource.replace("dataset.", "").replace(/_/g, " "))
      .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
      .join(", ");
  };

  const toggleDataset = (datasetValue: string) => {
    setDatasetsInterested((prev) =>
      prev.includes(datasetValue)
        ? prev.filter((d) => d !== datasetValue)
        : [...prev, datasetValue]
    );
  };

  const handleSubmit = () => {
    if (!name || !email) {
      toast({
        title: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Build comprehensive email body
    const datasetLabels = datasetsInterested
      .map((d) => AVAILABLE_DATASETS.find((ds) => ds.value === d)?.label || d)
      .join(", ");

    const emailBody = `
Contact Sales Inquiry
=====================

CONTACT INFORMATION
Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Company: ${company || "Not provided"}
Company Size: ${COMPANY_SIZES.find((s) => s.value === companySize)?.label || "Not specified"}
Preferred Contact Method: ${CONTACT_METHODS.find((m) => m.value === contactMethod)?.label || "Email"}

USE CASE
Primary Use Case: ${USE_CASES.find((u) => u.value === useCase)?.label || "Not specified"}
Datasets of Interest: ${datasetLabels || "Not specified"}

CURRENT SUBSCRIPTION
Plan: ${currentPlan}
Expires: ${getExpiryDate()}
Current Resources: ${getSubscribedResources()}

ADDITIONAL MESSAGE
${message || "No additional message provided."}

---
Sent from Intellizence App
    `.trim();

    // Create mailto link
    const mailtoUrl = `mailto:jp@breakthru.ai?subject=${encodeURIComponent(
      `Sales Inquiry from ${name} - ${company || "Intellizence User"}`
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.open(mailtoUrl, "_blank");

    toast({
      title: "Email client opened",
      description: "Please send the email from your email client to complete the inquiry.",
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Sales
          </DialogTitle>
          <DialogDescription>
            Get in touch with our sales team for custom plans, enterprise features, or any questions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Current Subscription Info */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
            <h4 className="text-sm font-medium text-foreground">Current Subscription</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Plan:</span>
                <Badge variant="outline" className="ml-auto">
                  {currentPlan}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Expires:</span>
                <span className="ml-auto text-foreground">{getExpiryDate()}</span>
              </div>
            </div>
            {subscriptions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Resources: {getSubscribedResources()}
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="space-y-4">
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Name *
                </Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email *
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Row 2: Company & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-company" className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Company
                </Label>
                <Input
                  id="contact-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Row 3: Company Size & Use Case */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Company Size
                </Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  Primary Use Case
                </Label>
                <Select value={useCase} onValueChange={setUseCase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    {USE_CASES.map((uc) => (
                      <SelectItem key={uc.value} value={uc.value}>
                        {uc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Preferred Contact Method
              </Label>
              <Select value={contactMethod} onValueChange={setContactMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Datasets of Interest */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5" />
                Datasets of Interest
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_DATASETS.map((dataset) => (
                  <div key={dataset.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dataset-${dataset.value}`}
                      checked={datasetsInterested.includes(dataset.value)}
                      onCheckedChange={() => toggleDataset(dataset.value)}
                    />
                    <label
                      htmlFor={`dataset-${dataset.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {dataset.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="contact-message">Additional Message</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your needs, questions, or interest in upgrading..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Send Inquiry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

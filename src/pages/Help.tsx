import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle,
  Book,
  Video,
  FileText,
  ExternalLink
} from "lucide-react";

const faqs = [
  {
    question: "How do I find a specific department?",
    answer: "You can find departments using the Interactive Map or the Departments page. Use the search function to quickly locate any department by name or service type."
  },
  {
    question: "How do I get directions inside the hospital?",
    answer: "Visit the Navigation page, select your starting point and destination. The system will provide step-by-step directions with estimated walking time."
  },
  {
    question: "Can I schedule appointments through ClinicPath?",
    answer: "Yes! Go to the Appointments page to view, schedule, reschedule, or cancel appointments. You can also see directions to your appointment location."
  },
  {
    question: "How do I contact hospital staff?",
    answer: "Use the Staff Directory to find contact information for doctors, nurses, and administrative staff. You can call them directly or find their office locations."
  },
  {
    question: "Is the navigation system wheelchair accessible?",
    answer: "Yes, all routes provided include wheelchair accessibility information. The system automatically suggests accessible paths when available."
  },
  {
    question: "How do I enable notifications for appointments?",
    answer: "Go to Settings > Notifications and enable 'Appointment Reminders'. You can customize when you receive reminders before your appointments."
  }
];

const Help = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers to common questions and get assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Help Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for help topics, features, or issues..." 
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions and answers about ClinicPath</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Can't find what you're looking for? Send us a message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue or question in detail..."
                  rows={4}
                />
              </div>
              
              <Button className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Technical Support</span>
                </div>
                <p className="text-sm text-muted-foreground">(555) 123-HELP (4357)</p>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email Support</span>
                </div>
                <p className="text-sm text-muted-foreground">help@clinicpath.com</p>
                <p className="text-sm text-muted-foreground">Response within 24 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Video Tutorials
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                User Manual
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Book className="h-4 w-4 mr-2" />
                Quick Start Guide
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Navigation System</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Appointment System</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Staff Directory</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Map Services</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
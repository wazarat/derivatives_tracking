"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "../../components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { MessageSquare, ThumbsUp, ChevronRight, Send } from "lucide-react";

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureVotes, setFeatureVotes] = useState({
    "mobile-app": 127,
    "csv-export": 89,
    "portfolio-sync": 156,
    "alerts": 203,
    "tax-reporting": 178,
  });
  
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText) {
      toast({
        title: "Error",
        description: "Please enter your feedback before submitting.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We'll review it shortly.",
    });
    
    setFeedbackText("");
    setIsSubmitting(false);
  };
  
  const handleVoteFeature = (featureId: string) => {
    setFeatureVotes(prev => ({
      ...prev,
      [featureId]: prev[featureId] + 1
    }));
    
    toast({
      title: "Vote Recorded",
      description: "Thanks for voting! We'll prioritize features based on community interest.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold">Feedback</h1>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
              <TabsTrigger value="features">Feature Requests</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            
            {/* Submit Feedback Tab */}
            <TabsContent value="submit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Feedback</CardTitle>
                  <CardDescription>
                    We value your input! Let us know how we can improve CanHav.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmitFeedback}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-type">Feedback Type</Label>
                      <RadioGroup 
                        id="feedback-type" 
                        value={feedbackType} 
                        onValueChange={setFeedbackType}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="general" id="general" />
                          <Label htmlFor="general">General Feedback</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bug" id="bug" />
                          <Label htmlFor="bug">Bug Report</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="feature" id="feature" />
                          <Label htmlFor="feature">Feature Request</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="feedback">Your Feedback</Label>
                      <Textarea
                        id="feedback"
                        placeholder={
                          feedbackType === "general" 
                            ? "Share your thoughts about CanHav..." 
                            : feedbackType === "bug" 
                              ? "Please describe the issue you encountered and steps to reproduce it..." 
                              : "Describe the feature you'd like to see..."
                        }
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll only use this to follow up on your feedback if needed.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSubmitting} className="ml-auto">
                      {isSubmitting ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> Submit Feedback
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Feature Requests Tab */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Requests</CardTitle>
                  <CardDescription>
                    Vote on features you'd like to see implemented next.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FeatureRequestItem
                      id="mobile-app"
                      title="Mobile App"
                      description="Native mobile application for iOS and Android"
                      votes={featureVotes["mobile-app"]}
                      onVote={() => handleVoteFeature("mobile-app")}
                    />
                    
                    <FeatureRequestItem
                      id="csv-export"
                      title="CSV Export"
                      description="Export portfolio and transaction data to CSV"
                      votes={featureVotes["csv-export"]}
                      onVote={() => handleVoteFeature("csv-export")}
                    />
                    
                    <FeatureRequestItem
                      id="portfolio-sync"
                      title="Exchange Integration"
                      description="Sync portfolio with major exchanges via API"
                      votes={featureVotes["portfolio-sync"]}
                      onVote={() => handleVoteFeature("portfolio-sync")}
                    />
                    
                    <FeatureRequestItem
                      id="alerts"
                      title="Price Alerts"
                      description="Set custom price alerts for assets in your watchlist"
                      votes={featureVotes["alerts"]}
                      onVote={() => handleVoteFeature("alerts")}
                    />
                    
                    <FeatureRequestItem
                      id="tax-reporting"
                      title="Tax Reporting"
                      description="Generate tax reports for crypto transactions"
                      votes={featureVotes["tax-reporting"]}
                      onVote={() => handleVoteFeature("tax-reporting")}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" /> Suggest New Feature
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find answers to common questions about CanHav.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FaqItem
                    question="What data sources does CanHav use?"
                    answer="CanHav uses CoinMarketCap as the primary data source for cryptocurrency market data. We also integrate with dYdX and Hyperliquid for DEX-specific data."
                  />
                  
                  <FaqItem
                    question="Is my portfolio data private?"
                    answer="Yes, all portfolio data is stored securely and is only accessible to you. We do not share your portfolio information with any third parties."
                  />
                  
                  <FaqItem
                    question="How often is market data updated?"
                    answer="Market data is updated every 30 seconds for active cryptocurrencies. Historical data is cached and updated less frequently."
                  />
                  
                  <FaqItem
                    question="Can I export my portfolio data?"
                    answer="CSV export functionality is currently under development and will be available soon. You can vote for this feature in the Feature Requests tab."
                  />
                  
                  <FaqItem
                    question="How do I report a bug?"
                    answer="You can report bugs through the Submit Feedback tab. Select 'Bug Report' as the feedback type and provide as much detail as possible about the issue."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface FeatureRequestItemProps {
  id: string;
  title: string;
  description: string;
  votes: number;
  onVote: () => void;
}

function FeatureRequestItem({ id, title, description, votes, onVote }: FeatureRequestItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="font-medium">{votes}</span> votes
        </div>
        <Button onClick={onVote} size="sm" variant="outline">
          <ThumbsUp className="mr-2 h-4 w-4" /> Vote
        </Button>
      </div>
    </div>
  );
}

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border rounded-lg">
      <button
        className="flex items-center justify-between w-full p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium">{question}</h3>
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <p className="text-sm text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, ChevronRight, Copy, Send, User, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "../../components/ui/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface SuggestedQuestion {
  id: string;
  text: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi there! I'm your crypto research assistant. I'm currently under development and will be launched soon. You'll be notified via email once I'm ready to help you with your crypto research questions!",
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestedQuestions: SuggestedQuestion[] = [
    { id: "q1", text: "What is the difference between proof of work and proof of stake?" },
    { id: "q2", text: "How do funding rates work in perpetual futures?" },
    { id: "q3", text: "What factors affect cryptocurrency volatility?" },
    { id: "q4", text: "Can you explain what a liquidity pool is?" },
    { id: "q5", text: "What are the risks of yield farming?" },
    { id: "q6", text: "How do I calculate impermanent loss?" },
    { id: "q7", text: "What is the difference between CEX and DEX?" },
    { id: "q8", text: "How do layer-2 scaling solutions work?" },
  ];
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // In a real app, we would send the message to an API
    // For now, we'll simulate a response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: generateMockResponse(userMessage.content),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    handleSendMessage();
  };
  
  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Hi there! I'm your crypto research assistant. I'm currently under development and will be launched soon. You'll be notified via email once I'm ready to help you with your crypto research questions!",
        timestamp: new Date(),
      },
    ]);
  };
  
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
    });
  };
  
  const generateMockResponse = (question: string): string => {
    // This is a simple mock response generator
    // In a real app, this would be replaced with an actual API call
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("proof of work") || lowerQuestion.includes("proof of stake")) {
      return "**Proof of Work (PoW)** and **Proof of Stake (PoS)** are consensus mechanisms used by blockchain networks to validate transactions.\n\n**Proof of Work**:\n- Miners solve complex mathematical puzzles\n- Requires significant computational power and energy\n- Examples: Bitcoin, Litecoin\n\n**Proof of Stake**:\n- Validators are selected based on the amount of cryptocurrency they hold and are willing to \"stake\"\n- More energy-efficient than PoW\n- Examples: Ethereum 2.0, Cardano, Solana\n\nThe main differences are in energy consumption, security models, and decentralization characteristics.";
    }
    
    if (lowerQuestion.includes("funding rate") || lowerQuestion.includes("perpetual")) {
      return "**Funding rates** in perpetual futures are periodic payments exchanged between long and short position holders to keep the perpetual contract price close to the index price.\n\n- When funding rate is positive, longs pay shorts\n- When funding rate is negative, shorts pay longs\n- Funding rates are typically calculated and paid every 8 hours\n\nFunding rates serve as a market mechanism to ensure the perpetual futures price doesn't deviate too far from the spot price, despite not having an expiry date like traditional futures contracts.";
    }
    
    if (lowerQuestion.includes("volatility")) {
      return "**Cryptocurrency volatility** is influenced by several factors:\n\n1. **Market Liquidity**: Lower liquidity markets experience higher volatility\n2. **Market Sentiment**: News, social media, and public perception\n3. **Regulatory Developments**: Government announcements and policy changes\n4. **Market Manipulation**: Whale movements and coordinated trading\n5. **Technical Factors**: Network upgrades, forks, and security incidents\n6. **Macroeconomic Trends**: Inflation, interest rates, and global economic conditions\n7. **Market Maturity**: Younger markets tend to be more volatile\n\nVolatility creates both risks and opportunities for traders and investors.";
    }
    
    if (lowerQuestion.includes("liquidity pool")) {
      return "**Liquidity pools** are collections of funds locked in smart contracts that facilitate decentralized trading, lending, and other DeFi activities.\n\n**Key characteristics**:\n- Automated market making (AMM) using mathematical formulas\n- Liquidity providers (LPs) deposit equal values of two or more tokens\n- LPs earn fees from trades that occur in their pool\n- Subject to impermanent loss when asset prices change\n\n**Common platforms**:\n- Uniswap, Curve Finance, Balancer, PancakeSwap\n\nLiquidity pools have revolutionized decentralized exchanges by eliminating the need for traditional order books.";
    }
    
    if (lowerQuestion.includes("yield farm")) {
      return "**Yield farming risks** include:\n\n1. **Smart Contract Vulnerabilities**: Code exploits and hacks\n2. **Impermanent Loss**: Loss due to price divergence in liquidity pools\n3. **Token Value Risk**: Farming tokens may rapidly depreciate\n4. **Liquidation Risk**: In leveraged yield farming strategies\n5. **Regulatory Risk**: Uncertain regulatory status in many jurisdictions\n6. **Gas Fees**: High transaction costs on some networks\n7. **Rug Pulls**: Developers abandoning projects or removing liquidity\n8. **Complexity Risk**: Complex strategies may have unforeseen consequences\n\nIt's essential to thoroughly research protocols and understand the mechanisms before committing significant capital to yield farming.";
    }
    
    // Default response for other questions
    return "That's an interesting question about cryptocurrency. In a fully implemented version, I would provide a detailed and accurate response based on the latest information available. For now, this is a placeholder response to demonstrate the chatbot interface functionality.";
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold">Crypto Research Assistant</h1>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <div className="md:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Chat</CardTitle>
                    <CardDescription>
                      Ask questions about crypto, blockchain, and trading
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearChat}>
                    <X className="h-4 w-4 mr-2" /> Clear Chat
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="prose prose-sm dark:prose-invert">
                            {message.content.split("\n").map((line, i) => (
                              <p key={i} className={i > 0 ? "mt-2" : ""}>
                                {line}
                              </p>
                            ))}
                          </div>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mt-2 opacity-50 hover:opacity-100"
                              onClick={() => handleCopyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg p-3 bg-muted">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-4 w-4 mr-2" /> Send
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Tabs defaultValue="suggested" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="suggested">Suggested</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="suggested" className="flex-1">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Suggested Questions</CardTitle>
                    <CardDescription>
                      Click on a question to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      {suggestedQuestions.map((question) => (
                        <button
                          key={question.id}
                          className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors flex justify-between items-center"
                          onClick={() => handleSuggestedQuestion(question.text)}
                          disabled={isLoading}
                        >
                          <span className="text-sm">{question.text}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="flex-1">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Chat History</CardTitle>
                    <CardDescription>
                      Your recent conversations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="h-8 w-8 mb-2" />
                      <p>Your chat history will appear here</p>
                      <p className="text-sm">History is currently only stored in this session</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <div className="container px-4 py-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          This assistant provides educational information only, not financial advice.
          Always do your own research before making investment decisions.
        </p>
      </div>
    </div>
  );
}

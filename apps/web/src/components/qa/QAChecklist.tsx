'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Save, 
  RotateCcw 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QAItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface QAChecklistProps {
  initialItems?: QAItem[];
  onSave?: (items: QAItem[]) => void;
  readOnly?: boolean;
}

export function QAChecklist({ initialItems = [], onSave, readOnly = false }: QAChecklistProps) {
  const [items, setItems] = useState<QAItem[]>(initialItems);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Load saved items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('qa-checklist-items');
    if (savedItems && initialItems.length === 0) {
      setItems(JSON.parse(savedItems));
    } else if (initialItems.length > 0) {
      setItems(initialItems);
    }
    
    // Initialize expanded categories
    if (initialItems.length > 0) {
      const categories = [...new Set(initialItems.map(item => item.category))];
      setExpandedCategories(categories);
    }
  }, [initialItems]);
  
  // Calculate statistics
  const totalItems = items.length;
  const passedItems = items.filter(item => item.status === 'passed').length;
  const failedItems = items.filter(item => item.status === 'failed').length;
  const warningItems = items.filter(item => item.status === 'warning').length;
  const pendingItems = items.filter(item => item.status === 'pending').length;
  const completionPercentage = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;
  
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, QAItem[]>);
  
  // Handle status change
  const handleStatusChange = (id: string, status: QAItem['status']) => {
    if (readOnly) return;
    
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, status } : item
    );
    setItems(updatedItems);
  };
  
  // Handle notes change
  const handleNotesChange = (id: string, notes: string) => {
    if (readOnly) return;
    
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, notes } : item
    );
    setItems(updatedItems);
  };
  
  // Save items to localStorage
  const saveItems = () => {
    localStorage.setItem('qa-checklist-items', JSON.stringify(items));
    if (onSave) onSave(items);
  };
  
  // Reset items to initial state
  const resetItems = () => {
    setItems(initialItems);
    localStorage.removeItem('qa-checklist-items');
  };
  
  // Get status icon
  const getStatusIcon = (status: QAItem['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: QAItem['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QA Checklist</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {totalItems} Items
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {completionPercentage}% Complete
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Track and verify application functionality
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Statistics */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{passedItems}/{totalItems} completed</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs">{passedItems} Passed</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs">{failedItems} Failed</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-xs">{warningItems} Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xs">{pendingItems} Pending</span>
            </div>
          </div>
        </div>
        
        {/* Checklist Items */}
        <Accordion
          type="multiple"
          value={expandedCategories}
          onValueChange={setExpandedCategories}
          className="w-full"
        >
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span>{category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {categoryItems.filter(item => item.status === 'passed').length}/{categoryItems.length}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => !readOnly && handleStatusChange(
                              item.id, 
                              item.status === 'passed' ? 'pending' : 'passed'
                            )}
                            className={`p-1 rounded-full ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-muted'}`}
                            disabled={readOnly}
                          >
                            {getStatusIcon(item.status)}
                          </button>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(item.priority)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground pl-7">
                        {item.description}
                      </p>
                      
                      {!readOnly && (
                        <div className="pl-7 flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => handleStatusChange(item.id, 'passed')}
                            className={`p-1 rounded ${item.status === 'passed' ? 'bg-green-100 dark:bg-green-900/20' : 'hover:bg-muted'}`}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(item.id, 'failed')}
                            className={`p-1 rounded ${item.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' : 'hover:bg-muted'}`}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(item.id, 'warning')}
                            className={`p-1 rounded ${item.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'hover:bg-muted'}`}
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(item.id, 'pending')}
                            className={`p-1 rounded ${item.status === 'pending' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-muted'}`}
                          >
                            <Clock className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="pl-7 mt-2">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Notes:</span> {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      
      {!readOnly && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={resetItems}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={saveItems}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

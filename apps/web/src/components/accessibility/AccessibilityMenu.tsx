'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Accessibility, 
  Moon, 
  Sun, 
  Type, 
  ZoomIn, 
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';

export function AccessibilityMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Only show the component after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion');
    
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
    
    // Apply saved preferences
    applyFontSize(savedFontSize ? parseInt(savedFontSize) : 100);
    applyHighContrast(savedHighContrast === 'true');
    applyReducedMotion(savedReducedMotion === 'true');
  }, []);

  // Apply font size to HTML element
  const applyFontSize = (size: number) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${size}%`;
      localStorage.setItem('accessibility-font-size', size.toString());
    }
  };

  // Apply high contrast
  const applyHighContrast = (enabled: boolean) => {
    if (typeof document !== 'undefined') {
      if (enabled === true) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      localStorage.setItem('accessibility-high-contrast', String(enabled ?? false));
    }
  };

  // Apply reduced motion
  const applyReducedMotion = (enabled: boolean) => {
    if (typeof document !== 'undefined') {
      if (enabled === true) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
      localStorage.setItem('accessibility-reduced-motion', String(enabled ?? false));
    }
  };

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    applyFontSize(newSize);
  };

  // Handle high contrast toggle
  const handleHighContrastToggle = (checked: boolean) => {
    setHighContrast(checked);
    applyHighContrast(checked);
  };

  // Handle reduced motion toggle
  const handleReducedMotionToggle = (checked: boolean) => {
    setReducedMotion(checked);
    applyReducedMotion(checked);
  };

  // Reset all settings
  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
    setReducedMotion(false);
    applyFontSize(100);
    applyHighContrast(false);
    applyReducedMotion(false);
  };

  if (!mounted) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Accessibility options">
          <Accessibility className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Accessibility Settings</SheetTitle>
          <SheetDescription>
            Customize your experience to make the site more accessible.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Theme</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTheme('system')}
                className="flex-1"
              >
                System
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Font Size */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size" className="flex items-center">
                <Type className="h-4 w-4 mr-2" />
                Font Size
              </Label>
              <span className="text-sm">{fontSize}%</span>
            </div>
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                id="font-size"
                min={75}
                max={150}
                step={5}
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Separator />
          
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
              High Contrast
            </Label>
            <Switch 
              id="high-contrast" 
              checked={highContrast}
              onCheckedChange={handleHighContrastToggle}
            />
          </div>
          
          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion" className="flex items-center gap-2 cursor-pointer">
              Reduced Motion
            </Label>
            <Switch 
              id="reduced-motion" 
              checked={reducedMotion}
              onCheckedChange={handleReducedMotionToggle}
            />
          </div>
          
          <Separator />
          
          {/* Reset Button */}
          <Button 
            variant="outline" 
            onClick={resetSettings}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

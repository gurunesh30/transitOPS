import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ArrowLeft, Check, Shield, Search, LayoutDashboard, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const OnboardingTour: React.FC = () => {
  const { tourActive, setTourActive, tourStep, setTourStep } = useApp();

  if (!tourActive) return null;

  const steps = [
    {
      title: 'Welcome to TransitOps!',
      icon: <Compass className="w-8 h-8 text-brand-primary" />,
      content: 'This is a premium, enterprise-grade logistics control dashboard designed for sub-second transport oversight. Let us take a quick 4-step tour to get you situated.',
      selector: '#welcome'
    },
    {
      title: 'Role-Based Dashboard Personalization',
      icon: <Shield className="w-8 h-8 text-brand-secondary" />,
      content: 'Toggle your active security role (Fleet Manager, Dispatcher, Safety Officer, or Financial Analyst) to change the metric grids, greet headers, and permission sets dynamically.',
      selector: '#role-badge'
    },
    {
      title: 'Universal Search & Quick Actions',
      icon: <Search className="w-8 h-8 text-brand-success" />,
      content: 'Press Ctrl + K at any time to activate the floating command console. From there, search vehicles, drivers, or execute system tasks instantly without clicking.',
      selector: '#search-shortcut'
    },
    {
      title: 'Dashboard Widget Customizer',
      icon: <LayoutDashboard className="w-8 h-8 text-purple-400" />,
      content: 'Personalize your interface by reordering dashboard sections (KPI cards, charts, timeline, and widgets) to place the most critical information first.',
      selector: '#reorder-widgets'
    }
  ];

  const currentStepData = steps[tourStep];

  const handleNext = () => {
    if (tourStep < steps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourActive(false);
      setTourStep(0);
    }
  };

  const handlePrev = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <Card variant="elevated" padding="lg" className="w-full max-w-md overflow-hidden flex flex-col gap-4">
        {/* Step Progress Dot bar */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-brand-primary font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Tour</span>
          </span>
          <span className="text-xs text-white/40 font-mono">
            {tourStep + 1} of {steps.length}
          </span>
        </div>

        {/* Big Step Icon */}
        <div className="flex items-center justify-center py-4 bg-white/5 rounded-xl border border-white/5">
          {currentStepData.icon}
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white leading-snug">{currentStepData.title}</h3>
          <p className="text-sm text-white/70 leading-relaxed">{currentStepData.content}</p>
        </div>

        {/* Progress Bar indicator */}
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-primary to-brand-secondary h-full transition-all duration-300"
            style={{ width: `${((tourStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTourActive(false);
              setTourStep(0);
            }}
            className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            Skip Guide
          </Button>
          
          <div className="flex gap-2">
            {tourStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-1.5"
            >
              {tourStep === steps.length - 1 ? (
                <>
                  <span>Finish</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
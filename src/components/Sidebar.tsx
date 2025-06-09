import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bot, 
  Upload, 
  History, 
  Settings, 
  BookOpen, 
  Brain, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Home,
  Star,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  recentSearches: string[];
  savedPapers: number;
}

const Sidebar = ({ 
  isCollapsed, 
  onToggle, 
  activeTab, 
  onTabChange, 
  recentSearches,
  savedPapers 
}: SidebarProps) => {
  const navigationItems = [
    {
      id: 'search',
      label: 'Literature Search',
      icon: Search,
      description: 'Search scientific papers',
      badge: null
    },
    {
      id: 'ai-assistant',
      label: 'AI Research Assistant',
      icon: Bot,
      description: 'Chat with AI researcher',
      badge: 'New'
    },
    {
      id: 'upload',
      label: 'Upload Papers',
      icon: Upload,
      description: 'Analyze your documents',
      badge: null
    },
    {
      id: 'saved',
      label: 'Saved Papers',
      icon: Star,
      description: 'Your bookmarked research',
      badge: savedPapers > 0 ? savedPapers.toString() : null
    },
    {
      id: 'history',
      label: 'Search History',
      icon: History,
      description: 'Recent searches',
      badge: null
    },
    {
      id: 'mind-maps',
      label: 'Mind Maps',
      icon: Brain,
      description: 'Visual research maps',
      badge: null
    }
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-emerald-100/50 shadow-lg transition-all duration-300 z-40",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-emerald-100/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/95eed986-cbe2-4cff-bcac-bfd6e297178e.png" 
                alt="GeneLinker Logo" 
                className="w-8 h-8"
              />
              <h2 className="text-lg font-light text-emerald-900">GeneLinker</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start text-left h-auto p-3",
              activeTab === item.id 
                ? "bg-emerald-600 text-white shadow-lg" 
                : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
              isCollapsed && "justify-center"
            )}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={activeTab === item.id ? "secondary" : "default"}
                      className="ml-2 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs opacity-75 mt-1">{item.description}</p>
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* Recent Searches */}
      {!isCollapsed && recentSearches.length > 0 && (
        <div className="p-4 border-t border-emerald-100/50">
          <h3 className="text-sm font-medium text-emerald-800 mb-3">Recent Searches</h3>
          <div className="space-y-2">
            {recentSearches.slice(0, 3).map((search, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                onClick={() => onTabChange('search')}
              >
                <Search className="w-3 h-3 mr-2" />
                <span className="truncate">{search}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-emerald-800 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start text-xs">
                  <Download className="w-3 h-3 mr-2" />
                  Export Data
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start text-xs">
                  <Settings className="w-3 h-3 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
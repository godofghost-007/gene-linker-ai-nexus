
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Microscope, User } from "lucide-react";

type Persona = 'researcher' | 'student';

interface PersonaSwitcherProps {
  onPersonaChange: (persona: Persona) => void;
}

const PersonaSwitcher = ({ onPersonaChange }: PersonaSwitcherProps) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>('researcher');

  const handlePersonaChange = (persona: Persona) => {
    setSelectedPersona(persona);
    onPersonaChange(persona);
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Interface Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedPersona === 'researcher' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePersonaChange('researcher')}
            className="flex items-center gap-2 text-xs"
          >
            <Microscope className="w-3 h-3" />
            Researcher
          </Button>
          <Button
            variant={selectedPersona === 'student' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePersonaChange('student')}
            className="flex items-center gap-2 text-xs"
          >
            <GraduationCap className="w-3 h-3" />
            Student
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaSwitcher;

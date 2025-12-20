"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign, AlertTriangle, Shield, Heart, Briefcase, Leaf } from "lucide-react";
import type { CPAPItem, CPAPItemInput } from "@/types/cpap";

const SERVICE_AREAS = [
  {
    value: "Financial Administration",
    label: "Financial Administration",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: "Disaster Preparedness",
    label: "Disaster Preparedness",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    value: "Safety & Peace Order",
    label: "Safety & Peace Order",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    value: "Social Protection",
    label: "Social Protection",
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    value: "Business Friendliness",
    label: "Business Friendliness",
    icon: Briefcase,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    value: "Environmental Management",
    label: "Environmental Management",
    icon: Leaf,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
] as const;

interface CPAPItemFormProps {
  item?: CPAPItem | null;
  onSave: (item: CPAPItemInput) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export function CPAPItemForm({
  item,
  onSave,
  onCancel,
  isReadOnly = false,
}: CPAPItemFormProps) {
  const [formData, setFormData] = useState<CPAPItemInput>({
    priority_area: "",
    target_output: "",
    success_indicator: "",
    responsible_person: "",
    timeline_start: "",
    timeline_end: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        priority_area: item.priority_area,
        target_output: item.target_output,
        success_indicator: item.success_indicator,
        responsible_person: item.responsible_person,
        timeline_start: item.timeline_start.split("T")[0],
        timeline_end: item.timeline_end.split("T")[0],
      });
    }
  }, [item]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.priority_area.trim()) {
      newErrors.priority_area = "Priority area is required";
    }
    if (!formData.target_output.trim()) {
      newErrors.target_output = "Target output is required";
    }
    if (!formData.success_indicator.trim()) {
      newErrors.success_indicator = "Success indicator is required";
    }
    if (!formData.responsible_person.trim()) {
      newErrors.responsible_person = "Responsible person is required";
    }
    if (!formData.timeline_start) {
      newErrors.timeline_start = "Start date is required";
    }
    if (!formData.timeline_end) {
      newErrors.timeline_end = "End date is required";
    }

    if (formData.timeline_start && formData.timeline_end) {
      const start = new Date(formData.timeline_start);
      const end = new Date(formData.timeline_end);
      if (end < start) {
        newErrors.timeline_end = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (
    field: keyof CPAPItemInput,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base">
          Priority Area <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select the service area this action item addresses
        </p>
        <RadioGroup
          value={formData.priority_area}
          onValueChange={(value) => handleChange("priority_area", value)}
          disabled={isReadOnly}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {SERVICE_AREAS.map((area) => {
            const Icon = area.icon;
            const isSelected = formData.priority_area === area.value;
            
            return (
              <label
                key={area.value}
                htmlFor={`area-${area.value.toLowerCase().replace(/\s+/g, "-")}`}
                className={`
                  relative flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer
                  transition-all duration-200 hover:shadow-md
                  ${isSelected 
                    ? `${area.borderColor} ${area.bgColor} shadow-sm` 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}
                `}
              >
                <RadioGroupItem
                  value={area.value}
                  id={`area-${area.value.toLowerCase().replace(/\s+/g, "-")}`}
                  disabled={isReadOnly}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${isSelected ? area.color : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {area.label}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </RadioGroup>
        {errors.priority_area && (
          <p className="text-sm text-red-500 mt-2">{errors.priority_area}</p>
        )}
      </div>

      <div>
        <Label htmlFor="target_output">
          Target Output <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="target_output"
          value={formData.target_output}
          onChange={(e) => handleChange("target_output", e.target.value)}
          placeholder="Describe the expected output or deliverable"
          disabled={isReadOnly}
          rows={3}
          aria-invalid={!!errors.target_output}
        />
        {errors.target_output && (
          <p className="text-sm text-red-500 mt-1">{errors.target_output}</p>
        )}
      </div>

      <div>
        <Label htmlFor="success_indicator">
          Success Indicator <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="success_indicator"
          value={formData.success_indicator}
          onChange={(e) => handleChange("success_indicator", e.target.value)}
          placeholder="How will success be measured?"
          disabled={isReadOnly}
          rows={3}
          aria-invalid={!!errors.success_indicator}
        />
        {errors.success_indicator && (
          <p className="text-sm text-red-500 mt-1">
            {errors.success_indicator}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="responsible_person">
          Responsible Person <span className="text-red-500">*</span>
        </Label>
        <Input
          id="responsible_person"
          value={formData.responsible_person}
          onChange={(e) => handleChange("responsible_person", e.target.value)}
          placeholder="Name or position of responsible person"
          disabled={isReadOnly}
          aria-invalid={!!errors.responsible_person}
        />
        {errors.responsible_person && (
          <p className="text-sm text-red-500 mt-1">
            {errors.responsible_person}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeline_start">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="timeline_start"
            type="date"
            value={formData.timeline_start}
            onChange={(e) => handleChange("timeline_start", e.target.value)}
            disabled={isReadOnly}
            aria-invalid={!!errors.timeline_start}
          />
          {errors.timeline_start && (
            <p className="text-sm text-red-500 mt-1">
              {errors.timeline_start}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="timeline_end">
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="timeline_end"
            type="date"
            value={formData.timeline_end}
            onChange={(e) => handleChange("timeline_end", e.target.value)}
            disabled={isReadOnly}
            aria-invalid={!!errors.timeline_end}
          />
          {errors.timeline_end && (
            <p className="text-sm text-red-500 mt-1">{errors.timeline_end}</p>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? "Update Item" : "Add Item"}
          </Button>
        </div>
      )}
    </form>
  );
}

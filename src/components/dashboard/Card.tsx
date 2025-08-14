"use client";

import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

export default function Card({ title, children, className = "", headerActions }: CardProps) {
  return (
    <UICard className={`w-full h-full flex flex-col ${className}`}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {headerActions}
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-0">
        {children}
      </CardContent>
    </UICard>
  );
}
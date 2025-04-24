import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backLink?: string;
  backLinkText?: string;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export function FormLayout({
  title,
  description,
  children,
  footer,
  backLink,
  backLinkText = "Back",
  className,
  cardClassName,
  contentClassName,
  footerClassName,
}: FormLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backLink) {
      navigate(backLink);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {backLink !== undefined && (
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {backLinkText}
        </Button>
      )}

      <Card className={cn("max-w-3xl mx-auto", cardClassName)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={cn("space-y-6", contentClassName)}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className={cn("flex justify-end gap-2 pt-4 border-t", footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormRow({
  children,
  className,
}: FormRowProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {children}
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({
  children,
  className,
}: FormActionsProps) {
  return (
    <div className={cn("flex justify-end gap-2", className)}>
      {children}
    </div>
  );
}

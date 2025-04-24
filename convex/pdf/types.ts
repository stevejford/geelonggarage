import { Id } from "../_generated/dataModel";

// Document types
export type DocumentType = "quote" | "invoice" | "workOrder";

// PDF generation result
export interface PdfGenerationResult {
  success: boolean;
  message?: string;
  error?: string;
  storageId?: Id<"_storage">;
  url?: string;
}

// Template data interfaces
export interface CompanyInfo {
  company_name: string;
  company_address_line1: string;
  company_address_line2: string;
  company_phone: string;
  company_email: string;
  company_bank_name: string;
  company_account_name: string;
  company_bsb: string;
  company_account_number: string;
  logo_url: string;
}

export interface CustomerInfo {
  customer_name: string;
  customer_address_line1: string;
  customer_address_line2: string;
  customer_phone: string;
  customer_email: string;
}

export interface LineItem {
  quantity: number;
  description: string;
  unit_price: string;
  total: string;
}

// Quote template data
export interface QuoteTemplateData extends CompanyInfo, CustomerInfo {
  quote_number: string;
  quote_date: string;
  expiry_date: string;
  status: string;
  status_class: string;
  line_items: LineItem[];
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  generated_date: string;
}

// Invoice template data
export interface InvoiceTemplateData extends CompanyInfo, CustomerInfo {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  status_class: string;
  work_order_number?: string | null;
  work_order_completed_date?: string | null;
  line_items: LineItem[];
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  generated_date: string;
}

// Work order template data
export interface WorkOrderTemplateData extends CompanyInfo, CustomerInfo {
  work_order_number: string;
  created_date: string;
  scheduled_date: string;
  completed_date?: string | null;
  status: string;
  status_class: string;
  technicians: { name: string }[];
  notes: string;
  generated_date: string;
}

// Union type for all template data
export type TemplateData = 
  | QuoteTemplateData 
  | InvoiceTemplateData 
  | WorkOrderTemplateData;

// PDF service request
export interface PdfServiceRequest {
  templateName: string;
  templateData: TemplateData;
  options?: {
    format?: string;
    margin?: {
      top: string;
      right: string;
      bottom: string;
      left: string;
    };
  };
}

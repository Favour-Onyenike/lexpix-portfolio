
import React from "react";
import { type ToasterToast, useToast as useToastOriginal, toast as toastOriginal } from "@/components/ui/toaster";

export type Toast = ToasterToast;

// Re-export the hook and toast function
export const useToast = useToastOriginal;
export const toast = toastOriginal;

"use client"

import { useToast as useToastOriginal } from "@/hooks/use-toast"

export function useToast() {
  return useToastOriginal()
}

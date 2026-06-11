import { CPAPEditorClient } from "@/components/cpap/CPAPEditorClient";

// Force dynamic rendering (skip SSR prerendering during build)
export const dynamic = 'force-dynamic';

export default function CPAPEditorPage() {
  return <CPAPEditorClient />;
}

/**
 * Utility to get the correct logo path for a barangay.
 * Always looks in /barangay-logos/ and handles naming/extensions.
 */
export function getBarangayLogoPath(name: string | null | undefined): string {
  if (!name) return '';

  // Clean the name to match filenames
  // (e.g., remove trailing spaces, handle special mappings)
  const cleanName = name.trim();
  
  const mapping: Record<string, string> = {
    "Haradabutai": "Harada Butai",
    "Parame": "Parami",
    "Solong Vale": "Solongvale",
    "Osmeña": "Osmena",
    "Tala-O": "Tala-o",
    "Mckinley": "McKinley"
  };

  const finalName = mapping[cleanName] || cleanName;
  
  // Parami is the only PNG
  const extension = finalName === "Parami" ? "png" : "jpg";
  
  return `/barangay-logos/${finalName}.${extension}`;
}

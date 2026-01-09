/**
 * File Detection for Instagram Data Upload
 * Detects and validates the 12 required JSON files from Instagram export
 */

// The 12 required files from Instagram export (exact filenames)
const REQUIRED_FILES = [
  'ads_viewed.json',
  'posts_viewed.json',
  'videos_watched.json',
  'following.json',
  'link_history.json',
  'place_searches.json',
  'profile_searches.json',
  'word_or_phrase_searches.json',
  'liked_comments.json',
  'liked_posts.json',
  'ads_clicked.json',
  'saved_posts.json' 
] as const;

export interface DetectionResult {
  isValid: boolean;           // true if all 12 required files found
  matched: Map<string, File>; // filename -> File object
  missing: string[];          // which required files are missing
  extra: File[];              // other JSON files (not in required list)
  hasHtmlFiles: boolean;      // true if HTML files detected
}

/**
 * Detect Instagram files from a folder upload
 * @param files - FileList or File[] from folder input
 * @returns Detection result with matched, missing, and extra files
 */
export function detectInstagramFiles(files: FileList | File[]): DetectionResult {
  const fileArray = Array.from(files);
  
  // Check for HTML files FIRST
  const htmlFiles = fileArray.filter(file => 
    file.name.toLowerCase().endsWith('.html')
  );
  const hasHtmlFiles = htmlFiles.length > 0;
  
  // Filter only JSON files
  const jsonFiles = fileArray.filter(file => 
    file.name.toLowerCase().endsWith('.json')
  );

  const matched = new Map<string, File>();
  const extra: File[] = [];

  // Check each JSON file
  for (const file of jsonFiles) {
    const filename = file.name;
    
    // Check if this file is one of the required files
    if (REQUIRED_FILES.includes(filename as any)) {
      // Only keep first match (in case of duplicates)
      if (!matched.has(filename)) {
        matched.set(filename, file);
      }
    } else {
      // This is an extra JSON file not in our required list
      extra.push(file);
    }
  }

  // Find missing files
  const missing = REQUIRED_FILES.filter(
    requiredFile => !matched.has(requiredFile)
  );

  // Valid if all 12 required files are found
  const isValid = missing.length === 0;

  return {
    isValid,
    matched,
    missing,
    extra,
    hasHtmlFiles
  };
}

/**
 * Get a human-readable summary of the detection result
 */
export function getDetectionSummary(result: DetectionResult): string {
  if (result.isValid) {
    return `All ${REQUIRED_FILES.length} required files found`;
  }
  
  return `Missing ${result.missing.length} required file(s): ${result.missing.join(', ')}`;
}

/**
 * Get the list of required files (for display purposes)
 */
export function getRequiredFiles(): readonly string[] {
  return REQUIRED_FILES;
}
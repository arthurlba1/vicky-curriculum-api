/**
 * Incremental JSON Parser for Streaming
 * 
 * Parses JSON incrementally from streaming content, detecting and extracting
 * complete objects as they become available in the stream.
 * Uses modern techniques for robust incremental parsing.
 */
export class IncrementalJsonParser<T> {
  private buffer: string = '';
  private readonly maxBufferSize: number;
  private lastExtractedIndex: number = -1;

  constructor(maxBufferSize: number = 10 * 1024 * 1024) {
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Append new content to the buffer and attempt to extract complete objects
   * Uses incremental parsing to detect complete objects within arrays
   * @param chunk - New content chunk from stream
   * @returns Array of complete, parsed objects that are newly available
   */
  append(chunk: string): T[] {
    if (this.buffer.length + chunk.length > this.maxBufferSize) {
      throw new Error('Buffer size exceeded maximum limit');
    }

    this.buffer += chunk;
    const extracted = this.extractCompleteObjectsIncremental();
    
    // Note: We keep the buffer intact even after extraction
    // This allows us to re-parse in finalize() if needed
    // The lastExtractedIndex tracks what we've already returned
    
    return extracted;
  }

  /**
   * Extract complete objects incrementally from the buffer
   * Detects when individual objects within an array are complete
   */
  private extractCompleteObjectsIncremental(): T[] {
    const cleanBuffer = this.cleanBuffer();
    
    if (!cleanBuffer) {
      return [];
    }

    // Try to find the array structure
    const arrayStart = cleanBuffer.indexOf('[');
    if (arrayStart === -1) {
      // Try object with aisUnits property
      return this.tryExtractFromObject(cleanBuffer);
    }

    // Extract objects from array incrementally
    const extracted = this.extractObjectsFromArray(cleanBuffer, arrayStart);
    
    return extracted;
  }

  /**
   * Try to extract from object structure like { "aisUnits": [...] }
   */
  private tryExtractFromObject(buffer: string): T[] {
    try {
      // Check if we have a complete object structure
      const parsed = JSON.parse(buffer);
      
      if (parsed.aisUnits && Array.isArray(parsed.aisUnits)) {
        return this.getNewObjects(parsed.aisUnits);
      }
      
      return [];
    } catch {
      // Object is incomplete, try to find aisUnits array within
      const aisUnitsMatch = buffer.match(/"aisUnits"\s*:\s*\[/);
      if (aisUnitsMatch) {
        const arrayStart = aisUnitsMatch.index! + aisUnitsMatch[0].length - 1;
        return this.extractObjectsFromArray(buffer, arrayStart);
      }
      
      return [];
    }
  }

  /**
   * Extract objects from array incrementally
   * Detects complete objects by balancing braces and brackets
   */
  private extractObjectsFromArray(buffer: string, arrayStart: number): T[] {
    const objects: T[] = [];
    let currentIndex = arrayStart + 1; // Skip opening bracket
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    let objectStart = -1;

    while (currentIndex < buffer.length) {
      const char = buffer[currentIndex];

      if (escapeNext) {
        escapeNext = false;
        currentIndex++;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        currentIndex++;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        currentIndex++;
        continue;
      }

      if (inString) {
        currentIndex++;
        continue;
      }

      // Track object boundaries
      if (char === '{') {
        if (depth === 0) {
          objectStart = currentIndex;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && objectStart !== -1) {
          // Found a complete object
          const objectStr = buffer.substring(objectStart, currentIndex + 1);
          try {
            const parsed = JSON.parse(objectStr);
            objects.push(parsed as T);
            objectStart = -1;
          } catch {
            // Object might still be incomplete, skip for now
          }
        }
      }

      currentIndex++;
    }

    // Return only new objects
    return this.getNewObjects(objects);
  }

  /**
   * Get only new objects that haven't been extracted yet
   * Uses index tracking to avoid returning the same objects multiple times
   */
  private getNewObjects(objects: T[]): T[] {
    // If we've already extracted all objects, return empty
    if (objects.length <= this.lastExtractedIndex + 1) {
      return [];
    }

    // Get only objects after the last extracted index
    const newObjects = objects.slice(this.lastExtractedIndex + 1);
    
    // Update the last extracted index to the end of current objects array
    // This ensures we don't return the same objects again
    this.lastExtractedIndex = objects.length - 1;
    
    return newObjects;
  }

  /**
   * Extract all complete objects from the current buffer (final parse)
   * Should be called when stream is complete
   */
  finalize(): T[] {
    // First, try incremental extraction one more time to get any objects
    // that became complete in the last chunk
    const incrementalObjects = this.extractCompleteObjectsIncremental();
    if (incrementalObjects.length > 0) {
      // Don't clear buffer yet, we might need it for full parse
      return incrementalObjects;
    }

    const cleanBuffer = this.cleanBuffer();
    
    if (!cleanBuffer) {
      // Buffer is empty, nothing more to extract
      return [];
    }

    try {
      // Try full parse to get all remaining objects
      const parsed = JSON.parse(cleanBuffer);
      const objects = this.extractObjectsFromParsed(parsed);
      const newObjects = this.getNewObjects(objects);
      
      // Clear buffer and reset state after finalization
      this.buffer = '';
      this.lastExtractedIndex = -1;
      
      return newObjects;
    } catch (error) {
      // If full parse fails, the JSON might be incomplete
      // Don't throw, just return what we have
      // The buffer will be preserved for debugging
      return [];
    }
  }

  /**
   * Clean buffer from markdown code blocks and whitespace
   */
  private cleanBuffer(): string {
    return this.buffer
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  }

  /**
   * Extract objects from parsed JSON structure
   * Handles both direct arrays and objects with nested arrays
   */
  private extractObjectsFromParsed(parsed: any): T[] {
    if (Array.isArray(parsed)) {
      return parsed as T[];
    }

    if (parsed && typeof parsed === 'object') {
      // Try common property names
      const possibleKeys = ['aisUnits', 'units', 'items', 'data', 'results'];
      
      for (const key of possibleKeys) {
        if (Array.isArray(parsed[key])) {
          return parsed[key] as T[];
        }
      }
    }

    return [];
  }

  /**
   * Clear the internal buffer and reset state
   */
  clear(): void {
    this.buffer = '';
    this.lastExtractedIndex = -1;
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Get the current buffer content (for debugging)
   * Should be used carefully as it may contain incomplete JSON
   */
  getBufferContent(): string {
    return this.buffer;
  }

  /**
   * Get cleaned buffer content (for debugging)
   */
  getCleanedBuffer(): string {
    return this.cleanBuffer();
  }
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the center point of an SVG path
 * @param pathData SVG path data string
 * @returns {x: number, y: number} The center coordinates
 */
export function calculatePathCenter(pathData: string): { x: number; y: number } {
  // Extract all numbers from the path data
  const numbers = pathData.match(/-?\d+\.?\d*/g);
  if (!numbers) return { x: 0, y: 0 };

  // Convert strings to numbers and separate into x and y coordinates
  const coordinates = numbers.map(Number);
  const xCoords: number[] = [];
  const yCoords: number[] = [];
  
  // SVG path commands alternate between x and y coordinates
  for (let i = 0; i < coordinates.length; i += 2) {
    if (i + 1 < coordinates.length) {
      xCoords.push(coordinates[i]);
      yCoords.push(coordinates[i + 1]);
    }
  }

  // Calculate the average of x and y coordinates
  const x = xCoords.reduce((a, b) => a + b, 0) / xCoords.length;
  const y = yCoords.reduce((a, b) => a + b, 0) / yCoords.length;

  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

// Homepage image utilities
const HOMEPAGE_IMAGES = [
  '/images/homepage/tupv1.png',
  '/images/homepage/tupv2.png',
  '/images/homepage/tupv3.png',
  '/images/homepage/tupv4.png',
  '/images/homepage/tupv5.png'
];

export function getRandomHomepageImage(): string {
  // Generate a new random image on each call for true randomization
  if (typeof window !== 'undefined') {
    const randomIndex = Math.floor(Math.random() * HOMEPAGE_IMAGES.length);
    const selectedImage = HOMEPAGE_IMAGES[randomIndex];

    // Store it temporarily to maintain consistency during the current page session
    sessionStorage.setItem('currentRandomImage', selectedImage);
    return selectedImage;
  }

  // Fallback for server-side rendering
  return HOMEPAGE_IMAGES[0];
}

// Helper function to get the current random image without generating a new one
export function getCurrentRandomImage(): string {
  if (typeof window !== 'undefined') {
    const storedImage = sessionStorage.getItem('currentRandomImage');
    if (storedImage) {
      return storedImage;
    }
  }
  return HOMEPAGE_IMAGES[0];
}

export function getAllHomepageImages(): string[] {
  return HOMEPAGE_IMAGES;
}
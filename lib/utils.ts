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
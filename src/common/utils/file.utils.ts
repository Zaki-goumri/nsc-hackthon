import csv from 'csv-parser';
import { Readable } from 'stream';

export const parseCsv = async <T>(csvString: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    try {
      const results: T[] = [];
      Readable.from(csvString)
        .pipe(csv())
        .on('data', (data: T) => {
          results.push(data);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    } catch (error: unknown) {
      console.error('Error parsing CSV file:', error);
      reject(new Error('Error parsing CSV file'));
    }
  });
};

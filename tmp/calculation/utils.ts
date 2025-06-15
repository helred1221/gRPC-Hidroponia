export function retornaValorRandom(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
  
export function calcularMedia(arr: number[]): number {
    return arr.length > 0 
      ? arr.reduce((a, b) => a + b, 0) / arr.length
      : 0;
}
  
export function calcularMediana(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 
      ? sorted[mid] 
      : parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}
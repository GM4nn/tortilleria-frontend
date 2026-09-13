// Ordena puntos por "vecino más cercano" (nearest-neighbor) empezando desde
// (startLat, startLng): cada siguiente parada es la más próxima a la anterior.
// Reduce las vueltas en el reparto. Los puntos sin coordenadas van al final.

interface GeoPoint {
  latitude?: number | null;
  longitude?: number | null;
}

export function orderByNearest<T extends GeoPoint>(
  items: T[],
  startLat: number,
  startLng: number
): T[] {
  const withCoords = items.filter((i) => i.latitude != null && i.longitude != null);
  const without = items.filter((i) => i.latitude == null || i.longitude == null);

  const remaining = [...withCoords];
  const result: T[] = [];

  // Corrección de longitud por latitud (para que dx y dy sean comparables)
  const cos = Math.cos((startLat * Math.PI) / 180);
  let curLat = startLat;
  let curLng = startLng;

  const dist2 = (p: T) => {
    const dLat = (p.latitude as number) - curLat;
    const dLng = ((p.longitude as number) - curLng) * cos;
    return dLat * dLat + dLng * dLng;
  };

  while (remaining.length) {
    let bestIdx = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = dist2(remaining[i]);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    const [next] = remaining.splice(bestIdx, 1);
    result.push(next);
    curLat = next.latitude as number;
    curLng = next.longitude as number;
  }

  return [...result, ...without];
}

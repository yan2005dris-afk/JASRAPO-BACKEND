export interface GeoPoint {
  id: bigint;
  lat: number;
  lng: number;
}

export class HaversineService {
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Compute the great-circle distance between two points on Earth using the
   * Haversine formula. Returns distance in kilometers.
   */
  static distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Greedy nearest-neighbor ordering. Returns the point IDs in the order
   * they should be visited, starting from the first point in the input array.
   *
   * This is an O(n²) algorithm suitable for small zones (< 100 points).
   * For larger sets, a 2-opt improvement pass or spatial index should be added.
   */
  static nearestNeighbor(points: GeoPoint[]): bigint[] {
    if (points.length === 0) return [];
    if (points.length === 1) return [points[0].id];

    const visited = new Set<bigint>();
    const order: bigint[] = [];

    // Start from the first point in the array
    let current = points[0];
    visited.add(current.id);
    order.push(current.id);

    while (order.length < points.length) {
      let nearestDist = Infinity;
      let nearestIdx = -1;

      for (let i = 0; i < points.length; i++) {
        if (visited.has(points[i].id)) continue;

        const dist = this.distance(current.lat, current.lng, points[i].lat, points[i].lng);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      if (nearestIdx === -1) break; // Safety — should never happen

      current = points[nearestIdx];
      visited.add(current.id);
      order.push(current.id);
    }

    return order;
  }
}

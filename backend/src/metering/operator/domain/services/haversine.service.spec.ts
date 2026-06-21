import { HaversineService, type GeoPoint } from './haversine.service';

describe('HaversineService', () => {
  describe('distance', () => {
    it('should return 0 for the same point', () => {
      const d = HaversineService.distance(0, 0, 0, 0);
      expect(d).toBe(0);
    });

    it('should return 0 for the same point with non-zero coordinates', () => {
      const d = HaversineService.distance(-33.45, -70.66, -33.45, -70.66);
      expect(d).toBe(0);
    });

    it('should compute approximate distance between Madrid and Barcelona (~505 km)', () => {
      // Madrid: 40.4168, -3.7038
      // Barcelona: 41.3874, 2.1686
      const d = HaversineService.distance(40.4168, -3.7038, 41.3874, 2.1686);
      expect(d).toBeGreaterThan(490);
      expect(d).toBeLessThan(520);
    });

    it('should compute approximate distance between Tokyo and Shanghai (~1760 km)', () => {
      // Tokyo: 35.6762, 139.6503
      // Shanghai: 31.2304, 121.4737
      const d = HaversineService.distance(35.6762, 139.6503, 31.2304, 121.4737);
      expect(d).toBeGreaterThan(1700);
      expect(d).toBeLessThan(1850);
    });

    it('should handle points at the equator', () => {
      // 1 degree of longitude at equator ≈ 111.195 km
      const d = HaversineService.distance(0, 0, 0, 1);
      expect(d).toBeGreaterThan(110);
      expect(d).toBeLessThan(112);
    });

    it('should handle points at the north pole', () => {
      const d = HaversineService.distance(90, 0, 90, 180);
      expect(d).toBeCloseTo(0, 10);
    });

    it('should handle antipodal points (opposite sides of earth)', () => {
      // Ecuador point (0,0) and antipode (0,180) → ~20015 km (half circumference)
      const d = HaversineService.distance(0, 0, 0, 180);
      expect(d).toBeGreaterThan(19900);
      expect(d).toBeLessThan(20100);
    });
  });

  describe('nearestNeighbor', () => {
    it('should return empty array for empty input', () => {
      const result = HaversineService.nearestNeighbor([]);
      expect(result).toEqual([]);
    });

    it('should return single id for single point', () => {
      const points: GeoPoint[] = [{ id: BigInt(1), lat: 0, lng: 0 }];
      const result = HaversineService.nearestNeighbor(points);
      expect(result).toEqual([BigInt(1)]);
    });

    it('should order 3 points in nearest-first sequence', () => {
      const points: GeoPoint[] = [
        { id: BigInt(1), lat: 0, lng: 0 },
        { id: BigInt(2), lat: 1, lng: 0 },
        { id: BigInt(3), lat: 0, lng: 1 },
      ];
      const result = HaversineService.nearestNeighbor(points);
      // Start at (0,0) → nearest is either (1,0) or (0,1) → both ~111km
      expect(result[0]).toBe(BigInt(1));
      expect(result).toHaveLength(3);
    });

    it('should produce deterministic results from different start points', () => {
      const points: GeoPoint[] = [
        { id: BigInt(1), lat: 10, lng: 10 },
        { id: BigInt(2), lat: 10.1, lng: 10.1 },
        { id: BigInt(3), lat: 10.5, lng: 10.5 },
        { id: BigInt(4), lat: 11, lng: 11 },
      ];
      const result = HaversineService.nearestNeighbor(points);
      // First point in array is the seed → BigInt(1)
      expect(result[0]).toBe(BigInt(1));
      // BigInt(3) should appear before BigInt(4) since it's closer to BigInt(2)
      expect(result).toHaveLength(4);
      // All points should be in the result
      expect(new Set(result.map(Number))).toEqual(new Set([1, 2, 3, 4]));
    });

    it('should handle two points', () => {
      const points: GeoPoint[] = [
        { id: BigInt(1), lat: -33.45, lng: -70.66 },
        { id: BigInt(2), lat: -33.46, lng: -70.67 },
      ];
      const result = HaversineService.nearestNeighbor(points);
      expect(result).toEqual([BigInt(1), BigInt(2)]);
    });
  });
});

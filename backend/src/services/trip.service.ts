import { prisma } from '../config/database';

export class TripService {
  public static async executeDispatchTransaction(data: {
    source: string;
    destination: string;
    cargo_weight: number;
    planned_distance: number;
    vehicle_id: string;
    driver_id: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch vehicle and driver
      const vehicle = await tx.vehicle.findUnique({
        where: { id: data.vehicle_id },
      });
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      if (vehicle.status !== 'Available') {
        throw new Error(`Vehicle is not available (current status: ${vehicle.status})`);
      }

      const driver = await tx.driver.findUnique({
        where: { id: data.driver_id },
      });
      if (!driver) {
        throw new Error('Driver not found');
      }
      if (driver.status !== 'Available') {
        throw new Error(`Driver is not available (current status: ${driver.status})`);
      }
      if (!driver.noc_status) {
        throw new Error('Driver does not have a valid NOC');
      }

      // 2. Update statuses
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: 'On_Trip' },
      });

      await tx.driver.update({
        where: { id: driver.id },
        data: { status: 'On_Trip' },
      });

      // 3. Create trip
      const trip = await tx.trip.create({
        data: {
          source: data.source,
          destination: data.destination,
          status: 'Dispatched',
          cargo_weight: Number(data.cargo_weight),
          planned_distance: Number(data.planned_distance),
          vehicle_id: vehicle.id,
          driver_id: driver.id,
        },
      });

      return trip;
    });
  }

  public static async executeCompletionTransaction(tripId: string, finalOdometer: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch trip
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
      });
      if (!trip) {
        throw new Error('Trip not found');
      }
      if (trip.status !== 'Dispatched') {
        throw new Error(`Trip status is not Dispatched (current status: ${trip.status})`);
      }

      // 2. Odometer validation
      if (finalOdometer < trip.vehicle.odometer) {
        throw new Error(`Final odometer (${finalOdometer}) cannot be less than current vehicle odometer (${trip.vehicle.odometer})`);
      }

      // 3. Update vehicle
      await tx.vehicle.update({
        where: { id: trip.vehicle_id },
        data: {
          odometer: finalOdometer,
          status: 'Available',
        },
      });

      // 4. Update driver
      await tx.driver.update({
        where: { id: trip.driver_id },
        data: {
          status: 'Available',
        },
      });

      // 5. Complete trip
      const completedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'Completed',
          completed_at: new Date(),
        },
      });

      return completedTrip;
    });
  }
}

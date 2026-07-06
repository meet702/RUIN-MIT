package com.RuinMIT.repository;

import com.RuinMIT.entity.Ride;
import com.RuinMIT.entity.RideStatus;
import com.RuinMIT.entity.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;

@Repository
public interface RideRepository extends JpaRepository<Ride, UUID> {

    Page<Ride> findByStatus(RideStatus status, Pageable pageable);

    Page<Ride> findByStatusAndVehicleType(RideStatus status, VehicleType vehicleType, Pageable pageable);

    @Modifying
    @Query("""
            update Ride ride
            set ride.status = :completedStatus
            where ride.status in :activeStatuses
              and ride.departureTime <= :now
            """)
    int markDepartedRidesCompleted(
            Collection<RideStatus> activeStatuses,
            RideStatus completedStatus,
            LocalDateTime now);
}

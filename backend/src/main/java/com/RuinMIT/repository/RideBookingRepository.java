package com.RuinMIT.repository;

import com.RuinMIT.entity.Ride;
import com.RuinMIT.entity.RideBooking;
import com.RuinMIT.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideBookingRepository extends JpaRepository<RideBooking, UUID> {

    Optional<RideBooking> findByRideAndPassenger(Ride ride, User passenger);

    boolean existsByRideAndPassenger(Ride ride, User passenger);

    List<RideBooking> findByRide(Ride ride);
}

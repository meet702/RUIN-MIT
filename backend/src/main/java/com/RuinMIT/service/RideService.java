package com.RuinMIT.service;

import com.RuinMIT.dto.ride.*;
import com.RuinMIT.entity.*;
import com.RuinMIT.exception.BadRequestException;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.RideBookingRepository;
import com.RuinMIT.repository.RideRepository;
import com.RuinMIT.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final RideBookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public RideResponse createRide(RideCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ride ride = Ride.builder()
                .postedBy(user)
                .vehicleType(request.getVehicleType())
                .fromLocation(request.getFromLocation())
                .toLocation(request.getToLocation())
                .departureTime(request.getDepartureTime())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .farePerPerson(request.getFarePerPerson())
                .status(RideStatus.open)
                .notes(request.getNotes())
                .build();

        ride = rideRepository.save(ride);
        return mapToRideResponse(ride);
    }

    @Transactional(readOnly = true)
    public Page<RideResponse> getRides(RideStatus status, VehicleType vehicleType, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        RideStatus filterStatus = (status != null) ? status : RideStatus.open;

        Page<Ride> rides;
        if (vehicleType != null) {
            rides = rideRepository.findByStatusAndVehicleType(filterStatus, vehicleType, pageRequest);
        } else {
            rides = rideRepository.findByStatus(filterStatus, pageRequest);
        }

        return rides.map(this::mapToRideResponse);
    }

    @Transactional(readOnly = true)
    public RideDetailResponse getRideDetails(UUID rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        List<RideBooking> bookings = bookingRepository.findByRide(ride);

        List<RideDetailResponse.PassengerInfo> passengers = bookings.stream()
                .map(booking -> RideDetailResponse.PassengerInfo.builder()
                        .id(booking.getPassenger().getId())
                        .fullName(booking.getPassenger().getFullName())
                        .bookedAt(booking.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return RideDetailResponse.builder()
                .id(ride.getId())
                .vehicleType(ride.getVehicleType())
                .fromLocation(ride.getFromLocation())
                .toLocation(ride.getToLocation())
                .departureTime(ride.getDepartureTime())
                .totalSeats(ride.getTotalSeats())
                .availableSeats(ride.getAvailableSeats())
                .farePerPerson(ride.getFarePerPerson())
                .status(ride.getStatus())
                .notes(ride.getNotes())
                .poster(RideDetailResponse.PosterInfo.builder()
                        .id(ride.getPostedBy().getId())
                        .fullName(ride.getPostedBy().getFullName())
                        .build())
                .passengers(passengers)
                .createdAt(ride.getCreatedAt())
                .updatedAt(ride.getUpdatedAt())
                .build();
    }

    @Transactional
    public RideResponse updateRide(UUID rideId, RideCreateRequest request, String userEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the ride poster can edit this ride");
        }

        int bookedSeats = ride.getTotalSeats() - ride.getAvailableSeats();
        if (request.getTotalSeats() < bookedSeats) {
            throw new BadRequestException("Total seats cannot be less than existing bookings");
        }

        ride.setVehicleType(request.getVehicleType());
        ride.setFromLocation(request.getFromLocation());
        ride.setToLocation(request.getToLocation());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setTotalSeats(request.getTotalSeats());
        ride.setAvailableSeats(request.getTotalSeats() - bookedSeats);
        ride.setFarePerPerson(request.getFarePerPerson());
        ride.setNotes(request.getNotes());

        if (ride.getStatus() == RideStatus.open || ride.getStatus() == RideStatus.full) {
            ride.setStatus(ride.getAvailableSeats() == 0 ? RideStatus.full : RideStatus.open);
        }

        ride = rideRepository.save(ride);
        return mapToRideResponse(ride);
    }

    @Transactional
    public void bookRide(UUID rideId, String userEmail) {
        User passenger = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (ride.getPostedBy().getId().equals(passenger.getId())) {
            throw new BadRequestException("You cannot book your own ride");
        }

        if (ride.getStatus() != RideStatus.open) {
            throw new BadRequestException("Ride is not open for booking");
        }

        if (bookingRepository.existsByRideAndPassenger(ride, passenger)) {
            throw new BadRequestException("You have already booked this ride");
        }

        RideBooking booking = RideBooking.builder()
                .ride(ride)
                .passenger(passenger)
                .build();
        bookingRepository.save(booking);

        ride.setAvailableSeats(ride.getAvailableSeats() - 1);
        if (ride.getAvailableSeats() == 0) {
            ride.setStatus(RideStatus.full);
        }
        rideRepository.save(ride);

        String title = "New Booking";
        String message = passenger.getFullName() + " booked a seat on your ride to " + ride.getToLocation();
        notificationService.createNotification(
                ride.getPostedBy().getId(),
                title,
                message,
                "ride_booking",
                ride.getId());
        notificationService.sendEmailNotification(ride.getPostedBy().getEmail(), title, message);
    }

    @Transactional
    public void cancelBooking(UUID rideId, String userEmail) {
        User passenger = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        RideBooking booking = bookingRepository.findByRideAndPassenger(ride, passenger)
                .orElseThrow(() -> new BadRequestException("You do not have a booking for this ride"));

        bookingRepository.delete(booking);

        ride.setAvailableSeats(ride.getAvailableSeats() + 1);
        if (ride.getStatus() == RideStatus.full) {
            ride.setStatus(RideStatus.open);
        }
        rideRepository.save(ride);
    }

    @Transactional
    public void updateRideStatus(UUID rideId, RideStatusUpdateRequest request, String userEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the ride poster can update the status");
        }

        RideStatus currentStatus = ride.getStatus();
        RideStatus newStatus = request.getStatus();

        boolean validTransition =
                (currentStatus == RideStatus.open && newStatus == RideStatus.cancelled) ||
                (currentStatus == RideStatus.full && newStatus == RideStatus.cancelled) ||
                (currentStatus == RideStatus.open && newStatus == RideStatus.completed) ||
                (currentStatus == RideStatus.full && newStatus == RideStatus.completed);

        if (!validTransition) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        ride.setStatus(newStatus);
        rideRepository.save(ride);
    }

    @Transactional
    public void deleteRide(UUID rideId, String userEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the ride poster can delete this ride");
        }

        // Delete associated bookings first to avoid constraint violations
        List<RideBooking> bookings = bookingRepository.findByRide(ride);
        bookingRepository.deleteAll(bookings);

        rideRepository.delete(ride);
    }

    // --- Mapping helpers ---

    private RideResponse mapToRideResponse(Ride ride) {
        return RideResponse.builder()
                .id(ride.getId())
                .vehicleType(ride.getVehicleType())
                .fromLocation(ride.getFromLocation())
                .toLocation(ride.getToLocation())
                .departureTime(ride.getDepartureTime())
                .totalSeats(ride.getTotalSeats())
                .availableSeats(ride.getAvailableSeats())
                .farePerPerson(ride.getFarePerPerson())
                .status(ride.getStatus())
                .notes(ride.getNotes())
                .poster(RideResponse.PosterInfo.builder()
                        .id(ride.getPostedBy().getId())
                        .fullName(ride.getPostedBy().getFullName())
                        .build())
                .createdAt(ride.getCreatedAt())
                .updatedAt(ride.getUpdatedAt())
                .build();
    }
}

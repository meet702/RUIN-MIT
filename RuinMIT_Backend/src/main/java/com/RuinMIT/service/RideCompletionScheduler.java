package com.RuinMIT.service;

import com.RuinMIT.entity.RideStatus;
import com.RuinMIT.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RideCompletionScheduler {

    private final RideRepository rideRepository;

    @Scheduled(fixedDelayString = "60000", initialDelayString = "0")
    @Transactional
    public void completeDepartedRides() {
        int updatedCount = rideRepository.markDepartedRidesCompleted(
                List.of(RideStatus.open, RideStatus.full),
                RideStatus.completed,
                LocalDateTime.now());

        if (updatedCount > 0) {
            log.info("Auto-completed {} departed ride(s)", updatedCount);
        }
    }
}

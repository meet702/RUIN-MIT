package com.RuinMIT.service;

import com.RuinMIT.dto.gig.*;
import com.RuinMIT.entity.Gig;
import com.RuinMIT.entity.GigApplication;
import com.RuinMIT.entity.GigStatus;
import com.RuinMIT.entity.User;
import com.RuinMIT.exception.BadRequestException;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.GigApplicationRepository;
import com.RuinMIT.repository.GigRepository;
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
public class GigService {

    private final GigRepository gigRepository;
    private final GigApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public GigResponse createGig(GigCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Gig gig = Gig.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .budget(request.getBudget())
                .deadline(request.getDeadline())
                .postedBy(user)
                .status(GigStatus.open)
                .build();

        gig = gigRepository.save(gig);
        return mapToGigResponse(gig);
    }

    @Transactional(readOnly = true)
    public Page<GigResponse> getOpenGigs(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return gigRepository.findByStatusIn(List.of(GigStatus.open, GigStatus.in_progress), pageRequest)
                .map(this::mapToGigResponse);
    }

    @Transactional(readOnly = true)
    public GigDetailResponse getGigDetails(UUID gigId, String userEmail) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found"));

        GigDetailResponse response = mapToGigDetailResponse(gig);

        // If the requester is the poster, include applications
        if (userEmail != null && gig.getPostedBy().getEmail().equalsIgnoreCase(userEmail)) {
            List<GigApplicationResponse> apps = applicationRepository.findByGig(gig).stream()
                    .map(this::mapToApplicationResponse)
                    .collect(Collectors.toList());
            response.setApplications(apps);
            response.setHasApplied(false);
        } else if (userEmail != null) {
            userRepository.findByEmail(userEmail)
                    .ifPresent(user -> {
                        boolean applied = applicationRepository.existsByGigAndApplicant(gig, user);
                        response.setHasApplied(applied);
                        if (applied) {
                            applicationRepository.findByGigAndApplicant(gig, user)
                                    .ifPresent(app -> response.setApplicationAccepted(app.getIsAccepted()));
                        }
                    });
        }

        return response;
    }

    @Transactional
    public GigResponse updateGig(UUID gigId, GigCreateRequest request, String userEmail) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found"));

        if (!gig.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the gig poster can edit this gig");
        }

        gig.setTitle(request.getTitle());
        gig.setDescription(request.getDescription());
        gig.setBudget(request.getBudget());
        gig.setDeadline(request.getDeadline());

        gig = gigRepository.save(gig);
        return mapToGigResponse(gig);
    }

    @Transactional
    public void applyToGig(UUID gigId, GigApplyRequest request, String userEmail) {
        User applicant = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found"));

        if (!gig.getStatus().equals(GigStatus.open)) {
            throw new BadRequestException("Gig is no longer open");
        }

        if (gig.getPostedBy().getId().equals(applicant.getId())) {
            throw new BadRequestException("You cannot apply to your own gig");
        }

        if (applicationRepository.existsByGigAndApplicant(gig, applicant)) {
            throw new BadRequestException("You have already applied to this gig");
        }

        GigApplication application = GigApplication.builder()
                .gig(gig)
                .applicant(applicant)
                .message(request.getMessage())
                .isAccepted(false)
                .build();

        applicationRepository.save(application);

        String title = "New Application";
        String message = applicant.getFullName() + " applied to your gig: " + gig.getTitle();
        notificationService.createNotification(
                gig.getPostedBy().getId(),
                title,
                message,
                "gig_application",
                gig.getId());
        notificationService.sendEmailNotification(gig.getPostedBy().getEmail(), title, message);
    }

    @Transactional
    public void acceptApplicant(UUID gigId, UUID applicationId, String userEmail) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found"));

        if (!gig.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the gig poster can accept an applicant");
        }

        if (!gig.getStatus().equals(GigStatus.open)) {
            throw new BadRequestException("Gig must be open to accept an applicant");
        }

        GigApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getGig().getId().equals(gigId)) {
            throw new BadRequestException("Application does not belong to this gig");
        }

        application.setIsAccepted(true);
        applicationRepository.save(application);

        gig.setStatus(GigStatus.in_progress);
        gigRepository.save(gig);

        String title = "Application Accepted";
        String message = "Your application for " + gig.getTitle() + " was accepted!";
        notificationService.createNotification(
                application.getApplicant().getId(),
                title,
                message,
                "gig_accepted",
                gig.getId());
        notificationService.sendEmailNotification(application.getApplicant().getEmail(), title, message);
    }

    @Transactional
    public void unacceptApplicant(UUID gigId, UUID applicationId, String userEmail) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found"));

        if (!gig.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the gig poster can unaccept an applicant");
        }

        GigApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getGig().getId().equals(gigId)) {
            throw new BadRequestException("Application does not belong to this gig");
        }

        if (!application.getIsAccepted()) {
            throw new BadRequestException("Application is not currently accepted");
        }

        application.setIsAccepted(false);
        applicationRepository.save(application);

        gig.setStatus(GigStatus.open);
        gigRepository.save(gig);

        String title = "Application Revoked";
        String message = "Your acceptance for \"" + gig.getTitle() + "\" has been revoked by the poster.";
        notificationService.createNotification(
                application.getApplicant().getId(),
                title,
                message,
                "gig_unaccepted",
                gig.getId());
        notificationService.sendEmailNotification(application.getApplicant().getEmail(), title, message);
    }

    @Transactional
    public void updateGigStatus(UUID gigId, GigStatusUpdateRequest request, String userEmail) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found"));

        if (!gig.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the gig poster can update the status");
        }

        GigStatus newStatus = request.getStatus();
        GigStatus currentStatus = gig.getStatus();

        // Allowed transitions: open->cancelled, in_progress->completed
        if (currentStatus == GigStatus.open && newStatus == GigStatus.cancelled) {
            gig.setStatus(newStatus);
        } else if (currentStatus == GigStatus.in_progress && newStatus == GigStatus.completed) {
            gig.setStatus(newStatus);
        } else {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        gigRepository.save(gig);
    }

    @Transactional
    public void deleteGig(UUID gigId, String userEmail) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found"));

        if (!gig.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the gig poster can delete this gig");
        }

        // Delete associated applications first to avoid constraint violations
        List<GigApplication> applications = applicationRepository.findByGig(gig);
        applicationRepository.deleteAll(applications);

        gigRepository.delete(gig);
    }

    private GigResponse mapToGigResponse(Gig gig) {
        return GigResponse.builder()
                .id(gig.getId())
                .title(gig.getTitle())
                .description(gig.getDescription())
                .budget(gig.getBudget())
                .deadline(gig.getDeadline())
                .status(gig.getStatus())
                .posterId(gig.getPostedBy().getId())
                .posterFullName(gig.getPostedBy().getFullName())
                .createdAt(gig.getCreatedAt())
                .build();
    }

    private GigDetailResponse mapToGigDetailResponse(Gig gig) {
        return GigDetailResponse.builder()
                .id(gig.getId())
                .title(gig.getTitle())
                .description(gig.getDescription())
                .budget(gig.getBudget())
                .deadline(gig.getDeadline())
                .status(gig.getStatus())
                .posterId(gig.getPostedBy().getId())
                .posterFullName(gig.getPostedBy().getFullName())
                .createdAt(gig.getCreatedAt())
                .build();
    }

    private GigApplicationResponse mapToApplicationResponse(GigApplication application) {
        return GigApplicationResponse.builder()
                .id(application.getId())
                .applicantId(application.getApplicant().getId())
                .applicantFullName(application.getApplicant().getFullName())
                .message(application.getMessage())
                .isAccepted(application.getIsAccepted())
                .createdAt(application.getCreatedAt())
                .build();
    }
}

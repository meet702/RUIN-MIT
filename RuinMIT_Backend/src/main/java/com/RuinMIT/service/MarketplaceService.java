package com.RuinMIT.service;

import com.RuinMIT.dto.marketplace.*;
import com.RuinMIT.entity.*;
import com.RuinMIT.exception.BadRequestException;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.MarketplaceInquiryRepository;
import com.RuinMIT.repository.MarketplaceListingRepository;
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
public class MarketplaceService {

    private final MarketplaceListingRepository listingRepository;
    private final MarketplaceInquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public MarketplaceListingResponse createListing(MarketplaceListingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MarketplaceListing listing = MarketplaceListing.builder()
                .postedBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .condition(request.getCondition())
                .imageUrl(request.getImageUrl())
                .status(MarketplaceStatus.available)
                .build();

        listing = listingRepository.save(listing);
        return mapToListingResponse(listing);
    }

    public Page<MarketplaceListingResponse> getListings(
            MarketplaceCategory category,
            ItemCondition condition,
            MarketplaceStatus status,
            int page,
            int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        MarketplaceStatus filterStatus = (status != null) ? status : MarketplaceStatus.available;

        Page<MarketplaceListing> listings = listingRepository.findByFilters(filterStatus, category, condition, pageRequest);
        
        return listings.map(this::mapToListingResponse);
    }

    public MarketplaceListingDetailResponse getListingDetails(UUID listingId, String requesterEmail) {
        MarketplaceListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        MarketplaceListingDetailResponse response = mapToListingDetailResponse(listing);

        // Include inquiries only if the requester is the poster
        if (requesterEmail != null && listing.getPostedBy().getEmail().equals(requesterEmail)) {
            List<MarketplaceInquiry> inquiries = inquiryRepository.findByListing(listing);
            List<MarketplaceInquiryResponse> inquiryResponses = inquiries.stream()
                    .map(this::mapToInquiryResponse)
                    .collect(Collectors.toList());
            response.setInquiries(inquiryResponses);
            response.setHasInquired(false);
        } else if (requesterEmail != null) {
            userRepository.findByEmail(requesterEmail)
                    .ifPresent(user -> response.setHasInquired(inquiryRepository.existsByListingAndSender(listing, user)));
        }

        return response;
    }

    @Transactional
    public MarketplaceListingResponse updateListing(UUID listingId, MarketplaceListingRequest request, String userEmail) {
        MarketplaceListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the poster can edit this listing");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setCategory(request.getCategory());
        listing.setCondition(request.getCondition());
        listing.setImageUrl(request.getImageUrl());

        listing = listingRepository.save(listing);
        return mapToListingResponse(listing);
    }

    @Transactional
    public void sendInquiry(UUID listingId, MarketplaceInquiryRequest request, String userEmail) {
        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MarketplaceListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.getStatus() != MarketplaceStatus.available) {
            throw new BadRequestException("This listing is no longer available");
        }

        if (listing.getPostedBy().getId().equals(sender.getId())) {
            throw new BadRequestException("You cannot inquire on your own listing");
        }

        if (inquiryRepository.existsByListingAndSender(listing, sender)) {
            throw new BadRequestException("You have already sent an inquiry for this listing");
        }

        MarketplaceInquiry inquiry = MarketplaceInquiry.builder()
                .listing(listing)
                .sender(sender)
                .message(request.getMessage())
                .build();

        inquiryRepository.save(inquiry);

        String title = "New Inquiry";
        String message = sender.getFullName() + " is interested in your listing: " + listing.getTitle();
        notificationService.createNotification(
                listing.getPostedBy().getId(),
                title,
                message,
                "marketplace_inquiry",
                listing.getId());
        notificationService.sendEmailNotification(listing.getPostedBy().getEmail(), title, message);
    }

    @Transactional
    public void updateStatus(UUID listingId, MarketplaceStatusUpdateRequest request, String userEmail) {
        MarketplaceListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the poster can update the listing status");
        }

        MarketplaceStatus currentStatus = listing.getStatus();
        MarketplaceStatus newStatus = request.getStatus();

        if (currentStatus == MarketplaceStatus.available && newStatus == MarketplaceStatus.sold) {
            listing.setStatus(newStatus);
            listingRepository.save(listing);
        } else {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    @Transactional
    public void deleteListing(UUID listingId, String userEmail) {
        MarketplaceListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the poster can delete this listing");
        }

        listingRepository.delete(listing); // This will cascade and delete associated inquiries
    }

    // --- Mappers ---

    private MarketplaceListingResponse mapToListingResponse(MarketplaceListing listing) {
        return MarketplaceListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .category(listing.getCategory())
                .condition(listing.getCondition())
                .imageUrl(listing.getImageUrl())
                .status(listing.getStatus())
                .poster(MarketplaceListingResponse.PosterInfo.builder()
                        .id(listing.getPostedBy().getId())
                        .fullName(listing.getPostedBy().getFullName())
                        .build())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    private MarketplaceListingDetailResponse mapToListingDetailResponse(MarketplaceListing listing) {
        return MarketplaceListingDetailResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .category(listing.getCategory())
                .condition(listing.getCondition())
                .imageUrl(listing.getImageUrl())
                .status(listing.getStatus())
                .poster(MarketplaceListingResponse.PosterInfo.builder() // reuse PosterInfo structure
                        .id(listing.getPostedBy().getId())
                        .fullName(listing.getPostedBy().getFullName())
                        .build())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    private MarketplaceInquiryResponse mapToInquiryResponse(MarketplaceInquiry inquiry) {
        return MarketplaceInquiryResponse.builder()
                .id(inquiry.getId())
                .message(inquiry.getMessage())
                .sender(MarketplaceInquiryResponse.SenderInfo.builder()
                        .id(inquiry.getSender().getId())
                        .fullName(inquiry.getSender().getFullName())
                        .build())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}

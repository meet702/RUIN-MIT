package com.RuinMIT.service;

import com.RuinMIT.dto.flatmate.*;
import com.RuinMIT.entity.*;
import com.RuinMIT.exception.BadRequestException;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.FlatmateInquiryRepository;
import com.RuinMIT.repository.FlatmateListingRepository;
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
public class FlatmateService {

    private final FlatmateListingRepository listingRepository;
    private final FlatmateInquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ChatService chatService;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public FlatmateListingResponse createListing(FlatmateListingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FlatmateListing listing = FlatmateListing.builder()
                .postedBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .rentPerMonth(request.getRentPerMonth())
                .availableFrom(request.getAvailableFrom())
                .genderPreference(request.getGenderPreference())
                .amenities(request.getAmenities())
                .status(ListingStatus.open)
                .build();

        listing.setImageUrlList(request.getImageUrls());

        listing = listingRepository.save(listing);
        return mapToListingResponse(listing);
    }

    public Page<FlatmateListingResponse> getListings(ListingStatus status, GenderPreference genderPreference, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        ListingStatus filterStatus = (status != null) ? status : ListingStatus.open;

        Page<FlatmateListing> listings;
        if (genderPreference != null) {
            listings = listingRepository.findByStatusAndGenderPreference(filterStatus, genderPreference, pageRequest);
        } else {
            listings = listingRepository.findByStatus(filterStatus, pageRequest);
        }

        return listings.map(this::mapToListingResponse);
    }

    public FlatmateListingDetailResponse getListingDetails(UUID listingId, String requesterEmail) {
        FlatmateListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        FlatmateListingDetailResponse response = mapToListingDetailResponse(listing);

        // Include inquiries only if the requester is the poster
        if (requesterEmail != null && listing.getPostedBy().getEmail().equals(requesterEmail)) {
            List<FlatmateInquiry> inquiries = inquiryRepository.findByListingId(listing.getId());
            List<FlatmateInquiryResponse> inquiryResponses = inquiries.stream()
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
    public FlatmateListingResponse updateListing(UUID listingId, FlatmateListingRequest request, String userEmail) {
        FlatmateListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the poster can edit this listing");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setLocation(request.getLocation());
        listing.setRentPerMonth(request.getRentPerMonth());
        listing.setAvailableFrom(request.getAvailableFrom());
        listing.setGenderPreference(request.getGenderPreference());
        listing.setAmenities(request.getAmenities());
        listing.setImageUrlList(request.getImageUrls());

        listing = listingRepository.save(listing);
        return mapToListingResponse(listing);
    }

    @Transactional
    public void sendInquiry(UUID listingId, FlatmateInquiryRequest request, String userEmail) {
        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FlatmateListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.getStatus() != ListingStatus.open) {
            throw new BadRequestException("This listing is no longer open for inquiries");
        }

        if (listing.getPostedBy().getId().equals(sender.getId())) {
            throw new BadRequestException("You cannot inquire on your own listing");
        }

        if (inquiryRepository.existsByListingAndSender(listing, sender)) {
            throw new BadRequestException("You have already sent an inquiry for this listing");
        }

        FlatmateInquiry inquiry = FlatmateInquiry.builder()
                .listing(listing)
                .sender(sender)
                .message(request.getMessage())
                .build();

        inquiryRepository.save(inquiry);
        chatService.getOrCreateConversation(sender.getId(), listing.getPostedBy().getId(), "flatmate", listing.getId());

        String title = "New Inquiry";
        String message = sender.getFullName() + " inquired about your flatmate listing: " + listing.getTitle();
        notificationService.createNotification(
                listing.getPostedBy().getId(),
                title,
                message,
                "flatmate_inquiry",
                listing.getId());
        notificationService.sendEmailNotification(listing.getPostedBy().getEmail(), title, message);
    }

    @Transactional
    public void updateStatus(UUID listingId, FlatmateStatusUpdateRequest request, String userEmail) {
        FlatmateListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the poster can update the listing status");
        }

        ListingStatus currentStatus = listing.getStatus();
        ListingStatus newStatus = request.getStatus();

        if (currentStatus == ListingStatus.open && newStatus == ListingStatus.closed) {
            listing.setStatus(newStatus);
            listingRepository.save(listing);
        } else {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    @Transactional
    public void deleteListing(UUID listingId, String userEmail) {
        FlatmateListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the poster can delete this listing");
        }

        // Capture image URLs before deleting the entity
        List<String> imageUrls = listing.getImageUrlList();

        listingRepository.delete(listing); // Delete DB record first for fast response

        // Clean up Cloudinary images asynchronously in the background
        cloudinaryService.deleteMultipleByUrlsAsync(imageUrls);
    }

    @Transactional
    public FlatmateListingResponse removeImageFromListing(UUID listingId, String imageUrl, String userEmail) {
        FlatmateListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getPostedBy().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Only the poster can edit this listing");
        }

        List<String> currentUrls = listing.getImageUrlList();
        if (currentUrls != null && currentUrls.contains(imageUrl)) {
            // Delete from Cloudinary first
            cloudinaryService.deleteByUrl(imageUrl);
            
            // Remove from DB list
            List<String> newUrls = new java.util.ArrayList<>(currentUrls);
            newUrls.remove(imageUrl);
            listing.setImageUrlList(newUrls);
            listing = listingRepository.save(listing);
        }

        return mapToListingResponse(listing);
    }

    // --- Mappers ---

    private FlatmateListingResponse mapToListingResponse(FlatmateListing listing) {
        return FlatmateListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .location(listing.getLocation())
                .rentPerMonth(listing.getRentPerMonth())
                .availableFrom(listing.getAvailableFrom())
                .genderPreference(listing.getGenderPreference())
                .amenities(listing.getAmenities())
                .status(listing.getStatus())
                .imageUrls(listing.getImageUrlList())
                .poster(FlatmateListingResponse.PosterInfo.builder()
                        .id(listing.getPostedBy().getId())
                        .fullName(listing.getPostedBy().getFullName())
                        .build())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    private FlatmateListingDetailResponse mapToListingDetailResponse(FlatmateListing listing) {
        return FlatmateListingDetailResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .location(listing.getLocation())
                .rentPerMonth(listing.getRentPerMonth())
                .availableFrom(listing.getAvailableFrom())
                .genderPreference(listing.getGenderPreference())
                .amenities(listing.getAmenities())
                .status(listing.getStatus())
                .imageUrls(listing.getImageUrlList())
                .poster(FlatmateListingResponse.PosterInfo.builder()
                        .id(listing.getPostedBy().getId())
                        .fullName(listing.getPostedBy().getFullName())
                        .build())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    private FlatmateInquiryResponse mapToInquiryResponse(FlatmateInquiry inquiry) {
        return FlatmateInquiryResponse.builder()
                .id(inquiry.getId())
                .message(inquiry.getMessage())
                .sender(FlatmateInquiryResponse.SenderInfo.builder()
                        .id(inquiry.getSender().getId())
                        .fullName(inquiry.getSender().getFullName())
                        .build())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}

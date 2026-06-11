package com.RuinMIT.service;

import com.RuinMIT.dto.lostfound.LostAndFoundRequest;
import com.RuinMIT.dto.lostfound.LostAndFoundResponse;
import com.RuinMIT.entity.*;
import com.RuinMIT.exception.BadRequestException;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.LostAndFoundRepository;
import com.RuinMIT.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostAndFoundService {

    private final LostAndFoundRepository lostAndFoundRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public LostAndFoundResponse createPost(LostAndFoundRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LostAndFound post = LostAndFound.builder()
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .locationFoundLost(request.getLocationFoundLost())
                .postedBy(user)
                .status(LostFoundStatus.open)
                .images(new ArrayList<>())
                .build();

        post.setImageUrlList(request.getImageUrls());

        post = lostAndFoundRepository.save(post);
        return mapToResponse(post);
    }

    @Transactional(readOnly = true)
    public Page<LostAndFoundResponse> getAllPosts(LostFoundType type, LostFoundStatus status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return lostAndFoundRepository.findByTypeAndStatus(type, status, pageRequest)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public LostAndFoundResponse getPostById(UUID id) {
        LostAndFound post = lostAndFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        return mapToResponse(post);
    }

    @Transactional
    public LostAndFoundResponse updatePost(UUID id, LostAndFoundRequest request, String userEmail) {
        LostAndFound post = lostAndFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!post.getPostedBy().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("Only the poster can edit this post");
        }

        post.setType(request.getType());
        post.setTitle(request.getTitle());
        post.setDescription(request.getDescription());
        post.setLocationFoundLost(request.getLocationFoundLost());
        post.setImageUrlList(request.getImageUrls());

        post = lostAndFoundRepository.save(post);
        return mapToResponse(post);
    }

    @Transactional
    @SuppressWarnings("PMD.PreserveStackTrace")
    public LostAndFoundResponse updateStatus(UUID id, LostFoundStatus newStatus, String userEmail) {
        LostAndFound post = lostAndFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!post.getPostedBy().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("Only the poster can update the status");
        }

        if (post.getStatus() != LostFoundStatus.open || newStatus != LostFoundStatus.resolved) {
            throw new BadRequestException("Only transition from open to resolved is allowed");
        }

        post.setStatus(newStatus);
        post = lostAndFoundRepository.save(post);
        return mapToResponse(post);
    }

    @Transactional
    public void deletePost(UUID id, String userEmail) {
        LostAndFound post = lostAndFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!post.getPostedBy().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("Only the poster can delete this post");
        }

        // Delete images from Cloudinary BEFORE deleting from DB
        cloudinaryService.deleteMultipleByUrls(post.getImageUrlList());

        lostAndFoundRepository.delete(post);
    }

    @Transactional
    public LostAndFoundResponse removeImageFromPost(UUID postId, String imageUrl, String userEmail) {
        LostAndFound post = lostAndFoundRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        if (!post.getPostedBy().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedException("Only the poster can edit this post");
        }

        List<String> currentUrls = post.getImageUrlList();
        if (currentUrls != null && currentUrls.contains(imageUrl)) {
            // Delete from Cloudinary first
            cloudinaryService.deleteByUrl(imageUrl);
            
            // Remove from DB list
            List<String> newUrls = new java.util.ArrayList<>(currentUrls);
            newUrls.remove(imageUrl);
            post.setImageUrlList(newUrls);
            post = lostAndFoundRepository.save(post);
        }

        return mapToResponse(post);
    }

    private LostAndFoundResponse mapToResponse(LostAndFound post) {
        return LostAndFoundResponse.builder()
                .id(post.getId())
                .type(post.getType())
                .title(post.getTitle())
                .description(post.getDescription())
                .locationFoundLost(post.getLocationFoundLost())
                .status(post.getStatus())
                .poster(LostAndFoundResponse.PosterInfo.builder()
                        .id(post.getPostedBy().getId())
                        .fullName(post.getPostedBy().getFullName())
                        .build())
                .imageUrls(post.getImageUrlList())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}

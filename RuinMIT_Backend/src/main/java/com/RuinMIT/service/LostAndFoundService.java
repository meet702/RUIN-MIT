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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostAndFoundService {

    private final LostAndFoundRepository lostAndFoundRepository;
    private final UserRepository userRepository;

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

        if (request.getImageUrls() != null) {
            for (String imageUrl : request.getImageUrls()) {
                LostFoundImage image = LostFoundImage.builder()
                        .imageUrl(imageUrl)
                        .lostAndFound(post)
                        .build();
                post.getImages().add(image);
            }
        }

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
        post.getImages().clear();

        if (request.getImageUrls() != null) {
            for (String imageUrl : request.getImageUrls()) {
                LostFoundImage image = LostFoundImage.builder()
                        .imageUrl(imageUrl)
                        .build();
                post.addImage(image);
            }
        }

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

        lostAndFoundRepository.delete(post);
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
                .imageUrls(post.getImages().stream()
                        .map(LostFoundImage::getImageUrl)
                        .collect(Collectors.toList()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}

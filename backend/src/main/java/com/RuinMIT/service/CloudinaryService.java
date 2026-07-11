package com.RuinMIT.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.RuinMIT.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Uploads an image file to Cloudinary and returns the secure URL.
     */
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed (JPEG, PNG, WebP, GIF)");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "ruinmit",
                            "resource_type", "image"
                    ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Deletes an image from Cloudinary by its public ID.
     */
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new BadRequestException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Extracts the public ID from a Cloudinary URL.
     */
    public String extractPublicId(String cloudinaryUrl) {
        try {
            String path = URI.create(cloudinaryUrl).getPath();
            String[] parts = path.split("/upload/", 2);
            if (parts.length < 2) return null;

            String[] segments = parts[1].split("/");
            int publicIdStart = findPublicIdStart(segments);
            if (publicIdStart >= segments.length) return null;

            String publicIdWithExtension = String.join("/", java.util.Arrays.copyOfRange(segments, publicIdStart, segments.length));
            int dotIndex = publicIdWithExtension.lastIndexOf('.');
            String publicId = dotIndex > 0 ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;
            return URLDecoder.decode(publicId, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }

    private int findPublicIdStart(String[] segments) {
        for (int i = 0; i < segments.length; i++) {
            if (segments[i].matches("v\\d+")) {
                return i + 1;
            }
        }

        int index = 0;
        while (index < segments.length && isTransformationSegment(segments[index])) {
            index++;
        }
        return index;
    }

    private boolean isTransformationSegment(String segment) {
        return segment.contains(",") || segment.matches("(?i)(a|ar|b|bo|c|co|d|dl|e|eo|f|fl|fn|g|h|ki|l|o|p|pg|q|r|so|t|u|w|x|y|z)_.+");
    }

    /**
     * Deletes a file from Cloudinary using its full URL.
     */
    public void deleteByUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) return;
        String publicId = extractPublicId(cloudinaryUrl);
        if (publicId != null) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (Exception e) {
                // Log error but don't throw - DB deletion should still proceed
                System.err.println("Failed to delete Cloudinary image: " + cloudinaryUrl + " - " + e.getMessage());
            }
        }
    }

    /**
     * Deletes multiple files from Cloudinary using their URLs (synchronous).
     */
    public void deleteMultipleByUrls(java.util.List<String> urls) {
        if (urls == null || urls.isEmpty()) return;
        urls.stream()
                .filter(url -> url != null && !url.isBlank())
                .distinct()
                .forEach(this::deleteByUrl);
    }

    /**
     * Deletes multiple files from Cloudinary using their URLs (asynchronous).
     * Runs in a background thread so the calling method returns immediately.
     */
    @org.springframework.scheduling.annotation.Async
    public void deleteMultipleByUrlsAsync(java.util.List<String> urls) {
        if (urls == null || urls.isEmpty()) return;
        deleteMultipleByUrls(urls);
    }

    @org.springframework.scheduling.annotation.Async
    public void deleteRemovedUrlsAsync(List<String> oldUrls, List<String> newUrls) {
        if (oldUrls == null || oldUrls.isEmpty()) return;

        Set<String> retainedUrls = newUrls == null
                ? Set.of()
                : newUrls.stream()
                .filter(url -> url != null && !url.isBlank())
                .collect(Collectors.toCollection(HashSet::new));

        List<String> removedUrls = oldUrls.stream()
                .filter(url -> url != null && !url.isBlank())
                .filter(url -> !retainedUrls.contains(url))
                .distinct()
                .toList();

        deleteMultipleByUrls(removedUrls);
    }
}

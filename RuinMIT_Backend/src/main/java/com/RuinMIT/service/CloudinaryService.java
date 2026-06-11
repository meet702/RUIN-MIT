package com.RuinMIT.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.RuinMIT.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

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
            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length < 2) return null;
            String afterUpload = parts[1]; // e.g. "v1234567/ruinmit/filename.jpg"
            String withoutVersion = afterUpload.replaceFirst("v[0-9]+/", "");
            // Remove file extension
            int dotIndex = withoutVersion.lastIndexOf('.');
            return dotIndex > 0 ? withoutVersion.substring(0, dotIndex) : withoutVersion;
        } catch (Exception e) {
            return null;
        }
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
     * Deletes multiple files from Cloudinary using their URLs.
     */
    public void deleteMultipleByUrls(java.util.List<String> urls) {
        if (urls == null || urls.isEmpty()) return;
        urls.forEach(this::deleteByUrl);
    }
}

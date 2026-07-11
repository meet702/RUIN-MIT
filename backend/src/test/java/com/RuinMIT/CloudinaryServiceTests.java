package com.RuinMIT;

import com.RuinMIT.service.CloudinaryService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CloudinaryServiceTests {

    private final CloudinaryService cloudinaryService = new CloudinaryService(null);

    @Test
    void extractPublicIdFromUploadedUrl() {
        String url = "https://res.cloudinary.com/demo/image/upload/v1712345678/ruinmit/photo.jpg";

        assertEquals("ruinmit/photo", cloudinaryService.extractPublicId(url));
    }

    @Test
    void extractPublicIdFromTransformedUrl() {
        String url = "https://res.cloudinary.com/demo/image/upload/c_fill,w_500,h_500/q_auto/v1712345678/ruinmit/photo.webp";

        assertEquals("ruinmit/photo", cloudinaryService.extractPublicId(url));
    }

    @Test
    void extractPublicIdFromUrlWithoutVersion() {
        String url = "https://res.cloudinary.com/demo/image/upload/ruinmit/photo.png";

        assertEquals("ruinmit/photo", cloudinaryService.extractPublicId(url));
    }
}

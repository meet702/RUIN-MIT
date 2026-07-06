package com.RuinMIT.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "flatmate_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlatmateListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(name = "rent_per_month", precision = 10, scale = 2, nullable = false)
    private BigDecimal rentPerMonth;

    @Column(name = "available_from", nullable = false)
    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_preference", nullable = false)
    private GenderPreference genderPreference;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ListingStatus status = ListingStatus.open;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlatmateInquiry> inquiries;

    // Helper methods for comma-separated image URLs
    public List<String> getImageUrlList() {
        if (imageUrls == null || imageUrls.isBlank()) return List.of();
        return Arrays.asList(imageUrls.split(","));
    }

    public void setImageUrlList(List<String> urls) {
        this.imageUrls = (urls == null || urls.isEmpty()) ? null : String.join(",", urls);
    }
}

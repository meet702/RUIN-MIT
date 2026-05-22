package com.RuinMIT.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lost_and_found")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostAndFound {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LostFoundType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "location_found_lost")
    private String locationFoundLost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LostFoundStatus status = LostFoundStatus.open;

    @OneToMany(mappedBy = "lostAndFound", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LostFoundImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addImage(LostFoundImage image) {
        images.add(image);
        image.setLostAndFound(this);
    }
}

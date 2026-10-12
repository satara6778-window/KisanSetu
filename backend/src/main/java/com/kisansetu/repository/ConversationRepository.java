package com.kisansetu.repository;

import com.kisansetu.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.buyer.id = :userId OR c.farmer.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findUserConversations(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.buyer.id = :buyerId AND c.farmer.id = :farmerId AND " +
           "((:listingId IS NULL AND c.listing IS NULL) OR c.listing.id = :listingId)")
    Optional<Conversation> findExistingConversation(
            @Param("buyerId") Long buyerId,
            @Param("farmerId") Long farmerId,
            @Param("listingId") Long listingId
    );
}

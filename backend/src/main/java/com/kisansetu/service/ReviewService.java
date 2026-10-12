package com.kisansetu.service;

import com.kisansetu.dto.ReviewCreateRequest;
import com.kisansetu.dto.ReviewResponse;
import com.kisansetu.entity.Order;
import com.kisansetu.entity.OrderStatus;
import com.kisansetu.entity.Review;
import com.kisansetu.entity.User;
import com.kisansetu.exception.ResourceNotFoundException;
import com.kisansetu.exception.UnauthorizedOperationException;
import com.kisansetu.repository.OrderRepository;
import com.kisansetu.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final AuditService auditService;

    public ReviewService(ReviewRepository reviewRepository, OrderRepository orderRepository, AuditService auditService) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ReviewResponse createReview(User reviewer, ReviewCreateRequest request) {
        Order order = orderRepository.findById(request.orderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.orderId()));

        if (!order.getBuyer().getId().equals(reviewer.getId())) {
            throw new UnauthorizedOperationException("Only the buyer who placed this order can write a review.");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Reviews can only be submitted after the order is COMPLETED (current status: " + order.getStatus() + ").");
        }

        if (reviewRepository.existsByOrderId(order.getId())) {
            throw new IllegalStateException("A review has already been submitted for this order.");
        }

        Review review = new Review(order, reviewer, order.getFarmer(), request.rating(), request.comment());
        review = reviewRepository.save(review);

        auditService.log("REVIEW_SUBMITTED", reviewer.getPhone(), "Review", review.getId().toString(),
                "Rating: " + request.rating() + "/5 for farmer " + order.getFarmer().getFullName());

        return ReviewResponse.fromEntity(review);
    }

    public List<ReviewResponse> getFarmerReviews(Long farmerId) {
        return reviewRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
            .stream().map(ReviewResponse::fromEntity).toList();
    }
}

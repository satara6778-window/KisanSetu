package com.kisansetu.service;

import com.kisansetu.dto.ComplaintCreateRequest;
import com.kisansetu.dto.ComplaintResolveRequest;
import com.kisansetu.dto.ComplaintResponse;
import com.kisansetu.entity.Complaint;
import com.kisansetu.entity.Order;
import com.kisansetu.entity.Role;
import com.kisansetu.entity.User;
import com.kisansetu.exception.ResourceNotFoundException;
import com.kisansetu.exception.UnauthorizedOperationException;
import com.kisansetu.repository.ComplaintRepository;
import com.kisansetu.repository.OrderRepository;
import com.kisansetu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final AuditService auditService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            OrderRepository orderRepository,
                            AuditService auditService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ComplaintResponse createComplaint(User complainant, ComplaintCreateRequest request) {
        User targetUser = userRepository.findById(request.targetUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Target user not found with ID: " + request.targetUserId()));

        Order order = request.orderId() != null ? orderRepository.findById(request.orderId()).orElse(null) : null;

        Complaint complaint = new Complaint(complainant, targetUser, order, request.reason());
        complaint = complaintRepository.save(complaint);

        auditService.log("COMPLAINT_FILED", complainant.getPhone(), "Complaint", complaint.getId().toString(),
                "Filed complaint against " + targetUser.getPhone());

        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional
    public ComplaintResponse resolveComplaint(User admin, Long complaintId, ComplaintResolveRequest request) {
        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedOperationException("Only administrators can resolve complaints.");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        complaint.setStatus(request.status());
        complaint.setResolutionNotes(request.resolutionNotes());
        complaint = complaintRepository.save(complaint);

        auditService.log("COMPLAINT_RESOLVED", admin.getPhone(), "Complaint", complaint.getId().toString(),
                "Resolved to " + request.status() + ": " + request.resolutionNotes());

        return ComplaintResponse.fromEntity(complaint);
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll()
            .stream().map(ComplaintResponse::fromEntity).toList();
    }

    public List<ComplaintResponse> getUserComplaints(Long userId) {
        return complaintRepository.findByComplainantIdOrderByCreatedAtDesc(userId)
            .stream().map(ComplaintResponse::fromEntity).toList();
    }
}

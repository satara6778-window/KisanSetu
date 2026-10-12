package com.kisansetu.repository;

import com.kisansetu.entity.Complaint;
import com.kisansetu.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findByComplainantIdOrderByCreatedAtDesc(Long complainantId);

    List<Complaint> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);
}

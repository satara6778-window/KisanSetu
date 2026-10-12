package com.kisansetu.service;

import com.kisansetu.entity.AuditLog;
import com.kisansetu.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String actor, String entity, String entityId, String details) {
        AuditLog log = new AuditLog(action, actor != null ? actor : "SYSTEM", entity, entityId, details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}

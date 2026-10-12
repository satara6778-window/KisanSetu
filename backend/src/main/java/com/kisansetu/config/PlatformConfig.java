package com.kisansetu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PlatformConfig {

    private BigDecimal platformFeePercentage;

    public PlatformConfig(@Value("${platform.fee.percentage:0.0}") double fee) {
        this.platformFeePercentage = BigDecimal.valueOf(fee);
    }

    public BigDecimal getPlatformFeePercentage() {
        return platformFeePercentage;
    }

    public void setPlatformFeePercentage(BigDecimal platformFeePercentage) {
        this.platformFeePercentage = platformFeePercentage;
    }

    public BigDecimal calculateFee(BigDecimal amount) {
        if (platformFeePercentage == null || platformFeePercentage.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(platformFeePercentage).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
    }
}

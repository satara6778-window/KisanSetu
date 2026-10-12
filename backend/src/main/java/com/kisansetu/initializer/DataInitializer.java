package com.kisansetu.initializer;

import com.kisansetu.entity.*;
import com.kisansetu.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final CropListingRepository cropListingRepository;
    private final MarketPriceRecordRepository marketPriceRecordRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           FarmerProfileRepository farmerProfileRepository,
                           CropListingRepository cropListingRepository,
                           MarketPriceRecordRepository marketPriceRecordRepository,
                           OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           ReviewRepository reviewRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.cropListingRepository = cropListingRepository;
        this.marketPriceRecordRepository = marketPriceRecordRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        System.out.println("🌱 Initializing KisanSetu verified marketplace seed data...");

        // 1. Seed Users
        User farmer1 = new User("9876543210", passwordEncoder.encode("password123"), "Ramesh Patil", Role.FARMER, "Manchar", "Pune", "Maharashtra", "mr");
        User farmer2 = new User("9876543211", passwordEncoder.encode("password123"), "Suresh Shinde", Role.FARMER, "Lasalgaon", "Nashik", "Maharashtra", "mr");
        User consumer = new User("9876543220", passwordEncoder.encode("password123"), "Pooja Deshmukh", Role.CONSUMER, "Kothrud", "Pune", "Maharashtra", "en");
        User wholesaler = new User("9876543230", passwordEncoder.encode("password123"), "Apex Fresh Produce Ltd", Role.WHOLESALER, "Vashi APMC", "Navi Mumbai", "Maharashtra", "en");
        User admin = new User("9999999999", passwordEncoder.encode("admin123"), "Platform Support", Role.ADMIN, "Shivajinagar", "Pune", "Maharashtra", "en");

        userRepository.save(farmer1);
        userRepository.save(farmer2);
        userRepository.save(consumer);
        userRepository.save(wholesaler);
        userRepository.save(admin);

        farmerProfileRepository.save(new FarmerProfile(farmer1, 8.5, "Tomato, Onion, Chilli", 14, "ramesh@oksbi", true));
        farmerProfileRepository.save(new FarmerProfile(farmer2, 15.0, "Onion, Pomegranate, Wheat", 20, "suresh@okaxis", false));

        // 2. Seed Verified Mandi Market Prices (Agmarknet / APMC records)
        marketPriceRecordRepository.save(new MarketPriceRecord("Tomato", "टोमॅटो", "Pune APMC", "Pune", "Maharashtra",
                BigDecimal.valueOf(2200), BigDecimal.valueOf(2800), BigDecimal.valueOf(2500), "Quintal", LocalDate.now().minusDays(1), "Maharashtra MSAMB / Agmarknet", "APMC-PUN-01"));

        marketPriceRecordRepository.save(new MarketPriceRecord("Onion", "कांदा", "Lasalgaon APMC", "Nashik", "Maharashtra",
                BigDecimal.valueOf(1500), BigDecimal.valueOf(2200), BigDecimal.valueOf(1850), "Quintal", LocalDate.now().minusDays(1), "Lasalgaon Market Committee", "APMC-NAS-02"));

        marketPriceRecordRepository.save(new MarketPriceRecord("Wheat", "गहू", "Nagpur APMC", "Nagpur", "Maharashtra",
                BigDecimal.valueOf(2100), BigDecimal.valueOf(2450), BigDecimal.valueOf(2275), "Quintal", LocalDate.now().minusDays(2), "Agmarknet Central Portal", "APMC-NAG-03"));

        marketPriceRecordRepository.save(new MarketPriceRecord("Sugarcane", "ऊस", "Kolhapur Mandi", "Kolhapur", "Maharashtra",
                BigDecimal.valueOf(3000), BigDecimal.valueOf(3300), BigDecimal.valueOf(3150), "Tonne", LocalDate.now().minusDays(3), "Kolhapur APMC Board", "APMC-KOL-04"));

        marketPriceRecordRepository.save(new MarketPriceRecord("Pomegranate", "डाळिंब", "Solapur APMC", "Solapur", "Maharashtra",
                BigDecimal.valueOf(6000), BigDecimal.valueOf(9500), BigDecimal.valueOf(8200), "Quintal", LocalDate.now().minusDays(2), "Solapur Mandi Register", "APMC-SOL-05"));

        marketPriceRecordRepository.save(new MarketPriceRecord("Green Chilli", "मिरची", "Pune APMC", "Pune", "Maharashtra",
                BigDecimal.valueOf(3800), BigDecimal.valueOf(4800), BigDecimal.valueOf(4300), "Quintal", LocalDate.now().minusDays(1), "Pune APMC Sub-Yard", "APMC-PUN-06"));

        // 3. Seed Crop Listings
        CropListing c1 = new CropListing();
        c1.setFarmer(farmer1);
        c1.setCropName("Farm-Fresh Tomatoes");
        c1.setMarathiAlias("टोमॅटो");
        c1.setHindiAlias("टमाटर");
        c1.setCategory("Vegetables");
        c1.setDescription("Juicy, naturally ripened Grade A tomatoes picked fresh daily from Manchar farm.");
        c1.setImageUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80");
        c1.setAvailableQuantity(BigDecimal.valueOf(850.0));
        c1.setUnit("kg");
        c1.setPricePerUnit(BigDecimal.valueOf(26.00));
        c1.setQualityGrade("Grade A");
        c1.setVillage("Manchar");
        c1.setDistrict("Pune");
        c1.setState("Maharashtra");
        c1.setPickupAvailable(true);
        c1.setDeliveryAvailable(true);
        c1.setStatus(ListingStatus.ACTIVE);
        cropListingRepository.save(c1);

        CropListing c2 = new CropListing();
        c2.setFarmer(farmer2);
        c2.setCropName("Nashik Red Onion");
        c2.setMarathiAlias("कांदा");
        c2.setHindiAlias("प्याज");
        c2.setCategory("Vegetables");
        c2.setDescription("Medium-to-large cured Lasalgaon red onions with thick skin and excellent shelf life.");
        c2.setImageUrl("https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80");
        c2.setAvailableQuantity(BigDecimal.valueOf(1800.0));
        c2.setUnit("kg");
        c2.setPricePerUnit(BigDecimal.valueOf(21.50));
        c2.setQualityGrade("Grade A");
        c2.setVillage("Lasalgaon");
        c2.setDistrict("Nashik");
        c2.setState("Maharashtra");
        c2.setPickupAvailable(true);
        c2.setDeliveryAvailable(true);
        c2.setStatus(ListingStatus.ACTIVE);
        cropListingRepository.save(c2);

        CropListing c3 = new CropListing();
        c3.setFarmer(farmer2);
        c3.setCropName("Bhagwa Pomegranates");
        c3.setMarathiAlias("डाळिंब");
        c3.setHindiAlias("अनार");
        c3.setCategory("Fruits");
        c3.setDescription("Deep red arils, sweet and juicy, grown with drip fertigation in well-drained soil.");
        c3.setImageUrl("https://images.unsplash.com/photo-1541344999736-83eca872f241?w=800&auto=format&fit=crop&q=80");
        c3.setAvailableQuantity(BigDecimal.valueOf(450.0));
        c3.setUnit("kg");
        c3.setPricePerUnit(BigDecimal.valueOf(88.00));
        c3.setQualityGrade("Export Quality");
        c3.setVillage("Lasalgaon");
        c3.setDistrict("Nashik");
        c3.setState("Maharashtra");
        c3.setPickupAvailable(true);
        c3.setDeliveryAvailable(false);
        c3.setStatus(ListingStatus.ACTIVE);
        cropListingRepository.save(c3);

        CropListing c4 = new CropListing();
        c4.setFarmer(farmer1);
        c4.setCropName("Organic Green Chillies");
        c4.setMarathiAlias("मिरची");
        c4.setHindiAlias("हरी मिर्च");
        c4.setCategory("Spices");
        c4.setDescription("Spicy, aromatic G4 green chillies grown without synthetic chemicals.");
        c4.setImageUrl("https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80");
        c4.setAvailableQuantity(BigDecimal.valueOf(120.0));
        c4.setUnit("kg");
        c4.setPricePerUnit(BigDecimal.valueOf(44.00));
        c4.setQualityGrade("Organic");
        c4.setVillage("Manchar");
        c4.setDistrict("Pune");
        c4.setState("Maharashtra");
        c4.setPickupAvailable(true);
        c4.setDeliveryAvailable(true);
        c4.setStatus(ListingStatus.ACTIVE);
        cropListingRepository.save(c4);

        // 4. Seed a Completed Sample Order & Review
        Order o1 = new Order();
        o1.setOrderNumber("KS-1002931");
        o1.setBuyer(consumer);
        o1.setFarmer(farmer1);
        o1.setDeliveryType(DeliveryType.PICKUP);
        o1.setDeliveryAddress("Manchar Collection Point");
        o1.setStatus(OrderStatus.COMPLETED);
        o1.setSubtotal(BigDecimal.valueOf(520.00));
        o1.setPlatformFee(BigDecimal.ZERO);
        o1.setTotalAmount(BigDecimal.valueOf(520.00));
        o1.setPaymentMethod(PaymentMethod.PAY_ON_PICKUP);
        o1.setPaymentStatus(PaymentStatus.COMPLETED);
        o1.setIdempotencyKey("SEED-ORD-01");
        o1.setNotes("First trial pickup order");
        orderRepository.save(o1);

        OrderItem oi1 = new OrderItem(o1, c1, c1.getCropName(), BigDecimal.valueOf(20.0), "kg", BigDecimal.valueOf(26.00), BigDecimal.valueOf(520.00));
        orderItemRepository.save(oi1);

        reviewRepository.save(new Review(o1, consumer, farmer1, 5, "Outstanding sweetness and crisp freshness! Directly collected at the farm gate. Highly recommended."));

        System.out.println("✅ KisanSetu seed data initialized successfully!");
    }
}

package com.kisansetu;

import com.kisansetu.dto.*;
import com.kisansetu.entity.*;
import com.kisansetu.exception.IllegalOrderStateTransitionException;
import com.kisansetu.exception.InsufficientStockException;
import com.kisansetu.repository.CropListingRepository;
import com.kisansetu.repository.OrderRepository;
import com.kisansetu.repository.UserRepository;
import com.kisansetu.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;


import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
@ActiveProfiles("h2")
public class KisanSetuApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private CropListingService cropListingService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OfferService offerService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private MarketPriceService marketPriceService;

    @Autowired
    private AiAdvisoryService aiAdvisoryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CropListingRepository cropListingRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User testFarmer;
    private User testBuyer;

    @BeforeEach
    void setup() {
        testFarmer = userRepository.findByPhone("9876543210").orElseGet(() -> {
            var res = authService.register(new RegisterRequest("9876543210", "password123", "Test Farmer", Role.FARMER, "Manchar", "Pune", "Maharashtra", "mr"));
            return userRepository.findById(res.user().id()).orElseThrow();
        });

        testBuyer = userRepository.findByPhone("9876543220").orElseGet(() -> {
            var res = authService.register(new RegisterRequest("9876543220", "password123", "Test Buyer", Role.CONSUMER, "Kothrud", "Pune", "Maharashtra", "en"));
            return userRepository.findById(res.user().id()).orElseThrow();
        });
    }

    @Test
    @DisplayName("Context loads and verified APMC mandi prices exist")
    void testMandiPricesSeeded() {
        var prices = marketPriceService.getLatestPrices();
        assertFalse(prices.isEmpty(), "Mandi prices must be seeded from verified sources");

        var tomato = prices.stream().filter(p -> p.cropName().equalsIgnoreCase("Tomato")).findFirst();
        assertTrue(tomato.isPresent());
        assertEquals(0, BigDecimal.valueOf(2500).compareTo(tomato.get().modalPrice()));
        assertEquals("Quintal", tomato.get().unit());
        assertNotNull(tomato.get().observationDate());
        assertNotNull(tomato.get().sourceName());
    }

    @Test
    @DisplayName("Atomic stock reduction and overselling prevention")
    @Transactional
    void testAtomicStockProtection() {
        // Create listing with 10 kg
        ListingCreateRequest req = new ListingCreateRequest(
            "Trial Strawberries", "स्ट्रॉबेरी", "स्ट्रॉबेरी", "Fruits", "Mahabaleshwar sweet strawberries",
            "https://example.com/strawberry.jpg", BigDecimal.valueOf(10.0), "kg", BigDecimal.valueOf(120.0),
            "Grade A", "Mahabaleshwar", "Satara", "Maharashtra", true, true
        );
        ListingResponse listing = cropListingService.createListing(testFarmer, req);

        // Buyer 1 orders 7 kg -> should succeed, leaving 3 kg
        OrderCreateRequest order1Req = new OrderCreateRequest(
            listing.id(), BigDecimal.valueOf(7.0), DeliveryType.PICKUP, "Farmgate", PaymentMethod.PAY_ON_PICKUP, "First pickup", "IDEMP-101"
        );
        OrderResponse order1 = orderService.createOrder(testBuyer, order1Req);
        assertNotNull(order1);
        assertEquals(OrderStatus.PLACED, order1.status());

        // Buyer 2 tries to order 5 kg when only 3 kg left -> must throw InsufficientStockException!
        OrderCreateRequest order2Req = new OrderCreateRequest(
            listing.id(), BigDecimal.valueOf(5.0), DeliveryType.PICKUP, "Farmgate", PaymentMethod.PAY_ON_PICKUP, "Second pickup", "IDEMP-102"
        );
        assertThrows(InsufficientStockException.class, () -> orderService.createOrder(testBuyer, order2Req));
    }

    @Test
    @DisplayName("Idempotent order creation prevents double-orders")
    @Transactional
    void testIdempotentOrderCreation() {
        ListingCreateRequest req = new ListingCreateRequest(
            "Organic Carrots", "गाजर", "गाजर", "Vegetables", "Crunchy orange carrots",
            null, BigDecimal.valueOf(50.0), "kg", BigDecimal.valueOf(35.0),
            "Grade A", "Manchar", "Pune", "Maharashtra", true, false
        );
        ListingResponse listing = cropListingService.createListing(testFarmer, req);

        OrderCreateRequest orderReq = new OrderCreateRequest(
            listing.id(), BigDecimal.valueOf(10.0), DeliveryType.PICKUP, "Manchar Point",
            PaymentMethod.PAY_ON_PICKUP, "Test idempotency", "IDEMP-UNIQUE-777"
        );

        // First click
        OrderResponse orderFirst = orderService.createOrder(testBuyer, orderReq);

        // Second click with same idempotency key (simulating network retry or double-click)
        OrderResponse orderSecond = orderService.createOrder(testBuyer, orderReq);

        // Must return identical order number and not deduct stock twice!
        assertEquals(orderFirst.orderNumber(), orderSecond.orderNumber());

        var updatedListing = cropListingService.getListingById(listing.id());
        // Initial 50 kg minus 10 kg once = exactly 40 kg left
        assertEquals(0, BigDecimal.valueOf(40.0).compareTo(updatedListing.availableQuantity()));
    }

    @Test
    @DisplayName("Strict order lifecycle progression and illegal state transition rejection")
    @Transactional
    void testStrictOrderLifecycle() {
        ListingCreateRequest req = new ListingCreateRequest(
            "Cabbage", "कोबी", "पत्ता गोभी", "Vegetables", "Crisp heads",
            null, BigDecimal.valueOf(100.0), "kg", BigDecimal.valueOf(18.0),
            "Grade A", "Manchar", "Pune", "Maharashtra", true, true
        );
        ListingResponse listing = cropListingService.createListing(testFarmer, req);

        OrderCreateRequest orderReq = new OrderCreateRequest(
            listing.id(), BigDecimal.valueOf(10.0), DeliveryType.DELIVERY, "Home Address, Pune",
            PaymentMethod.CASH_ON_DELIVERY, "Standard delivery", "IDEMP-LIFECYCLE-1"
        );
        OrderResponse order = orderService.createOrder(testBuyer, orderReq);
        assertEquals(OrderStatus.PLACED, order.status());

        final Long orderId = order.id();
        // Attempting to jump directly from PLACED to DELIVERED must be rejected!
        assertThrows(IllegalOrderStateTransitionException.class, () ->
            orderService.updateStatus(testFarmer, orderId, OrderStatus.DELIVERED)
        );

        // Correct sequence: PLACED -> ACCEPTED -> CONFIRMED -> PACKED -> SHIPPED -> DELIVERED -> COMPLETED
        order = orderService.updateStatus(testFarmer, order.id(), OrderStatus.ACCEPTED);
        assertEquals(OrderStatus.ACCEPTED, order.status());

        order = orderService.updateStatus(testFarmer, order.id(), OrderStatus.CONFIRMED);
        assertEquals(OrderStatus.CONFIRMED, order.status());

        order = orderService.updateStatus(testFarmer, order.id(), OrderStatus.PACKED);
        assertEquals(OrderStatus.PACKED, order.status());

        order = orderService.updateStatus(testFarmer, order.id(), OrderStatus.SHIPPED);
        assertEquals(OrderStatus.SHIPPED, order.status());

        order = orderService.updateStatus(testBuyer, order.id(), OrderStatus.DELIVERED);
        assertEquals(OrderStatus.DELIVERED, order.status());

        order = orderService.updateStatus(testBuyer, order.id(), OrderStatus.COMPLETED);
        assertEquals(OrderStatus.COMPLETED, order.status());
        assertEquals(PaymentStatus.COMPLETED, order.paymentStatus());

        // Now buyer can submit a review
        ReviewResponse review = reviewService.createReview(testBuyer, new ReviewCreateRequest(order.id(), 5, "Super fresh cabbage!"));
        assertNotNull(review);
        assertEquals(5, review.rating());
    }

    @Test
    @DisplayName("Negotiation workflow: Offer -> Counter -> Acceptance converts to Order at agreed rate")
    @Transactional
    void testNegotiationFlow() {
        ListingCreateRequest req = new ListingCreateRequest(
            "Bulk Soybeans", "सोयाबीन", "सोयाबीन", "Grains", "Yellow Soybeans",
            null, BigDecimal.valueOf(500.0), "kg", BigDecimal.valueOf(50.0),
            "Grade A", "Latur", "Latur", "Maharashtra", true, false
        );
        ListingResponse listing = cropListingService.createListing(testFarmer, req);

        // Buyer offers ₹42/kg for 100 kg
        OfferCreateRequest offerReq = new OfferCreateRequest(listing.id(), BigDecimal.valueOf(42.0), BigDecimal.valueOf(100.0), "Can you offer ₹42?");
        OfferResponse offer = offerService.createOffer(testBuyer, offerReq);
        assertEquals(OfferStatus.PENDING, offer.status());

        // Farmer counters at ₹45/kg
        offer = offerService.counterOffer(testFarmer, offer.id(), new CounterOfferRequest(BigDecimal.valueOf(45.0), "Best rate is ₹45"));
        assertEquals(OfferStatus.COUNTERED, offer.status());
        assertEquals(BigDecimal.valueOf(45.0), offer.counterPrice());

        // Buyer accepts counter offer
        offer = offerService.acceptOffer(testBuyer, offer.id());
        assertEquals(OfferStatus.CONSUMED, offer.status());

        // Verify stock reduced by 100 kg
        var updatedListing = cropListingService.getListingById(listing.id());
        assertEquals(0, BigDecimal.valueOf(400.0).compareTo(updatedListing.availableQuantity()));
    }

    @Test
    @DisplayName("AI Market Explainer never invents numbers and uses verified records")
    void testAiMarketExplainer() {
        PriceExplanationResponse response = aiAdvisoryService.explainPrice(
            new PriceExplanationRequest("Tomato", "Pune APMC", BigDecimal.valueOf(28.0), BigDecimal.valueOf(2.0))
        );

        assertNotNull(response.storedModalPrice());
        assertEquals("Pune APMC", response.marketName());
        assertTrue(response.aiAnalysis().contains("verified data from"));
        assertTrue(response.disclaimer().contains("Historical trend analysis"));

        // For non-existent crop, must return clear unavailability message
        PriceExplanationResponse unavailable = aiAdvisoryService.explainPrice(
            new PriceExplanationRequest("DragonfruitXYZ", "Nowhere", null, null)
        );
        assertTrue(unavailable.aiAnalysis().contains("Verified market price is currently unavailable"));
    }

    @Test
    @DisplayName("FARMER can successfully create a crop listing")
    @Transactional
    void testFarmerCanCreateListing() {
        ListingCreateRequest req = new ListingCreateRequest(
            "Alphonso Mango", "आंबा", "आम", "Fruits", "GI-tagged Devgad Alphonso mangoes",
            null, BigDecimal.valueOf(300.0), "kg", BigDecimal.valueOf(180.0),
            "Premium", "Devgad", "Sindhudurg", "Maharashtra", true, false
        );

        // FARMER creates listing — must succeed with ACTIVE status
        ListingResponse response = cropListingService.createListing(testFarmer, req);

        assertNotNull(response, "createListing must return a response for a FARMER");
        assertNotNull(response.id(), "Created listing must have a database-assigned ID");
        assertEquals("Alphonso Mango", response.cropName());
        assertEquals("ACTIVE", response.status().name());
        assertEquals(testFarmer.getPhone(), response.farmer().phone(),
            "Created listing must be attributed to the authenticated farmer");
        assertEquals(0, BigDecimal.valueOf(300.0).compareTo(response.availableQuantity()),
            "Quantity must match what was submitted");
        assertEquals(0, BigDecimal.valueOf(180.0).compareTo(response.pricePerUnit()),
            "Price per unit must match what was submitted");
    }

    @Test
    @DisplayName("CONSUMER cannot create a crop listing — must get 403 UnauthorizedException")
    @Transactional
    void testConsumerCannotCreateListing() {
        User consumerUser = userRepository.findByPhone("9876543220").orElseGet(() -> {
            var res = authService.register(new RegisterRequest(
                "9876543220", "password123", "Pooja Deshmukh",
                Role.CONSUMER, "Kothrud", "Pune", "Maharashtra", "en"
            ));
            return userRepository.findById(res.user().id()).orElseThrow();
        });

        // Confirm this user is definitely a CONSUMER
        assertEquals(Role.CONSUMER, consumerUser.getRole(),
            "Test pre-condition: user 9876543220 must be CONSUMER");

        ListingCreateRequest req = new ListingCreateRequest(
            "Fraudulent Listing", null, null, "Vegetables", "Should be rejected",
            null, BigDecimal.valueOf(50.0), "kg", BigDecimal.valueOf(30.0),
            "Grade B", "Kothrud", "Pune", "Maharashtra", false, false
        );

        // CONSUMER submitting — must throw UnauthorizedOperationException
        com.kisansetu.exception.UnauthorizedOperationException ex = assertThrows(
            com.kisansetu.exception.UnauthorizedOperationException.class,
            () -> cropListingService.createListing(consumerUser, req),
            "A CONSUMER must not be allowed to create a crop listing"
        );
        assertTrue(ex.getMessage().contains("Only farmers"),
            "Exception message must clearly state only farmers can create listings");
    }

    @Test
    @DisplayName("WHOLESALER cannot create a crop listing — must get 403 UnauthorizedException")
    @Transactional
    void testWholesalerCannotCreateListing() {
        User wholesaler = userRepository.findByPhone("9876543230").orElseGet(() -> {
            var res = authService.register(new RegisterRequest(
                "9876543230", "password123", "Apex Fresh Produce Ltd",
                Role.WHOLESALER, "Vashi APMC", "Navi Mumbai", "Maharashtra", "en"
            ));
            return userRepository.findById(res.user().id()).orElseThrow();
        });

        assertEquals(Role.WHOLESALER, wholesaler.getRole(),
            "Test pre-condition: user 9876543230 must be WHOLESALER");

        ListingCreateRequest req = new ListingCreateRequest(
            "Bulk Wholesaler Listing", null, null, "Grains", "Should be rejected",
            null, BigDecimal.valueOf(5000.0), "kg", BigDecimal.valueOf(22.0),
            "Grade A", "Vashi", "Navi Mumbai", "Maharashtra", true, true
        );

        com.kisansetu.exception.UnauthorizedOperationException ex = assertThrows(
            com.kisansetu.exception.UnauthorizedOperationException.class,
            () -> cropListingService.createListing(wholesaler, req),
            "A WHOLESALER must not be allowed to create a crop listing"
        );
        assertTrue(ex.getMessage().contains("Only farmers"),
            "Exception message must clearly state only farmers can create listings");
    }

    @Test
    @DisplayName("Published crop appears immediately in farmer's own listing endpoint (GET /api/products/farmer/{id})")
    @Transactional
    void testPublishedCropAppearsInFarmerListings() {
        // Publish a new crop as the farmer
        ListingCreateRequest req = new ListingCreateRequest(
            "Devgad Cashew", "काजू", "काजू", "Fruits", "Premium sun-dried Devgad cashews",
            null, BigDecimal.valueOf(80.0), "kg", BigDecimal.valueOf(620.0),
            "Premium", "Devgad", "Sindhudurg", "Maharashtra", true, false
        );
        ListingResponse created = cropListingService.createListing(testFarmer, req);
        assertNotNull(created.id(), "Published crop must have a DB-assigned ID");

        // Immediately retrieve via the farmer-specific endpoint
        List<ListingResponse> farmerListings = cropListingService.getFarmerListings(testFarmer.getId());

        boolean found = farmerListings.stream().anyMatch(l -> l.id().equals(created.id()));
        assertTrue(found,
            "The just-published crop (id=" + created.id() + ") must appear in getFarmerListings immediately. " +
            "If it is missing, the dashboard will fail to show it after publishing.");

        // Verify attributes
        ListingResponse match = farmerListings.stream()
            .filter(l -> l.id().equals(created.id())).findFirst().orElseThrow();
        assertEquals("Devgad Cashew", match.cropName());
        assertEquals(ListingStatus.ACTIVE, match.status());
        assertEquals(testFarmer.getPhone(), match.farmer().phone());
    }

    @Test
    @DisplayName("Published crop appears immediately in marketplace active listings (GET /api/products)")
    @Transactional
    void testPublishedCropAppearsInMarketplace() {
        // Record how many active listings exist before
        int before = cropListingService.getActiveListings().size();

        ListingCreateRequest req = new ListingCreateRequest(
            "Nashik Grape", "द्राक्ष", "अंगूर", "Fruits", "Thomson seedless grapes",
            null, BigDecimal.valueOf(200.0), "kg", BigDecimal.valueOf(75.0),
            "Grade A", "Nashik", "Nashik", "Maharashtra", true, true
        );
        ListingResponse created = cropListingService.createListing(testFarmer, req);

        // Marketplace (public) endpoint must now return one more listing
        List<ListingResponse> marketListings = cropListingService.getActiveListings();
        assertEquals(before + 1, marketListings.size(),
            "After publishing, the marketplace active listing count must increase by exactly 1");

        boolean found = marketListings.stream().anyMatch(l -> l.id().equals(created.id()));
        assertTrue(found,
            "The just-published crop must be visible in the public marketplace listing immediately");
    }

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Test
    @DisplayName("CORS preflight from production Vercel frontend is allowed with correct headers")
    void testCorsPreflightFromProductionVercel() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/products")
                .header("Origin", "https://kisan-setu-bbdw7gv4l-pranav-eea6.vercel.app")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type,authorization"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string(
                "Access-Control-Allow-Origin", "https://kisan-setu-bbdw7gv4l-pranav-eea6.vercel.app"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string(
                "Access-Control-Allow-Credentials", "true"));
    }
}

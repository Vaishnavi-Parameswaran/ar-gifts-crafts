// App Configuration - Sri Lanka Settings
// This file contains all configurable settings for the application

export const config = {
    // Site Information
    siteName: 'AR ONE Gifts & Crafts',
    tagline: 'Unique Handmade Treasures',

    // Country-specific Settings
    country: 'Sri Lanka',
    countryCode: 'LK',

    // Currency Settings
    currency: {
        code: 'LKR',
        symbol: 'Rs.',
        name: 'Sri Lankan Rupee',
        // Format price with currency symbol
        format: (amount) => `Rs. ${amount?.toLocaleString('en-LK') || '0'}`
    },

    // Phone Format
    phoneFormat: '+94 XX XXX XXXX',
    phonePrefix: '+94',

    // Shipping Settings
    shipping: {
        freeShippingThreshold: 5000, // Free shipping above Rs. 5,000
        standardCost: 250,
        expressCost: 500,
        sameDayCost: 750,
        estimatedDays: {
            standard: '5-7',
            express: '2-3',
            sameDay: '1'
        }
    },

    // Address Labels (Sri Lanka specific)
    addressLabels: {
        state: 'Province/District',
        pincode: 'Postal Code',
        country: 'Sri Lanka'
    },

    // Bank Details Labels (Sri Lanka specific)
    bankLabels: {
        branchIdentifier: 'Branch Code',
        swiftCode: 'SWIFT/BIC Code',
        taxId: 'TIN/VAT Number'
    },

    // Common Sri Lankan Banks
    banks: [
        'Bank of Ceylon',
        'People\'s Bank',
        'Commercial Bank of Ceylon',
        'Hatton National Bank',
        'Sampath Bank',
        'Seylan Bank',
        'Nations Trust Bank',
        'DFCC Bank',
        'National Development Bank',
        'Union Bank of Colombo'
    ],

    // Sri Lankan Provinces
    provinces: [
        'Western Province',
        'Central Province',
        'Southern Province',
        'Northern Province',
        'Eastern Province',
        'North Western Province',
        'North Central Province',
        'Uva Province',
        'Sabaragamuwa Province'
    ],

    // Major Cities
    cities: [
        'Colombo',
        'Kandy',
        'Galle',
        'Jaffna',
        'Negombo',
        'Batticaloa',
        'Trincomalee',
        'Anuradhapura',
        'Matara',
        'Kurunegala'
    ],

    // Contact Information
    contact: {
        phone: '+94 11 234 5678',
        email: 'support@arone-gifts.lk',
        address: '123 Galle Road, Colombo 03, Sri Lanka',
        workingHours: 'Mon - Sat: 9:00 AM - 6:00 PM'
    }
};

// Helper function to format currency
export const formatCurrency = (amount) => config.currency.format(amount);

// Helper function to format price with sale
export const formatPrice = (price, salePrice = null) => {
    if (salePrice && salePrice < price) {
        return {
            current: config.currency.format(salePrice),
            original: config.currency.format(price),
            savings: config.currency.format(price - salePrice),
            discount: Math.round(((price - salePrice) / price) * 100)
        };
    }
    return {
        current: config.currency.format(price),
        original: null,
        savings: null,
        discount: 0
    };
};

export default config;
